export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type LoginSsoRequest = {
  token: string;
  state: string;
};
