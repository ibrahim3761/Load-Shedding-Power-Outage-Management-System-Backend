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

export const UpdateOutageStatusValidationZodSchema = z.object({
  status: z.enum([OutageStatus.IN_PROGRESS, OutageStatus.RESOLVED]),
  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});