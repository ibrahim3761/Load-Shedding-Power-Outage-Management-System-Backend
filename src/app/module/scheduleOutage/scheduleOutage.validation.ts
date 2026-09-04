import z from "zod";

export const CreateScheduledOutageValidationZodSchema = z
  .object({
    reason: z.string().trim().min(5, "Reason must be at least 5 characters"),
    startTime: z.string().datetime({ offset: true, message: "Invalid start time format" }),
    endTime: z.string().datetime({ offset: true, message: "Invalid end time format" }),
    areaId: z.string().trim().min(1, "Area is required"),
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
  startTime: z.string().datetime("Invalid start time format").optional(),
  endTime: z.string().datetime("Invalid end time format").optional(),
});