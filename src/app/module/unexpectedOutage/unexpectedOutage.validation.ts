import z from "zod";
import { OutageStatus } from "../../../generated/prisma/enums";

export const ReportOutageValidationZodSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  areaId: z
    .string()
    .trim()
    .min(1, "Area is required"),
});

export const AssignTechnicianValidationZodSchema = z.object({
  technicianId: z
    .string()
    .trim()
    .min(1, "Technician ID is required"),
});

