import {
  BlockedStatus,
  RequestStatusType,
  BlockedType,
} from "@/constants/common.constants";

export interface IBlockedUser {
  user_id: string;
  blocked_status: BlockedStatus;
  block_origin: BlockedType;
}

export interface IRequestedUser {
  user_id: string;
  request_status: RequestStatusType;
}

export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact?: string;
  privileges: string[];
  origin: IOrigin;
  email_verified: boolean;
  user_profile_picture?: string;
  roles: string[];

  friends_ids: string[];
  blocked_user: IBlockedUser[];
  requested_friends: IRequestedUser[];

  group_ids: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommonAuthUser {
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  user_profile_picture: string;
}

export interface IOrigin {
  country: string;
  state: string;
  zipcode: number;
}

export interface IOtp {
  _id: string;
  email: string;
  user_id: string;
  otp: number;
  is_verified: boolean;
  otp_response: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeadHistory {
  user_agent: string;
  ip_address: string;
}

export interface IRevplusLead {
  _id: string;
  email: string;
  is_verified: boolean;
  lead_history: ILeadHistory[];

  createdAt: Date;
  updatedAt: Date;
}
