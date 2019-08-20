import {ActionCreator} from "redux";
import {types} from "./";
import {ItemStatus, RequestedItem} from "../components/inventory/HardwareItem";
import {User} from "../types/User";

export interface TestAction {
    type: string;
}

export interface SetUserAction {
    type: string;
    user: User|null;
}

export interface GenericAction {
    type: string;
    [key: string]: string;
}

export interface LogoutUserAction {
    type: string;
}

export const setUser: ActionCreator<SetUserAction> = (user) => ({
    type: types.SET_USER,
    user
});

interface RequestsAndUsers {
    requests: RequestedItem[];
    users: User[];
}

export type RequestsAndUsersAction = RequestsAndUsers & GenericAction;

interface RequestStatus {
    requestId: number;
    status: ItemStatus;
}

export type RequestStatusAction = RequestStatus & GenericAction;

export const fetchRequestsAndUsers = () => {
    return (dispatch: any, getState: any) => {
        return new Promise<RequestsAndUsers>((resolve) => {
            const mock = {
                users: [{
                    uuid: "1a", admin: true, name: "Joel"
                }],
                requests: [{
                    id: 5,
                    user: "1a",
                    name: "RPI 3",
                    qtyRequested: 3,
                    category: "hardware lol",
                    status: ItemStatus.FULFILLED,
                    cancelled: false
                }]
            };
            setTimeout(() => {resolve(mock); }, 1000);
        })
        .then((json) => {
            const { users, requests } = json;
            dispatch({
                type: types.REQUESTS_AND_USERS,
                users,
                requests
            });
        })
        .catch((err: string) => {
            throw Error(err);
        });
    };
};

interface AckResponse {
    status: string;
    message: string;
}

export const updateRequestStatus = (requestId: string, status: ItemStatus, resolve: any) => {
    return (dispatch: any) => {
        return new Promise<AckResponse>((resolve) => {
            const mock = {
                status: "ok",
                message: "Status updated"
            };
            setTimeout(() => {resolve(mock); }, 1000);
        })
        .then((json) => {
            const { status: responseStatus, message } = json;
            if (responseStatus === "ok") {
                dispatch({
                    type: types.REQUEST_STATUS,
                    requestId,
                    status
                });
                return;
            }
            throw Error(message);
        })
        .catch((err: string) => {
            throw Error(err);
        });
    };
};
