import {Action, ActionCreator} from "redux";

export interface User {
    uuid: string,
    isAdmin: boolean,
    name: string
}
export interface TestAction {
    type: string
}

export interface SetUserAction {
    type: string,
    user: User|null
}

export interface LogoutUserAction {
    type: string
}

export const testAction: ActionCreator<Action> = () => ({
    type: 'TEST_ACTION'
});

export const setUser: ActionCreator<SetUserAction> = (user) => ({
    type: 'SET_USER',
    "user": user
});
