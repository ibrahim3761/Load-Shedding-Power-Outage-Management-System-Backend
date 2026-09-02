import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PremiumPackageController } from "./premiumPackage.controller";
import {
  CreatePremiumPackageValidationZodSchema,
} from "./premiumPackage.validation";

const router = Router();

// admin
router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreatePremiumPackageValidationZodSchema),
  PremiumPackageController.createPackage,
);

export const PremiumPackageRoutes = router;