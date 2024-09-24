import { User } from "../types/User";

// Action Types
export const LOGIN_USER = "ACCOUNT_LOGIN_USER";

const noAccountUser = null;

// Action Creators
export function loginUser(userToLogin: User) {
  return { type: LOGIN_USER, user: userToLogin };
}

// Reducer
export default function account(action: any, state: User | null = noAccountUser) {
  return state;
  switch (action.type) {
    case LOGIN_USER:
      return action.user;
    default:
      return state;
  }
}
