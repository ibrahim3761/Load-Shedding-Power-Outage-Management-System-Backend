import z from "zod";
import { UserStatus } from "../../../generated/prisma/enums";

export const UpdateMyProfileValidationZodSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  contactNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const ChangePasswordValidationZodSchema = z.object({
  oldPassword: z.string().trim().min(1, "Old password is required"),
  newPassword: z
    .string()
    .trim()
    .min(6, "New password must be at least 6 characters"),
});

export const UpdateUserStatusValidationZodSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]),
});