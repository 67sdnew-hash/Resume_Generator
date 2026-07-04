# Resume Generator

Resume Generator is a full-stack application that helps users create tailored resumes and cover letters from their profile data and a target job description. The experience is designed to feel simple and polished: fill in your details, paste a job posting, generate AI-optimized content, preview the result, and download a PDF.

## What it does

The app combines a modern Next.js frontend with an Express + TypeScript backend to provide:

- A guided multi-step profile form for contact, experience, education, and skills
- AI-assisted resume optimization based on a supplied job description
- A generated cover letter that stays grounded in the candidate’s supplied experience
- Local persistence with Prisma and SQLite
- PDF generation for both the resume and cover letter

## Tech stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons

### Backend

- Express.js
- TypeScript
- Prisma ORM
- SQLite
- PDFKit
- Zod validation
- Google Gemini API

## Project structure

```text
Resume_Generator/
├── backend/
│   ├── prisma/
│   ├── prompts/
│   ├── scripts/
│   └── src/
│       ├── lib/
│       ├── routes/
│       └── server.ts
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── __tests__
└── README.md
```

## Detailed architecture

### Backend

- `backend/src/server.ts`: configures Express, loads `.env`, enables CORS, parses JSON, and exposes routes.
- `backend/src/routes/generate.route.ts`: validates incoming profile/job-description payloads, builds a Gemini prompt, calls the Google Gemini API, validates the returned JSON, persists the profile and generation to the database, and returns the generated content.
- `backend/src/routes/pdf.route.ts`: loads a saved generation and profile, renders either a resume or cover letter with PDFKit, and streams the PDF directly to the browser.
- `backend/src/routes/profile.route.ts`: provides profile retrieval and generation history endpoints so the frontend can reload existing profiles and view prior outputs.
- `backend/src/lib/schemas.ts`: defines request shapes with Zod and validates both the incoming payload and the AI-generated output.
- `backend/src/lib/prisma.ts`: creates a shared Prisma client instance and avoids duplicate clients during development hot reload.

### AI generation flow

- The backend sends a job-specific prompt to Gemini with a strict schema requirement.
- If `GEMINI_API_KEY` is missing in development, the server falls back to a canned response.
- In production, a missing key or a quota error returns a 502 response.
- The generated output is validated before being saved, ensuring the app only stores well-formed JSON.

### Persistence

- Uses Prisma ORM backed by SQLite.
- Database file: `backend/dev.db` configured via `backend/.env`.
- Profiles and generations are stored separately so the app can retain profile data and multiple tailored versions for the same candidate.

### PDF generation

- Generated PDF content is not stored on disk.
- The backend renders resumes and cover letters on demand from stored generation JSON.
- This keeps the app lightweight and avoids unnecessary file persistence.

### Frontend

- `frontend/components/ProfileForm.tsx`: collects contact, experience, education, and skills in a polished multi-step form.
- `frontend/lib/api.ts`: sanitizes profile content, trims empty fields, and posts the request to the backend.
- `frontend/lib/types.ts`: shares the same profile and generation shape with strong typing.
- The frontend is designed as a local demo experience that can be extended later for authentication and multi-user support.

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ and npm
- A Google Gemini API key

## Environment setup

### Backend

Create a file named .env inside the backend folder with the following values:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

If a Gemini key is not provided, the backend will fall back to a canned local response for development testing.

### Frontend

The frontend uses the backend URL from the default value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

You can optionally create a frontend .env.local file if you want to override it.

## Getting started

### 1. Install backend dependencies

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The backend will start on:

```text
http://localhost:4000
```

You can verify the server health check with:

```bash
curl http://localhost:4000/health
```

### 2. Install frontend dependencies

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

## How to use the app

1. Open the app in your browser.
2. Complete the profile form with your contact, experience, education, and skills information.
3. Paste a target job description.
4. Click Generate Resume.
5. Review the optimized experience, prioritized skills, and generated cover letter.
6. Download the resume or cover letter as a PDF.

## API overview

The backend exposes a few key endpoints:

- POST /api/generate — generates optimized resume content and a cover letter
- GET /api/generate-pdf/:generationId — downloads a generated PDF
- GET /api/profile/:id — fetches a saved profile
- GET /api/generations/:profileId — lists saved generations for a profile

## Notes

- The app currently uses a local single-user workflow with SQLite, which makes it ideal for local development and demos.
- PDF files are generated on demand rather than stored in cloud storage.
- The current version is focused on a clean local experience rather than multi-user authentication or advanced resume templates.

## Future improvements

Possible next steps for the project include:

- Adding authentication and multi-user support
- Supporting multiple resume templates
- Allowing inline editing of generated content before export
- Adding richer history and saved generation management
