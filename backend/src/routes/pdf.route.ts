import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";
import { GenerationOutputSchema } from "../lib/schemas";

const router = Router();

type ContactInfo = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
};

type ExperienceEntry = {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
};

type EducationEntry = {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * GET /api/generate-pdf/:generationId?type=resume|cover_letter
 *
 * Loads a previously created Generation + its parent Profile, renders the
 * requested document with pdfkit, and streams the PDF straight back as the
 * response body. No file is written to disk in this version — regenerate
 * on demand from the (cheap) stored Generation row rather than re-calling
 * the LLM. Swap the `res` stream for an S3 upload + Document row later if
 * you want persistent download links.
 */
router.get("/api/generate-pdf/:generationId", async (req: Request, res: Response) => {
  try {
    const { generationId } = req.params;
    const docType = (req.query.type as string) === "cover_letter" ? "cover_letter" : "resume";

    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: { profile: true },
    });

    if (!generation) {
      return res.status(404).json({ error: "Generation not found" });
    }

    // FIX: Parse the text strings from SQLite back into objects/arrays
    const parsedOutput = JSON.parse(generation.output as string);
    const output = GenerationOutputSchema.parse(parsedOutput);
    
    const contact = JSON.parse(generation.profile.contact as string) as ContactInfo;
    const experience = JSON.parse(generation.profile.experience as string) as ExperienceEntry[];
    const education = JSON.parse(generation.profile.education as string) as EducationEntry[];

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${docType}-${contact.fullName.replace(/\s+/g, "_")}.pdf"`
    );
    doc.pipe(res);

    if (docType === "cover_letter") {
      renderCoverLetter(doc, contact, output.coverLetter);
    } else {
      renderResume(doc, contact, output, experience, education);
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
});

function renderResume(
  doc: PDFKit.PDFDocument,
  contact: ContactInfo,
  output: { summary: string; optimizedExperience: { id: string; company?: string; optimizedBullets: string[] }[]; prioritizedSkills?: { technical?: string[]; soft?: string[] } },
  experience: ExperienceEntry[],
  education: EducationEntry[]
) {
  // --- Header ---
  doc.font("Helvetica-Bold").fontSize(22).text(contact.fullName);
  doc.font("Helvetica").fontSize(10).fillColor("#444");
  const contactLine = [contact.email, contact.phone, contact.location]
    .filter(Boolean)
    .join("  |  ");
  doc.text(contactLine);
  const linksLine = [contact.linkedin, contact.portfolio, contact.github]
    .filter(Boolean)
    .join("  |  ");
  if (linksLine) doc.text(linksLine);
  doc.moveDown(1);
  doc.fillColor("#000");

  // --- Summary ---
  sectionHeading(doc, "Professional Summary");
  doc.font("Helvetica").fontSize(10.5).text(output.summary, { align: "left" });
  doc.moveDown(1);

  // --- Experience ---
  sectionHeading(doc, "Experience");
  for (const exp of experience) {
    const optimized = output.optimizedExperience.find((o) => o.id === exp.id);
    const bullets = optimized?.optimizedBullets?.length ? optimized.optimizedBullets : exp.bullets;

    doc.font("Helvetica-Bold").fontSize(11).text(`${exp.title} — ${exp.company}`);
    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor("#555");
    const dateLine = [exp.location, `${exp.startDate} – ${exp.endDate ?? "Present"}`]
      .filter(Boolean)
      .join("   ");
    doc.text(dateLine);
    doc.fillColor("#000").font("Helvetica").fontSize(10.5);

    for (const bullet of bullets) {
      doc.text(`•  ${bullet}`, { indent: 10 });
    }
    doc.moveDown(0.6);
  }

  // --- Education ---
  sectionHeading(doc, "Education");
  for (const edu of education) {
    doc.font("Helvetica-Bold").fontSize(11).text(`${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}`);
    doc.font("Helvetica").fontSize(10).text(edu.institution);
    if (edu.startDate || edu.endDate) {
      doc.font("Helvetica-Oblique").fontSize(9.5).fillColor("#555");
      doc.text(`${edu.startDate ?? ""} – ${edu.endDate ?? ""}`);
      doc.fillColor("#000");
    }
    doc.moveDown(0.5);
  }

  // --- Skills ---
  const { technical = [], soft = [] } = output.prioritizedSkills ?? {};
  if (technical.length || soft.length) {
    sectionHeading(doc, "Skills");
    doc.font("Helvetica").fontSize(10.5);
    if (technical.length) doc.text(`Technical: ${technical.join(", ")}`);
    if (soft.length) doc.text(`Additional: ${soft.join(", ")}`);
  }
}

function renderCoverLetter(doc: PDFKit.PDFDocument, contact: ContactInfo, coverLetter: string) {
  doc.font("Helvetica-Bold").fontSize(16).text(contact.fullName);
  doc.font("Helvetica").fontSize(10).fillColor("#444");
  doc.text([contact.email, contact.phone].filter(Boolean).join("  |  "));
  doc.fillColor("#000").moveDown(2);

  doc.font("Helvetica").fontSize(11);
  const paragraphs = coverLetter.split("\n").filter((p) => p.trim().length > 0);
  for (const para of paragraphs) {
    doc.text(para, { align: "left" });
    doc.moveDown(1);
  }
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#1a1a1a").text(text.toUpperCase());
  doc
    .moveTo(doc.x, doc.y + 2)
    .lineTo(545, doc.y + 2)
    .strokeColor("#cccccc")
    .stroke();
  doc.moveDown(0.5);
  doc.fillColor("#000");
}

export default router;