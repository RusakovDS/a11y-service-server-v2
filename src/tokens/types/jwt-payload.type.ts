export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refresh_token: string;
}
