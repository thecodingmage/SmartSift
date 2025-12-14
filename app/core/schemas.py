from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# --- 1. INPUT CONTRACT ---
# This validates the data coming from the Frontend/API
class ComplaintInput(BaseModel):
    id: str
    text: str = Field(..., min_length=5, description="Customer complaint text")

# --- 2. ROUTER OUTPUT (Tier 1a) ---
# This defines what our Router returns
class RoutingDecision(BaseModel):
    decision: Literal["Simple", "Complex", "Review_Queue"]
    confidence: float
    tags: List[str] = []
    reason: str

# ... (Keep ComplaintInput and RoutingDecision classes as they are) ...

# --- 3. UPDATED ANALYSIS OUTPUT (Tier 1b - GPU) ---
# Now includes a "status" field so the LLM can reject the data.
class SentimentAspect(BaseModel):
    aspect: str
    sentiment: str
    severity: str

class DetailedAnalysis(BaseModel):
    complaint_id: str
    status: Literal["Success", "Review_Queue"]  # <--- New Field
    flag_reason: Optional[str] = None            # <--- Why did it fail?
    aspects: List[SentimentAspect] = []
    summary: str