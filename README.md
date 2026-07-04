# AI Resume & Cover Letter Generator — Local Full-Stack App

A complete, runnable local app: multi-step profile form → paste a job description →
Claude tailors your bullet points and writes a cover letter → preview → download PDFs.

```
app/
├── backend/     Express + TypeScript API, SQLite (via Prisma), Anthropic Claude
└── frontend/    Next.js 14 (App Router) + Tailwind, plain React state (no extra form libs)
```

**Important:** this was built and syntax-checked in a sandboxed environment with no
internet access, so `npm install` could not be run or verified end-to-end here. The
code is complete and has been checked with `tsc --noEmit` for real syntax/type
errors — run the two commands below on your own machine to bring it up.

---

## 1. Prerequisites

- Node.js 18+ and npm
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

No database server needed — the backend uses SQLite (a local file), created automatically.

---

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Open `.env` and paste in your real key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Then:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

You should see:
```
API listening on http://localhost:4000
```

The `prisma:migrate` step creates `backend/dev.db` (SQLite file) and the `User`,
`Profile`, `Generation`, `Document` tables from `prisma/schema.prisma`.

### Quick backend sanity check
```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

---

## 3. Frontend setup

Open a **second terminal**:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Visit **http://localhost:3000**.

---

## 4. Using the app

1. Fill in Contact → Experience → Education → Skills (4-step form).
2. Paste a real job description (50+ characters).
3. Click **Generate Tailored Resume** — this calls Claude via your backend, which:
   - Rewrites your bullet points to match the job, without inventing facts
   - Writes a tailored cover letter
   - Saves your profile + this generation to SQLite
4. Preview both documents inline.
5. Click **Download Resume PDF** / **Download Cover Letter PDF** — these hit
   `GET /api/generate-pdf/:generationId?type=resume|cover_letter`, which renders
   the PDF on the fly with `pdfkit` and streams it back.

---

## 5. What's wired up vs. what's stubbed

| Feature | Status |
|---|---|
| Multi-step profile form | Built (plain React state, Tailwind) |
| Job description input + validation | Built |
| Claude structured-output generation | Built (`POST /api/generate`) |
| Zod validation on request AND on the LLM's own output | Built |
| SQLite persistence (Profile + Generation) | Built |
| PDF generation (resume + cover letter) | Built (`GET /api/generate-pdf/:id`) |
| Resume preview in-browser | Built |
| Authentication / multi-user accounts | Not built — this is a single-user local app (see `LOCAL_USER_EMAIL` in `generate.route.ts`) |
| Choice of visual resume templates | Not built — one clean layout for now |
| Editing AI output before download | Not built — currently preview-only, regenerate to change wording |
| Cloud file storage (S3/R2) | Not needed yet — PDFs are generated on-demand, not stored |

---

## 6. Common issues

- **"Invalid `x-api-key`" from Anthropic** → check `.env` has the correct key and no
  trailing quotes/spaces, and that you restarted `npm run dev` after editing it.
- **CORS error in browser console** → confirm backend `.env` `FRONTEND_URL` matches
  the URL you're actually loading the frontend from (default `http://localhost:3000`).
- **Prisma migrate fails** → delete `backend/dev.db` and `backend/prisma/migrations`
  and re-run `npm run prisma:migrate`.
- **Port already in use** → change `PORT` in backend `.env` or stop whatever else is
  on 4000/3000.

---

## 7. Suggested next steps

- Add Clerk or Auth.js so `Profile` rows are scoped per real user instead of the
  single local placeholder user
- Add a template picker (2-3 `pdfkit` layouts, or migrate to `@react-pdf/renderer`
  for richer typography/columns)
- Let users edit the AI-generated bullets/cover letter inline before downloading
- Add a "My Generations" history view using the already-built
  `GET /api/generations/:profileId` endpoint
