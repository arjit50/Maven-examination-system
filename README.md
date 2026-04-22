# 🎓 Maven Online Examination System

Maven is a premium, full-stack online examination platform designed for modern educational needs. Built with a focus on **integrity, performance, and user experience**, it provides a seamless environment for teachers to manage assessments and for students to demonstrate their knowledge.

![Maven Banner](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## ✨ Key Features

### 👨‍🏫 For Educators (Teachers)
- **Advanced Exam Creator**: Design comprehensive exams with Multiple Choice (MCQ) or True/False questions.
- **Study Material Management**: Upload PDFs and share video links to assist student preparation.
- **In-depth Analytics**: Visualize student performance with detailed exam analysis and average score tracking.
- **Question Bank**: Manage a library of questions per exam.

### 👨‍🎓 For Learners (Students)
- **Real-time Exam Environment**: Take exams in a secure, timed interface.
- **Integrity Protection**: Anti-cheat system that detects tab switching and window minimization (3 warnings trigger auto-submission).
- **Result Dashboard**: Instant feedback and history of all attempted exams.
- **Study Hub**: Access curated materials provided by instructors.

### 🤖 Smart Features
- **Maven AI Assistant**: A Groq-powered (Llama 3) chatbot to guide users through the platform's features and policies.
- **Dynamic UI/UX**: Ultra-smooth animations powered by GSAP and Framer Motion.
- **Theme Support**: Seamless transition between Dark and Light modes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Animations**: GSAP & Framer Motion
- **Styling**: Vanilla CSS (Premium Design System)
- **Icons**: Lucide React
- **Routing**: React Router Dom

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **AI Integration**: Groq SDK
- **Authentication**: JWT & BcryptJS
- **File Handling**: Multer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Groq API Key (for the AI Assistant)

### 1. Clone the Repository
```bash
git clone https://github.com/arjit50/Maven-examination-system.git
cd Maven-examination-system
```

### 2. Server Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=your_groq_api_key
```
**Seed initial data (Teacher & Student accounts):**
```bash
node seed.js
```
*Default Credentials:*
- Teacher: `teacher@example.com` / `password123`
- Student: `student@example.com` / `password123`

### 3. Client Setup
```bash
cd ../client
npm install
npm run dev
```

---

## 🏗️ Architecture: Modular Monolith
The system follows a **Modular Monolith** pattern. Each feature (Auth, Exams, Submissions, Questions, Chatbot) is encapsulated in its own module within the `server/modules` directory. This ensures high maintainability and makes the system "Microservice-ready".

For details on the future scaling strategy, see [SCALABILITY.md](SCALABILITY.md).

## 🛡️ Security & Integrity
- **JWT Authentication**: Secure stateless sessions.
- **Password Hashing**: BcryptJS for sensitive data protection.
- **Exam Lock-down**: Browser focus tracking to prevent unauthorized resource access during exams.

---

## 📄 License
This project is licensed under the ISC License.

---
*Developed with ❤️ by the Maven Team.*
