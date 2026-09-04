import z from "zod";
import { ScheduledOutageStatus } from "../../../generated/prisma/enums";

export const CreateScheduledOutageValidationZodSchema = z
  .object({
    reason: z.string().trim().min(5, "Reason must be at least 5 characters"),
    startTime: z
      .string()
      .datetime({ offset: true, message: "Invalid start time format" }),
    endTime: z
      .string()
      .datetime({ offset: true, message: "Invalid end time format" }),
    areaId: z.string().trim().min(1, "Area is required"),
    technicianId: z.string().trim().min(1, "Technician is required"),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "Start time must be before end time",
    path: ["endTime"],
  })
  .refine((data) => new Date(data.startTime) > new Date(), {
    message: "Start time must be in the future",
    path: ["startTime"],
  });

export const UpdateScheduledOutageValidationZodSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Reason must be at least 5 characters")
    .optional(),
  startTime: z
    .string()
    .datetime({ offset: true, message: "Invalid start time format" })
    .optional(),
  endTime: z
    .string()
    .datetime({ offset: true, message: "Invalid end time format" })
    .optional(),
  technicianId: z.string().trim().optional(),
  status: z.enum([ScheduledOutageStatus.CANCELLED]).optional(), // only CANCELLED allowed
});
