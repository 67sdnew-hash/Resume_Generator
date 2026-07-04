import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import generateRoute from "./routes/generate.route";
import pdfRoute from "./routes/pdf.route";
import profileRoute from "./routes/profile.route";

dotenv.config();

const app = express();

console.log("generateRoute:", typeof generateRoute);
console.log("pdfRoute:", typeof pdfRoute);
console.log("profileRoute:", typeof profileRoute);

const corsOrigin = process.env.NODE_ENV === "production"
  ? process.env.FRONTEND_URL ?? "http://localhost:3000"
  : true;

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.use(generateRoute);
app.use(pdfRoute);
app.use(profileRoute);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});