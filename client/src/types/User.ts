export interface BaseUser {
  uuid: string;
  name: string;
}

export interface BaseUserWithID extends BaseUser {
  haveID: boolean;
}

export interface User extends BaseUser {
  admin: boolean;
}

export interface FullUser extends User {
  email: string;
  phone: string;
  haveID: boolean;
  admin: boolean;
}
