import { UserStatus } from "../../../generated/prisma/enums";

export interface IUpdateMyProfilePayload {
  name?: string;
  contactNumber?: string;
  address?: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}