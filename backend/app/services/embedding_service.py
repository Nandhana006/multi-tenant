"""Local Sentence-Transformers Embedding Service"""
import logging
from typing import List
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}...")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info(" Embedding model loaded successfully.")
        return self._model

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding vector for a single string."""
        model = self._get_model()
        cleaned_text = text.replace("\n", " ").strip()
        embedding = model.encode(cleaned_text)
        return embedding.tolist()

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of strings."""
        if not texts:
            return []
        model = self._get_model()
        cleaned = [t.replace("\n", " ").strip() for t in texts]
        embeddings = model.encode(cleaned, show_progress_bar=False)
        return embeddings.tolist()

embedding_service = EmbeddingService()
