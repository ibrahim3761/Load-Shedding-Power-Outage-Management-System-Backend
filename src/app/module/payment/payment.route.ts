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



export const PaymentRoutes = router; 