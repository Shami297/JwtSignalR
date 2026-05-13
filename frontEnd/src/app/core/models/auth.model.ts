export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email:    string;
  password: string;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;    // seconds
  user:         UserInfo;
}

export interface UserInfo {
  id:       string;
  fullName: string;
  email:    string;
  roles:    string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email:       string;
  token:       string;
  newPassword: string;
}