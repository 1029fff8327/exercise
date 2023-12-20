export interface IUser {
  id: string;
  email: string;
  password: string;
  isActivated: boolean;
  resetToken?: string | null;
  activationToken?: string | null;
  refreshToken?: string | null;
  accessToken?: string | null;
  expiresIn?: string;
  exp?: number; 
  iat?: number; 
  createdAt: Date;
  updatedAt: Date;
}