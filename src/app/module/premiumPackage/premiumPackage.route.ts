import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PremiumPackageController } from "./premiumPackage.controller";
import {
  CreatePremiumPackageValidationZodSchema,
  UpdatePremiumPackageValidationZodSchema,
} from "./premiumPackage.validation";

const router = Router();
// public
router.get("/public/all", PremiumPackageController.getPublicPackages);
router.get("/public/:packageId", PremiumPackageController.getSinglePublicPackage);

// admin
router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreatePremiumPackageValidationZodSchema),
  PremiumPackageController.createPackage,
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  PremiumPackageController.getAllPackages,
);

router.get(
  "/:packageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  PremiumPackageController.getSinglePackage,
);

router.patch(
  "/:packageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UpdatePremiumPackageValidationZodSchema),
  PremiumPackageController.updatePackage,
);

router.delete(
  "/:packageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  PremiumPackageController.deletePackage,
);

export const PremiumPackageRoutes = router;