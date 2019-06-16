import {
    GenericAction,
    RequestsAndUsersAction,
    RequestStatusAction,
    SetUserAction,
    TestAction,
    types,
    User
} from "../actions/";
import {RequestedItem} from "../components/inventory/HardwareItem";

export interface AppState {
    user: User | null;
    users: User[];
    requests: RequestedItem[];
}

const defaultState: AppState = {
    user: null,
    users: [],
    requests: []
};

const defaultAction: GenericAction = {
    type: "DEFAULT"
};

const reducers = (state = defaultState, action: SetUserAction|TestAction|GenericAction = defaultAction) => {
    switch (action.type) {
        case types.SET_USER:
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
        case types.REQUEST_STATUS:
            const { requestId, status } = (action as RequestStatusAction);
            const { requests: stateRequests } = state;
            const reqIndex = stateRequests.findIndex(req => req.id === requestId);
            if (reqIndex === -1) {
                console.error("State mismatch, request not found");
                return state;
            }
            const newRequests = stateRequests.map((req, i) => {
                if (i === reqIndex) {
                    return {...stateRequests[reqIndex], status};
                }
                return stateRequests[i];
            });
            return {
                ...state,
                requests: newRequests
            };
        default:
            return state;
    }
};

export default reducers;
