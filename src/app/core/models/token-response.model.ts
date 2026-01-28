export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expireIn: number;
}

export interface TokenRequest {
  clientId: string;
  clientSecret: string;
}

export interface CachedToken {
  token: string;
  expiresAt: number;
}
