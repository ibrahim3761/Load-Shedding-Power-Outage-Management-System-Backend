import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { UserRoutes } from "./app/module/user/user.router";
import { TechnicianRoutes } from "./app/module/technician/technician.route";
import { AreaRoutes } from "./app/module/area/area.router";
import { UnexpectedOutageRoutes } from "./app/module/unexpectedOutage/unexpectedOutage.router";
import { PremiumPackageRoutes } from "./app/module/premiumPackage/premiumPackage.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { ScheduledOutageRoutes } from "./app/module/scheduleOutage/scheduleOutage.route";
import { AnalyticsRoutes } from "./app/module/analytics/analytics.route";

const app: Application = express();

// security headers
app.use(helmet());

// rate limiting — global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again after 15 minutes",
  },
});

app.use(limiter);

// stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth",authLimiter, AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/technician", TechnicianRoutes);
app.use("/api/v1/area", AreaRoutes);
app.use("/api/v1/unexpected-outage", UnexpectedOutageRoutes);
app.use("/api/v1/scheduled-outage", ScheduledOutageRoutes);
app.use("/api/v1/premium-package", PremiumPackageRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/analytics", AnalyticsRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Load Shedding & Power Outage Management System",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
