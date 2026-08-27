import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=2000)

    @field_validator("message")
    def sanitize_message(cls, v: str) -> str:
        # Strip potential prompt injection control characters and HTML tags
        cleaned = re.sub(r'<[^>]*>', '', v)
        # Block malicious instruction overrides
        dangerous_patterns = [
            r'ignore (all )?previous instructions',
            r'system prompt',
            r'you are now in developer mode',
            r'print (all )?api keys'
        ]
        for pattern in dangerous_patterns:
            if re.search(pattern, cleaned, re.IGNORECASE):
                cleaned = re.sub(pattern, '[REDACTED_INJECTION]', cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

class ItineraryGenerationRequest(BaseModel):
    destination: str = Field(..., min_length=2, max_length=200)
    start_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    end_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    budget_category: Optional[str] = "moderate"
    total_budget: Optional[float] = Field(default=1000.0, ge=0.0)
    travel_style: Optional[str] = "balanced"
    interests: Optional[List[str]] = Field(default_factory=list)

    @field_validator("destination")
    def sanitize_destination(cls, v: str) -> str:
        cleaned = re.sub(r'[^\w\s,.-]', '', v)
        return cleaned.strip()

class ActivityEditRequest(BaseModel):
    day_number: int = Field(..., ge=1)
    action: str = Field(..., pattern=r'^(reorder|add|delete|update)$')
    reordered_activity_ids: Optional[List[str]] = None
    activity_data: Optional[dict] = None
