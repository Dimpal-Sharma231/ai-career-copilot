# AI Career Copilot — Production Full-Stack Architecture

AI-powered career engine engineered for engineering students to optimize resumes, compute TF-IDF cosine similarity match scores against target Job Descriptions, uncover skill gaps, and track applications.

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────┐
                    │    React Frontend (Vite)   │
                    │   Tailwind CSS / Lucide    │
                    │    http://localhost:3000   │
                    └─────────────┬──────────────┘
                                  │  REST APIs / JWT
                                  ▼
                    ┌────────────────────────────┐
                    │    Express API Gateway     │
                    │   Node.js / Prisma ORM     │
                    │    http://localhost:5000   │
                    └──────┬──────────────┬──────┘
                           │              │
           Prisma Queries  │              │  Multipart / JSON
                           ▼              ▼
           ┌──────────────────────┐ ┌────────────────────────────┐
           │ PostgreSQL Database  │ │ Python FastAPI AI Service  │
           │ Users, Resumes, Apps │ │ scikit-learn / PyPDF2      │
           │   Port 5432          │ │ http://localhost:8000      │
           └──────────────────────┘ └────────────────────────────┘
```

---

## 🚀 Quick Start Guide (Run All 3 Services)

### 1. Python AI Microservice (Port 8000)
```powershell
cd ai-service
# Start FastAPI ASGI server with hot reload
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Express Backend API (Port 5000)
```powershell
cd backend
# Generate Prisma Client (if needed)
npm run prisma:generate

# Start Express server with auto-reload
npm run dev
```
- API Health Status: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 3. React Frontend Client (Port 3000)
```powershell
cd frontend
# Start Vite development server
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 📦 Service Breakdown

| Module | Stack | Responsibilities |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide, Framer Motion | Landing page, student dashboard, PDF drag-and-drop uploader, animated circular match gauge, Kanban pipeline board |
| **Backend** | Node.js, Express, Prisma ORM, bcryptjs, JWT, Multer | Secure authentication, multipart upload handling, PostgreSQL persistence, job tracker CRUD, inter-service gateway |
| **AI Service** | Python 3.14, FastAPI, scikit-learn, PyPDF2 | PDF byte text parsing, 150+ tech skills extraction via JSON dictionary, TF-IDF N-gram matrix, Cosine Similarity matching |
