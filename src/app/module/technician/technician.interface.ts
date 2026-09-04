import { OutageStatus, TechnicianVerificationStatus } from "../../../generated/prisma/enums";

export interface IApplyAsTechinicianPayload {
	user: {
		name: string;
		email: string;
	};
	technician: {
		address?: string;
		experienceYears: number;
		bio?: string;
		contactNumber?: string;
        
	};
}

export interface IVerifyTechnicianEmailPayload {
	email: string;
	otp: string;
}

export interface IApproveTechnicianPayload {
	technicianId: string;
	verificationStatus: TechnicianVerificationStatus;
	rejectionReason: string;
}

export interface IUpdateTechnicianProfilePayload {
	address?: string;
	bio?: string;
	contactNumber?: string;
    experienceYears?: number;
}

export interface IUpdateOutageStatusPayload {
  status: OutageStatus;
  note?: string;
}