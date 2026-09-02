import z from "zod";

export const CreateAreaValidationZodSchema = z.object({
  name: z.string().trim().min(2, "Area name must be at least 2 characters"),
  district: z.string().trim().min(2, "District must be at least 2 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
});

export const UpdateAreaValidationZodSchema = z.object({
  name: z.string().trim().min(2, "Area name must be at least 2 characters").optional(),
  district: z.string().trim().min(2, "District must be at least 2 characters").optional(),
  city: z.string().trim().min(2, "City must be at least 2 characters").optional(),
});