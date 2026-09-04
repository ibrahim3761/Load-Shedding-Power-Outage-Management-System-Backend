import { z } from "zod";
import { OutageStatus } from "../../../generated/prisma/enums";

export const ApplyAsTechnicianValidationZodSchema = z.object({
  user: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),

    email: z.email("Invalid email address").trim().toLowerCase(),
  }),

  technician: z.object({
    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters long")
      .optional(),

    // Handles converting incoming FormData strings like "12" into an integer number
    experienceYears: z
      .number()
      .int("Experience years must be an integer")
      .min(0, "Experience years cannot be negative"),

    bio: z
      .string()
      .trim()
      .max(1000, "Bio cannot exceed 1000 characters")
      .optional(),

    contactNumber: z
      .string()
      .trim()
      .min(5, "Contact number is invalid")
      .optional(),
  }),
});

export const UpdateTechnicianProfileValidationZodSchema = z.object({
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters long")
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional(),

  contactNumber: z
    .string()
    .trim()
    .min(5, "Contact number is invalid")
    .optional(),

  experienceYears: z
    .number()
    .int()
    .min(0, "Experience years cannot be negative")
    .optional(),
});


export const UpdateOutageStatusValidationZodSchema = z.object({
  status: z.enum([OutageStatus.IN_PROGRESS, OutageStatus.RESOLVED]),
  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});