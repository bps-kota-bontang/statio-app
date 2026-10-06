export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type LoginSsoRequest = {
  code: string;
  state: string;
  type: string;
  realm: string;
};

export type LoginInviteRequest = {
  invite_token: string;
};
