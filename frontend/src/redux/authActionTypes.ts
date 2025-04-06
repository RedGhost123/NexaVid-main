// authActionTypes.ts (optional file for action types)
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: { token: string };
}

interface LoginFailAction {
  type: typeof LOGIN_FAIL;
  payload: string;
}

interface LogoutAction {
  type: typeof LOGOUT;
}

export type AuthActionTypes = LoginSuccessAction | LoginFailAction | LogoutAction;
