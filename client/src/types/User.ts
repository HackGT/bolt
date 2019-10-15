export interface BaseUser {
    uuid: string;
    name: string;
}

export interface BaseUserWithID extends BaseUser {
    haveID: boolean;
    slackUsername: string
}

export interface User extends BaseUser {
    admin: boolean;
}

export interface FullUser extends User {
    email: string;
    phone: string;
    slackUsername: string;
    haveID: boolean;
    admin: boolean;
}
