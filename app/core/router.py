import torch
from sentence_transformers import SentenceTransformer, util
from app.core.schemas import RoutingDecision

print("Loading Models...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ------------------------------------------------------------------
# SIMPLE ANCHORS (Admin / Praise)
# ------------------------------------------------------------------
simple_anchors = [
    # Admin / Account / Shipping
    "reset password", "forgot my password", "cannot login", "login issue",
    "where is my invoice", "request invoice", "refund request", "cancel subscription",
    "payment failed", "where is my receipt", "shipping status", "track my order",
    "return policy", "warranty check", "change address",

    # Pure Praise
    "great product", "excellent service", "very happy with the purchase",
    "amazing experience", "fast delivery", "packaging was perfect"
]

simple_embeddings = embedder.encode(simple_anchors, convert_to_tensor=True)

# ------------------------------------------------------------------
# ROUTER LOGIC
# ------------------------------------------------------------------
def route_complaint(text: str) -> RoutingDecision:
    text_lower = text.lower()

    # 1. VECTOR SIMILARITY (The "Vibe" Check)
    user_embedding = embedder.encode(text, convert_to_tensor=True)
    scores = util.cos_sim(user_embedding, simple_embeddings)
    best_score = torch.max(scores).item()

    # 2. ADMIN KEYWORDS (100% Simple)
    admin_map = {
        "invoice": "Billing/Account", "billing": "Billing/Account",
        "refund": "Billing/Account", "subscription": "Billing/Account",
        "payment": "Billing/Account", "receipt": "Billing/Account",
        "password": "Authentication", "login": "Authentication",
        "shipping": "Logistics", "delivery": "Logistics",
        "tracking": "Logistics", "order status": "Logistics",
        "return": "Returns/Warranty", "warranty": "Returns/Warranty"
    }

    admin_tag = None
    for keyword, tag in admin_map.items():
        if keyword in text_lower:
            admin_tag = tag
            break

    # 3. TECHNICAL KEYWORDS (Trigger GPU Tier)
    # Covers: Phones, Laptops, Audio, Wearables
    technical_keywords = [
        # Hardware
        "battery", "screen", "display", "pixel", "keyboard", "mouse", "trackpad",
        "hinge", "port", "usb", "charger", "charging", "fan", "noise", "overheat",
        "camera", "lens", "focus", "button", "switch", "sensor", "bluetooth", "wifi",
        "connection", "pairing", "sound", "audio", "speaker", "microphone", "mic",
        
        # Software / Performance
        "crash", "freeze", "lag", "slow", "update", "firmware", "install", "boot",
        "loop", "glitch", "error", "blue screen", "shut down", "won't turn on"
    ]
    is_technical = any(word in text_lower for word in technical_keywords)

    # 4. NEGATIVE / SARCASM TRIGGERS
    negative_keywords = [
        "bad", "terrible", "worst", "hate", "broken", "awful", "useless",
        "disappointed", "waste", "garbage", "trash", "fail", "scam", "nightmare",
        "never buy", "joke", "ridiculous"
    ]
    is_negative = any(word in text_lower for word in negative_keywords)

    # 5. CONTRAST (Mixed Sentiment)
    contrast_keywords = ["but", "however", "although", "except", "despite"]
    has_contrast = any(w in text_lower for w in contrast_keywords)

    # --- DECISION LOGIC ---

    # CASE A: Technical/Complex -> GPU Tier
    if is_technical or is_negative or has_contrast:
        reason = "Technical content" if is_technical else "Negative/Mixed sentiment detected"
        return RoutingDecision(
            decision="Complex",
            confidence=0.0,
            tags=["Technical Support"],
            reason=f"Routed to Llama 3: {reason}"
        )

    # CASE B: Clear Admin -> Simple
    if admin_tag:
        return RoutingDecision(
            decision="Simple",
            confidence=0.95,
            tags=[admin_tag],
            reason=f"Auto-Resolved: {admin_tag}"
        )

    # CASE C: Pure Praise -> Simple
    if best_score > 0.45:
        return RoutingDecision(
            decision="Simple",
            confidence=round(best_score, 2),
            tags=["Positive Feedback"],
            reason="Auto-Resolved: Positive Feedback"
        )

    # CASE D: Safety Net -> GPU Tier
    return RoutingDecision(
        decision="Complex",
        confidence=0.0,
        tags=["General Inquiry"],
        reason="Ambiguous input routed for deeper analysis"
    )