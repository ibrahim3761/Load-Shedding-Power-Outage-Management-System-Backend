export interface ICreatePremiumPackagePayload {
  name: string;
  description: string;
  price: number;
  durationDays: number;
}

export interface IUpdatePremiumPackagePayload {
  name?: string;
  description?: string;
  price?: number;
  durationDays?: number;
}