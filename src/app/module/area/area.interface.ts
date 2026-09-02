export interface ICreateAreaPayload {
  name: string;
  district: string;
  city: string;
}

export interface IUpdateAreaPayload {
  name?: string;
  district?: string;
  city?: string;
}