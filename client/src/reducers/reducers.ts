import {Action} from "redux";

const defaultState = {
    a: 4
};

const reducers = (state = defaultState, action: Action) => {
    switch (action.type) {
        case 'TEST_ACTION':
            return {
                ...state,
                a: 3
            };
        default:
            return state;
    }
};

export default reducers;