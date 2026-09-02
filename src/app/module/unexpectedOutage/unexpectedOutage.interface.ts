import { OutageStatus } from "../../../generated/prisma/enums";

export interface IReportOutagePayload {
  description: string;
  areaId: string;
}

export interface IUpdateOutageStatusPayload {
  status: OutageStatus;
  note?: string;
}

export interface IAssignTechnicianPayload {
  technicianId: string;
}