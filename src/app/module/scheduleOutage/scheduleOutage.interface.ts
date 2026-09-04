export interface ICreateScheduledOutagePayload {
  reason: string;
  startTime: string;
  endTime: string;
  areaId: string;
}

export interface IUpdateScheduledOutagePayload {
  reason?: string;
  startTime?: string;
  endTime?: string;
}