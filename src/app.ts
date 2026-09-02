import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { UserRoutes } from "./app/module/user/user.router";
import { TechnicianRoutes } from "./app/module/technician/technician.route";
import { AreaRoutes } from "./app/module/area/area.router";
import { UnexpectedOutageRoutes } from "./app/module/unexpectedOutage/unexpectedOutage.router";

const app: Application = express();

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

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/technician", TechnicianRoutes);
app.use("/api/v1/area", AreaRoutes);
app.use("/api/v1/unexpected-outage", UnexpectedOutageRoutes);

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
