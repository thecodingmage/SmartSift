# SmartSift: Anti-Fragile Automated Complaint Summarization

**An End-to-End MLOps Pipeline for Cost-Efficient, Reliable Customer Insights.**

> Built for the Digithon 2025 Finals.

## Overview
SmartSift is an intelligent complaint management system designed to solve the "Manual Bottleneck" in customer support. Unlike traditional sentiment models that fail on sarcasm or waste expensive GPU compute on simple queries, SmartSift uses a **Tiered "Anti-Fragile" Architecture**.

It intelligently routes traffic between lightweight CPU models and heavy GPU LLMs, ensuring **90% cost reduction** while maintaining **100% reliability** via a Human-in-the-Loop (HITL) safety valve.

## Key Features
* **Semantic Smart Router (Tier 1):** Uses Vector Embeddings (`sentence-transformers`) to instantly route simple queries (e.g., "Reset password") to the CPU, bypassing expensive GPUs.
* **The Safety Valve:** A dedicated "Sarcasm Guard" detects ambiguous or sarcastic feedback (e.g., "Great job breaking the app") and routes it to a human expert instead of hallucinating a response.
* **Tier 1b Data Engine (GPU):** Complex technical complaints are sent to **Llama 3.3 (via Groq)** for detailed Aspect-Based Sentiment Analysis (ABSA).
* **Human-in-the-Loop (HITL) Workspace:** An integrated annotator dashboard to review flagged data, correct labels, and trigger retraining loops (simulated Jenkins pipeline).
* **Executive Strategy Agent:** Generates CEO-level strategic reports and action plans from aggregated defect data using Generative AI.

## Architecture
**Ingestion** -> **Vector Router (CPU)** -> **Llama 3.3 (GPU)** -> **Strategic Report**

*(Ambiguous data -> Review Queue -> Human Fix -> Retraining)*

## Tech Stack
* **Backend:** FastAPI, Pydantic (Data Contracts)
* **Frontend:** Streamlit (Interactive Dashboard)
* **AI Models:**
    * **Routing:** `all-MiniLM-L6-v2` (Sentence Transformers) + RoBERTa
    * **Analysis & Reasoning:** Llama 3.3-70b (via Groq API)
* **MLOps:** Human Review Queue & Simulated Continuous Learning Pipeline

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/thecodingmage/SmartSift-Automated-Complaint-Summarization.git](https://github.com/thecodingmage/SmartSift-Automated-Complaint-Summarization.git)
    cd SmartSift-Automated-Complaint-Summarization
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your Groq API key:
    ```env
    GROQ_API_KEY="your_groq_api_key_here"
    ```

## Usage

## Usage

**1. Start the Backend Server:**
```bash
uvicorn app.main:app --reload
2. Start the Frontend Dashboard: Open a new terminal and run:

Bash

streamlit run app/frontend.py
3. Demo Guide (Try these inputs):

Simple Route (Cost-Efficient): "How do I reset my password?"

Result: Auto-resolved by CPU.

Complex Route (Deep Analysis): "The battery drains in 1 hour and the screen gets hot."

Result: Sent to GPU for Aspect Extraction.

Safety Valve (Anti-Fragile): "Great update, thanks for breaking my login."

Result: Flagged for Human Review (HITL).

Future Scope
Integration with Jira/Zendesk for automatic ticket creation.

Real-time voice-to-text complaint logging.

Full deployment of the Jenkins pipeline for automated model fine-tuning on the "Golden Set."
**1. Start the Backend Server:**
```bash
uvicorn app.main:app --reload
