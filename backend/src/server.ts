import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoute from "./routes/generate.route";
import pdfRoute from "./routes/pdf.route";
import profileRoute from "./routes/profile.route";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" })); // job descriptions can be long-ish

app.use(generateRoute);
app.use(pdfRoute);
app.use(profileRoute);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
