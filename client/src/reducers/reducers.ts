import {Action} from "redux";
import {SetUserAction, TestAction, GenericAction, RequestsAndUsersAction, User} from "../actions/";
import {types} from "../actions/";
import { RequestedItem } from "../components/inventory/HardwareItem";

export interface AppState {
    a: number,
    user: User|null,
    users: User[],
    requests: RequestedItem[]
}

const defaultState: AppState = {
    a: 4,
    user: null,
    users: [],
    requests: []
};

const defaultAction: GenericAction = {
    type: "DEFAULT"
};

const reducers = (state = defaultState, action: SetUserAction|TestAction|GenericAction = defaultAction) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: (action as SetUserAction).user
            };
        case types.REQUESTS_AND_USERS:
            const { users, requests } = (action as RequestsAndUsersAction);
            return {
                ...state,
                users,
                requests
            };
        default:
            return state;
    }
};

export default reducers;