import { Router } from "express";
import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { ChangePasswordValidationZodSchema, UpdateMyProfileValidationZodSchema, UpdateUserStatusValidationZodSchema } from "./user.validation";

const router = Router();

router.patch(
  "/update-my-profile",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  validateRequest(UpdateMyProfileValidationZodSchema),
  UserController.updateMyProfile,
);

router.patch(
  "/change-password",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  validateRequest(ChangePasswordValidationZodSchema),
  UserController.changePassword,
);

router.patch(
  "/profile-image",
  upload.single("profileImage"),
  auth(Role.ADMIN, Role.TECHNICIAN, Role.CUSTOMER, Role.SUPER_ADMIN),
  UserController.uploadProfileImage,
);

// admin
router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers,
);

router.get(
  "/:userId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getSingleUser,
);

router.get(
  "/premium-users",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllPremiumUsers,
);

router.get(
  "/premium-users/:premiumUserId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getSinglePremiumUser,
);

router.get(
  "/my-premium",
  auth(Role.CUSTOMER),
  UserController.getMyPremiumSubscriptions,
);

router.get(
  "/my-premium/:premiumUserId",
  auth(Role.CUSTOMER),
  UserController.getMySinglePremiumSubscription,
);

router.patch(
  "/:userId/status",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UpdateUserStatusValidationZodSchema),
  UserController.updateUserStatus,
);

router.delete(
  "/:userId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.deleteUser,
);


export const UserRoutes = router;
