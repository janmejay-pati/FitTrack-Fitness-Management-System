# Wellnest — Personal Health Command Center

Wellnest is a privacy-focused health management experience that brings symptoms, daily habits, appointments, and explainable health patterns into one calm dashboard.

This repository contains a responsive React dashboard plus a FastAPI and MongoDB authentication backend.

## Current features

- Daily wellbeing overview with sleep and heart-rate indicators
- Personal action plan with interactive completion tracking
- Quick symptom check-in with severity logging
- Explainable symptom-to-habit insight with supporting evidence
- Unified health timeline preview
- Appointment preparation entry point
- Responsive desktop and mobile navigation
- Clear safety language distinguishing patterns from diagnoses

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local address shown in the terminal. Create a production build with:

```bash
npm run build
```

### Backend and MongoDB

1. Start local MongoDB, or create a MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URL` and a strong `JWT_SECRET`.
3. In a second terminal, run:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The API is available at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`. The frontend uses that address by default; copy `.env.example` to `.env` to change it.

Authentication includes registration, login, password hashing, 24-hour JWT access tokens, session restoration, logout, and a protected current-user endpoint. Public registration always creates a member account; privileged roles must not be self-assigned.

## Product principle

Wellnest does not diagnose conditions or replace healthcare professionals. It helps users organize their own health information, notice explainable patterns, prepare for appointments, and understand when professional care may be appropriate.

All content in this prototype is synthetic and intended for demonstration only.

## Planned milestones

1. Authentication, onboarding, and a consent-based health profile
2. Persistent symptom, sleep, hydration, exercise, and medication records
3. Searchable health timeline and filters
4. Explainable pattern-detection service
5. Medical document storage and doctor-ready PDF reports
6. Role-based caregiver sharing, audit history, and privacy controls
7. Automated tests, API documentation, Docker setup, and cloud deployment

## Technology

- React
- TypeScript
- Vite
- Responsive CSS

The frontend intentionally begins without a UI framework so the product identity and accessibility patterns remain easy to control.
