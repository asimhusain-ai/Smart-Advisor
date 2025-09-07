# 🚀 Smart Career Advisor - AI-Powered Career Path Recommendation System
Note: The Code is completely generated / build by LLMs and APIs (It was allowed by GenAI Exchange Hackathon)! https://asimhusain.vercel.app

![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2.0-38B2AC)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)

A sophisticated web application that analyzes user profiles, skills, and resumes to recommend optimal career paths using AI and deterministic scoring algorithms.

## 🏆 GenAI Exchange Hackathon Project

This project was developed for the GenAI Exchange Hackathon, showcasing advanced AI integration with modern web development practices.

## ✨ Features

- **Resume Parsing**: PDF resume extraction and text analysis
- **AI Skill Detection**: OpenAI-powered skill extraction and normalization
- **Role Matching**: Intelligent career path recommendations
- **Interactive Visualizations**: Beautiful charts and data visualizations
- **Modern UI/UX**: Dark theme with smooth animations and responsive design
- **Secure Architecture**: Protected API keys and rate limiting

## 🛠️ Tech Stack

**Frontend**: React 18, TailwindCSS, Framer Motion, Recharts
**Backend**: FastAPI, Python, PyPDF2, OpenAI API
**Deployment**: Docker, Docker Compose

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-career-advisor.git

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install

# Run the application
docker-compose up


# Run Backend
uvicorn app.main:app --reload

# Run Frontend
npm start
