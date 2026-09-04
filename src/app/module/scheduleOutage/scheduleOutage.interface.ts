export interface ICreateScheduledOutagePayload {
  reason: string;
  startTime: string;
  endTime: string;
  areaId: string;
  technicianId: string;
}

export interface IUpdateScheduledOutagePayload {
  reason?: string;
  startTime?: string;
  endTime?: string;
  technicianId?: string;
}