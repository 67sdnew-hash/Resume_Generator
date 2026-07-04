import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/profile/:id — used by the frontend to prefill the form on return visits
router.get("/api/profile/:id", async (req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({ where: { id: req.params.id } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  return res.status(200).json({ success: true, data: profile });
});

// GET /api/generations/:profileId — history of tailored versions for a profile
router.get("/api/generations/:profileId", async (req: Request, res: Response) => {
  const generations = await prisma.generation.findMany({
    where: { profileId: req.params.profileId },
    orderBy: { createdAt: "desc" },
    select: { id: true, jobTitle: true, jobDescription: true, createdAt: true },
  });
  return res.status(200).json({ success: true, data: generations });
});

export default router;
