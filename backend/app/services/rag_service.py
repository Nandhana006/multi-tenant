"""RAG Orchestration Service with Strict Tenant Context Grounding"""
import logging
from typing import Dict, Any, List
from openai import OpenAI
from app.config import settings
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.schemas import SourceCitation, ChatResponse

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self._init_llm()

    def _init_llm(self):
        try:
            if settings.OPENAI_API_KEY:
                self.client = OpenAI(
                    base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None,
                    api_key=settings.OPENAI_API_KEY
                )
                logger.info(f" LLM client initialized with model: {settings.LLM_MODEL}")
            else:
                self.client = None
                logger.warning(" No OPENAI_API_KEY provided. LLM fallback responses will be used.")
        except Exception as e:
            logger.error(f" Failed to initialize LLM client: {e}")
            self.client = None

    def query(
        self,
        company_id: str,
        company_name: str,
        question: str,
        top_k: int = 6,
        history: List[Dict[str, str]] = None
    ) -> ChatResponse:
        """
        Execute tenant-isolated RAG retrieval and generate grounded or conversational response.
        Supports conversation memory and general conversational questions (greetings, follow-ups).
        """
        clean_question = question.strip()
        history = history or []

        # 1. Contextualize query for vector retrieval if this is a follow-up
        retrieval_query = self._build_retrieval_query(clean_question, history)

        # 2. Generate query embedding
        query_vector = embedding_service.embed_text(retrieval_query)

        # 3. Vector search with MANDATORY company_id filter
        chunks = vector_store.search_chunks(
            company_id=company_id,
            query_embedding=query_vector,
            top_k=top_k
        )

        # Filter out very weak matches
        relevant_chunks = [c for c in chunks if c.get("score", 0) > 0.25]

        # 4. If no relevant policy chunks found, handle conversationally or as general question
        if not relevant_chunks:
            return self._handle_general_or_conversational(
                company_id=company_id,
                company_name=company_name,
                question=clean_question,
                history=history
            )

        # 5. Format source citations
        citations: List[SourceCitation] = []
        for c in relevant_chunks:
            snippet = c.get("text", "")
            if len(snippet) > 250:
                snippet = snippet[:250] + "..."
            citations.append(SourceCitation(
                document_id=c.get("document_id", ""),
                document_name=c.get("document_name", ""),
                chunk_id=c.get("chunk_id", ""),
                snippet=snippet,
                score=round(float(c.get("score", 0.0)), 4)
            ))

        # 6. Build grounded prompt with context excerpts
        context_blocks = []
        for idx, c in enumerate(relevant_chunks, 1):
            context_blocks.append(
                f"--- Excerpt {idx} (Source: {c.get('document_name')}) ---\n{c.get('text')}"
            )
        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            f"You are the official AI HR Assistant for '{company_name}'.\n"
            f"Your role is to assist employees and HR by answering questions accurately based on the provided company policy excerpts.\n\n"
            f"GUIDELINES:\n"
            f"1. Base your answer strictly on the provided policy context excerpts.\n"
            f"2. Cite the source document name and section whenever referencing policies (e.g., 'According to the Employee Handbook...').\n"
            f"3. If a question asks for specific numbers or procedures, explain clearly based on the excerpts.\n"
            f"4. Be professional, direct, and helpful. Use clear bullet points where appropriate.\n"
            f"5. Maintain conversation continuity with previous context where relevant."
        )

        user_content = (
            f"COMPANY POLICY EXCERPTS FOR {company_name.upper()}:\n"
            f"{context_str}\n\n"
            f"EMPLOYEE QUESTION:\n{clean_question}\n\n"
            f"ANSWER:"
        )

        # Build message history for LLM
        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            r = "assistant" if h.get("role") in ["assistant", "ai"] else "user"
            messages.append({"role": r, "content": h.get("content", "")})
        messages.append({"role": "user", "content": user_content})

        answer = self._generate_answer(messages, company_name)

        return ChatResponse(
            question=clean_question,
            answer=answer,
            company_id=company_id,
            company_name=company_name,
            sources=citations,
            grounded=True
        )

    def _build_retrieval_query(self, question: str, history: List[Dict[str, str]]) -> str:
        """Enrich short follow-up questions with recent conversation context."""
        follow_up_cues = ["tell me more", "explain", "more details", "what about", "why", "elaborate", "can you clarify", "how does that work"]
        q_lower = question.lower()
        is_follow_up = len(question.split()) <= 4 or any(cue in q_lower for cue in follow_up_cues)

        if is_follow_up and history:
            # Find the last user question or assistant topic
            recent_user_questions = [h.get("content", "") for h in history if h.get("role") in ["user"] and h.get("content")]
            if recent_user_questions:
                last_q = recent_user_questions[-1]
                return f"{last_q} - {question}"
        return question

    def _handle_general_or_conversational(
        self,
        company_id: str,
        company_name: str,
        question: str,
        history: List[Dict[str, str]]
    ) -> ChatResponse:
        """Handle greetings, conversational follow-ups, and general inquiries via LLM."""
        general_system_prompt = (
            f"You are the official AI HR Assistant for '{company_name}'.\n"
            f"Your role is to assist employees and HR managers with company policies, benefits, leave, workplace guidelines, and general support.\n\n"
            f"GUIDELINES:\n"
            f"1. For greetings (e.g. 'hello', 'hi', 'hey', 'good morning'), reply warmly and introduce yourself as {company_name}'s AI Assistant. Briefly let the user know what you can help with (such as leave policies, insurance, remote work, benefits, and company handbooks).\n"
            f"2. For conversational follow-ups (e.g. 'tell me more', 'thank you', 'can you elaborate?'), use the previous conversation context to provide meaningful continuity or polite responses.\n"
            f"3. For general workplace or HR questions where company documents have not been uploaded yet, provide helpful, industry-standard information while politely clarifying that company-specific rules should be confirmed with their HR department or company handbook.\n"
            f"4. Maintain a warm, polished, and professional tone with neat formatting and bullet points."
        )

        messages = [{"role": "system", "content": general_system_prompt}]
        for h in history[-8:]:
            r = "assistant" if h.get("role") in ["assistant", "ai"] else "user"
            messages.append({"role": r, "content": h.get("content", "")})
        messages.append({"role": "user", "content": question})

        answer = self._generate_answer(messages, company_name)

        return ChatResponse(
            question=question,
            answer=answer,
            company_id=company_id,
            company_name=company_name,
            sources=[],
            grounded=False
        )

    def _generate_answer(self, messages: List[Dict[str, str]], company_name: str) -> str:
        """Call LLM API with graceful fallback."""
        if not self.client:
            return (
                f"Hello! I am your AI Assistant for {company_name}. "
                f"How can I help you with your company policies today?"
            )

        try:
            response = self.client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=600
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f" LLM Generation Error: {e}")
            return (
                f"I encountered a temporary connection issue while processing your question for {company_name}. "
                f"Please try again in a moment."
            )

rag_service = RAGService()
