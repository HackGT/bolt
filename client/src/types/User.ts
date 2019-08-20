export interface User {
    uuid: string;
    admin: boolean;
    name: string;
}

export interface FullUser extends User {
    email: string;
    phone: string;
    slackUsername: string;
    haveID: boolean;
    admin: boolean;
}
