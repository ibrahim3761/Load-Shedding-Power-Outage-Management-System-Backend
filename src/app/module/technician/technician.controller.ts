import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ApplyAsTechnicianValidationZodSchema, UpdateTechnicianProfileValidationZodSchema } from "./technician.validation";
import { TechnicianServices } from "./technician.services";

const applyTechnician = catchAsync(async (req: Request, res: Response) => {
	const resume = req.file as Express.Multer.File | null;

	const zodValidationResult = ApplyAsTechnicianValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new Error(zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

	const result = await TechnicianServices.applyAsTechnician(
		payload,
		resume
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Apply as technician successfully",
		data: result,
	});
});

const verifyTechnicianEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await TechnicianServices.verifyTechnicianEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Technician Email verified successfully",
		data: result,
	});
});

const approveTechnician = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await TechnicianServices.approveTechnician(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Technician Approved Successfully",
		data: result,
	});
});

const getAllTechnician = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await TechnicianServices.getAllTechnicians(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Technicians Retrieved Successfully",
		data: data,
		meta: meta,
	});
});

const updateTechnicianProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;
    const payload = req.body;

	const result = await TechnicianServices.updateTechnicianProfile(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Technician Profile Updated Successfully",
		data: result,
	});
});


const getAllTechnicianListPublic = catchAsync(
	async (req: Request, res: Response) => {
		const { data, meta } = await TechnicianServices.getAllTechnicianListPublic(
			req.query,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Technicians Retrieved Successfully",
			data,
			meta,
		});
	},
);

const getSingleTechnicianPublicProfile = catchAsync(
	async (req: Request, res: Response) => {
		const technicianId = req.params.technicianId as string;

		const result = await TechnicianServices.getSingleTechnicianPublicProfile(technicianId);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Technician Profile Retrieved Successfully",
			data: result,
		});
	},
);

export const TechnicianController = {
	applyTechnician,
	verifyTechnicianEmail,
	approveTechnician,
	getAllTechnician,
	updateTechnicianProfile,
	getAllTechnicianListPublic,
	getSingleTechnicianPublicProfile,
};
