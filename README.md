# 🧭 Smart Career Advisor - AI-Powered Career Path Recommendation System
A sophisticated web application that analyzes user profiles, skills, and resumes to recommend optimal career paths using AI and deterministic scoring algorithms.

---

## 🏆 GenAI Exchange Hackathon Project

This project was developed for the GenAI Exchange Hackathon, showcasing advanced AI integration with modern web development practices.

---

**Note:** This project has been uniquely built leveraging Generative AI tools (ChatGPT, DeepSeek, and OpenAI APIs). While core code generation was AI-assisted, the real challenge—prompt engineering, code restructuring, debugging, integration, feature management, and deployment—was entirely done by me. This demonstrates how AI can accelerate development, but the vision, problem-solving, and execution behind the project are 100% human-driven.  
Made with ❤️ by **Asim Husain** www.asimhusain.dev

![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2.0-38B2AC)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)

---

## ✨ Features

- **Resume Parsing**: PDF resume extraction and text analysis  
- **AI Skill Detection**: OpenAI-powered skill extraction and normalization  
- **Role Matching**: Intelligent career path recommendations  
- **Interactive Visualizations**: Beautiful charts and data visualizations  
- **Modern UI/UX**: Dark theme with smooth animations and responsive design  
- **Secure Architecture**: Protected API keys and rate limiting  

---

## 🛠️ Tech Stack

**Frontend**: React 18, TailwindCSS, Framer Motion, Recharts  
**Backend**: FastAPI, Python, PyPDF2, OpenAI API  
**Deployment**: Docker, Docker Compose  

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-career-advisor.git

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate   # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload

# Setup frontend (use another terminal)
cd ../frontend
npm install
npm start

# Open your browser at http://localhost:3000 to see the app running
