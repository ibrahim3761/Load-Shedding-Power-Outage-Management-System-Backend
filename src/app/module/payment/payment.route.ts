import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { BuyPremiumValidationZodSchema } from "./payment.validation";

const router = Router();

router.post(
  "/buy-premium",
  auth(Role.CUSTOMER),
  validateRequest(BuyPremiumValidationZodSchema),
  PaymentController.buyPremium,
);

// bKash hits this — no auth
router.get("/callback", PaymentController.paymentCallback);

router.get(
  "/my-payments",
  auth(Role.CUSTOMER),
  PaymentController.getMyPayments,
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentController.getAllPayments,
);

// always last
router.get(
  "/:paymentId",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER),
  PaymentController.getPaymentDetails,
);

export const PaymentRoutes = router; 