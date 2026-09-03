import z from "zod";

export const BuyPremiumValidationZodSchema = z.object({
  packageId: z.string().trim().min(1, "Package ID is required"),
  areaId: z.string().trim().min(1, "Area ID is required"),
});