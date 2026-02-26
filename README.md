# 🚀 TenantFlow

### Multi-Tenant SaaS Task Management System

TenantFlow is a MERN-stack based multi-tenant SaaS platform that enables multiple organizations to manage projects and tasks independently within a shared architecture while maintaining complete data isolation.

This project is developed as a Minor Project for Computer Science & Engineering.

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Frontend

- React (Vite)
- Redux Toolkit
- Tailwind CSS
- Axios

---

## 🏗 Key Features

- Multi-Tenant Architecture (data isolation using `tenantId`)
- JWT-based Authentication
- Role-Based Access Control (Owner, Admin, Member)
- Project Management
- Task Management (Kanban style)
- Secure RESTful APIs

---

## 📂 Project Structure

tenantflow/
│
├── backend/
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ └── server.js
│
├── frontend/
│ ├── src/
│ ├── components/
│ ├── pages/
│ └── App.jsx
│
└── README.md

---

## Setup Instructions

### Clone Repository

git clone https://github.com/tanushkat96/tenantflow.git

cd tenantflow

### 2️⃣ Backend Setup

cd backend
npm install
npm run dev

Backend runs at:

http://localhost:5000

### 3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

---

## 🔐 Environment Variables (Backend)

Create a `backend/.env` file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/tenantflow
JWT_SECRET=your_secret_key

---

## 🎓 Academic Concepts Implemented

- Multi-Tenant SaaS Architecture
- REST API Development
- JWT Authentication
- Role-Based Access Control
- Secure Database Design

---

## 👩‍💻 Author

Tanushka Tiwari  
CSE - 3rd Year

---
