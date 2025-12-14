SmartSift

Intelligent Complaint Triage System
Digithon 2025 Submission | IIT Guwahati

SmartSift is a high-performance, hybrid AI system designed to transform how customer support teams handle large volumes of product complaints. By combining a low-latency CPU-based router with a high-intelligence GPU-based analyst, SmartSift automates complaint triage, reduces operational costs, and converts raw feedback into actionable engineering insights.

Project Overview

Modern customer support systems suffer from three core problems:

Volume Overload: Thousands of tickets ranging from trivial admin queries to critical hardware failures.

High Latency: Manual triage delays responses and frustrates users.

Lost Intelligence: Recurring product issues remain hidden in unstructured text.

SmartSift addresses these issues using a tiered AI architecture that is fast, cost-efficient, and reliable by design.

System Architecture
Tiered Intelligence Pipeline (The 85/15 Rule)

Tier 1: CPU Router (Local, Low Cost)

Model: Sentence Transformers (MiniLM family)

Function: Instantly classifies incoming complaints using semantic similarity and keyword reasoning.

Outcome: Automatically resolves the majority of routine issues (billing, login, shipping) within milliseconds.

Tier 2: GPU Analyst (Cloud, High Intelligence)

Model: Llama 3 (via Groq API)

Function: Activated only for complex, technical, or negative complaints.

Outcome: Performs deep aspect-based sentiment analysis, identifies affected devices, root causes, and severity.

Human-in-the-Loop (HITL)

Ambiguous or high-risk complaints are routed to an annotator workspace.

Human-validated labels are stored as a Golden Set, enabling continuous improvement and drift mitigation.

Key Features
User Dashboard

Real-time testing of individual complaints.

Transparent routing decisions (CPU vs GPU).

Clear visualization of sentiment, aspect, and system action.

Batch Processing Engine

Upload CSV datasets to simulate enterprise workloads.

Processes mixed complaint types at scale.

Displays efficiency metrics, auto-resolution rate, and actionable tags.

Annotator Workspace

Dedicated interface for reviewing AI-flagged complaints (sarcasm, mixed sentiment).

Human corrections are persisted for future retraining.

Ensures robustness and prevents silent model failure.

Strategic Insights

Aggregates historical complaint data into executive-level insights.

Risk Radar highlights emerging technical failure clusters.

Generates a recommended action plan for engineering and support leadership.

Tech Stack
Component	Technology	Purpose
Frontend	Next.js (React)	High-performance UI
Styling	Tailwind CSS	Modern dark-mode design
Animation	Framer Motion	Smooth transitions and visualizations
Backend	FastAPI (Python)	Async, high-speed APIs
AI (Local)	Sentence Transformers	Zero-latency routing
AI (Cloud)	Llama 3 (Groq API)	Deep complaint analysis
Data Layer	CSV / Pandas	Lightweight MVP persistence
Screenshots

![User Dashboard](frontend\public\docs\screenshots\Screenshot (1847).png)
![Batch Processing](frontend\public\docs\screenshots\Screenshot (1848).png)
![Annotator Workspace](frontend\public\docs\screenshots\Screenshot (1849).png)
![Strategic Insights](frontend\public\docs\screenshots\Screenshot (1850).png)

Local Setup
Backend (FastAPI)
pip install -r requirements.txt
uvicorn app.main:app --reload


Backend runs on:
http://localhost:8000

Frontend (Next.js)
cd frontend
npm install
npm run dev


Frontend runs on:
http://localhost:3000

Important Notes

API keys must never be hard-coded. Use environment variables and keep .env files out of version control.

Generated files such as history_log.csv and human_review_queue.csv are runtime artifacts.

demo_dataset.csv is intentionally included for testing and demonstration.

Future Work

Replace CSV persistence with PostgreSQL and vector databases.

CRM integrations (Zendesk, Salesforce).

Audio complaint analysis via speech-to-text.

Automated retraining pipelines and CI/CD integration.

Contact

For questions, feedback, or collaboration:

Nakibul Islam
Email: nakibul.sci@gmail.com