import { OutageStatus } from "../../../generated/prisma/enums";

export interface IReportOutagePayload {
  description: string;
  areaId: string;
}



export interface IAssignTechnicianPayload {
  technicianId: string;
}