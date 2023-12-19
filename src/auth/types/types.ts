export interface IUser {
  id: string;
  email: string;
  password: string;
  isActivated: boolean;
  resetToken: string;
  refreshToken?: string | null;
  accessToken: string;
  exp?: number; 
  iat?: number; 
  createdAt: Date;
  updatedAt: Date;
}