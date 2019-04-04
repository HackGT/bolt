import {Action, ActionCreator} from "redux";
import { types } from './';
import UserMenuItems from "../components/navigation/UserMenuItems";
import { RequestedItem } from "../components/inventory/HardwareItem";
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

export interface GenericAction {
    type: string,
    [key: string]: string
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

interface RequestsAndUsers {
    requests: RequestedItem[],
    users: User[]
}

export type RequestsAndUsersAction = RequestsAndUsers & GenericAction;

export const fetchRequestsAndUsers = () => {
    return (dispatch: any, getState: any) => {
        return new Promise<RequestsAndUsers>((resolve) => {
            const mock = {
                users: [],
                requests: []
            }
            setTimeout(() => {resolve(mock)}, 1000);
        })
        .then((json) => {
            const { users, requests } = json;
            dispatch({
                type: types.REQUESTS_AND_USERS,
                users,
                requests
            });
        })
    };
}