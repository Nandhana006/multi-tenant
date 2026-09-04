"""Lightweight Multi-Tenant Embedding Service (FastEmbed / ONNX with SentenceTransformer Fallback)"""
import logging
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None
    _engine = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def _get_model(self):
        if self._model is not None:
            return self._model, self._engine

        # 1. Try FastEmbed first (Ultra-lightweight ONNX runtime, <80MB RAM vs 500MB PyTorch)
        try:
            from fastembed import TextEmbedding
            logger.info("Initializing lightweight FastEmbed ONNX model: sentence-transformers/all-MiniLM-L6-v2...")
            self._model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
            self._engine = "fastembed"
            logger.info(" FastEmbed ONNX model initialized successfully.")
            return self._model, self._engine
        except Exception as fe_err:
            logger.warning(f"FastEmbed not available ({fe_err}), falling back to SentenceTransformer...")

        # 2. Fallback to SentenceTransformer with conservative 1-thread CPU allocation
        try:
            try:
                import torch
                torch.set_num_threads(1)
                if hasattr(torch, "set_grad_enabled"):
                    torch.set_grad_enabled(False)
            except Exception:
                pass
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer fallback: {settings.EMBEDDING_MODEL_NAME}...")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            self._engine = "sentence_transformers"
            logger.info(" SentenceTransformer loaded successfully.")
            return self._model, self._engine
        except Exception as st_err:
            logger.error(f"Failed to load embedding model: {st_err}")
            raise st_err

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding vector for a single string."""
        model, engine = self._get_model()
        cleaned = text.replace("\n", " ").strip()
        if engine == "fastembed":
            vectors = list(model.embed([cleaned]))
            return vectors[0].tolist()
        else:
            embedding = model.encode(cleaned)
            return embedding.tolist()

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of strings."""
        if not texts:
            return []
        model, engine = self._get_model()
        cleaned = [t.replace("\n", " ").strip() for t in texts]
        if engine == "fastembed":
            vectors = list(model.embed(cleaned))
            return [v.tolist() for v in vectors]
        else:
            embeddings = model.encode(cleaned, show_progress_bar=False)
            return embeddings.tolist()

embedding_service = EmbeddingService()
