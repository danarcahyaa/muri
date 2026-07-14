import { BaseResponse } from "./common";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthInput {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthData {
  user: UserProfile | null;
}

export type AuthResponse = BaseResponse<AuthData>;

export type PasswordResetResponse = BaseResponse<null>;