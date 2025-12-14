import os
from groq import Groq
import json
from dotenv import load_dotenv
from app.core.schemas import DetailedAnalysis

# Load API Key from .env file
load_dotenv()
# This tells Python to look for "GROQ_API_KEY" in the .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key="GROQ_API_KEY")

# ... (Keep imports and generate_executive_report) ...

def analyze_complex_complaint(text: str, complaint_id: str) -> DetailedAnalysis:
    """
    Tier 1b: Performs ABSA *AND* Sarcasm Detection.
    """
    
    # NEW PROMPT: The "Electronics Expert" Logic
    system_prompt = """
    You are a Senior Technical Support AI for a Consumer Electronics Retailer.
    Analyze the customer complaint.

    STEP 1: Sarcasm & Validity Check
    - If the text is sarcastic (e.g., "Great paperweight"), ambiguous, or lacks technical details, reject it.
    - Set "status" to "Review_Queue" and "flag_reason" to explain why.

    STEP 2: Technical Extraction (If valid)
    - Identify the Device (e.g., Laptop, Phone, Headphones).
    - Identify the Specific Defect (e.g., Battery Drain, Bluetooth Pairing, Dead Pixel).
    - Determine Severity (Low/Medium/High).
    - Set "status" to "Success".

    OUTPUT JSON FORMAT:
    {
        "complaint_id": "...",
        "status": "Success" OR "Review_Queue",
        "flag_reason": "...",
        "aspects": [ 
            {"aspect": "Device: [Name]", "sentiment": "Negative", "severity": "High"},
            {"aspect": "Issue: [Defect]", "sentiment": "Negative", "severity": "High"} 
        ],
        "summary": "Concise technical summary of the issue."
    }
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Complaint ID: {complaint_id}\nText: {text}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        raw_json = completion.choices[0].message.content
        data = json.loads(raw_json)
        
        # Pydantic validation handles the structure
        return DetailedAnalysis(**data)

    except Exception as e:
        print(f"LLM Error: {e}")
        return None
    


# ... (Keep existing imports and analyze_complex_complaint function above) ...

def generate_executive_report(data_context: dict) -> dict:
    """
    Returns Structured JSON for the Strategy Dashboard.
    """
    if not GROQ_API_KEY:
        return {"error": "API Key Missing"}

    # 1. THE PROMPT
    # We explicitly ask for a LIST of strings for the plan to prevent JSON breakage
    system_prompt = f"""
    You are a Senior Product Strategy AI. 
    Analyze the following customer complaints and generate a structured JSON report.

    INPUT DATA (Recent Complaints):
    {json.dumps(data_context.get('recent_complaints', []), indent=2)}

    OUTPUT FORMAT (JSON ONLY):
    {{
        "top_issues": [
            {{ "issue": "Short Name (e.g. Overheating)", "count": Int, "severity": "High"|"Medium"|"Low" }}
        ],
        "remediation_steps": [
            "Actionable step 1",
            "Actionable step 2",
            "Actionable step 3"
        ]
    }}

    RULES:
    1. Identify exactly 3 distinct technical clusters.
    2. "remediation_steps": Provide 3-4 specific engineering actions. Do not use asterisks or bullet points inside the strings.
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate structured JSON report."}
            ],
            temperature=0.1, 
            response_format={"type": "json_object"}
        )
        
        # 2. PARSE AND FORMAT
        raw_data = json.loads(completion.choices[0].message.content)
        
        # Convert list of steps back to a single string for the frontend
        plan_text = ""
        if "remediation_steps" in raw_data and isinstance(raw_data["remediation_steps"], list):
            plan_text = "\n\n".join([f"• {step}" for step in raw_data["remediation_steps"]])
        elif "remediation_plan" in raw_data:
            plan_text = raw_data["remediation_plan"]
            
        return {
            "top_issues": raw_data.get("top_issues", []),
            "remediation_plan": plan_text
        }

    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "top_issues": [],
            "remediation_plan": "Unable to generate plan due to processing error."
        }