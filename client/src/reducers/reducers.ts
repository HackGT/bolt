import {Action} from "redux";
import {SetUserAction, TestAction, User} from "../actions/actions";

export interface AppState {
    a: number,
    user: User|null
}

const defaultState: AppState = {
    a: 4,
    user: null
};

const reducers = (state = defaultState, action: SetUserAction|TestAction) => {
    console.log(action);
    if (!action) {
        action = {
            type: "DEFAULT",
        };
    }
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: (action as SetUserAction).user
            };
        default:
            return state;
    }
};

export default reducers;