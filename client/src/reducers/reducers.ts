import {Action} from "redux";

const defaultState = {
    a: 4
};

const reducers = (state = defaultState, action: Action) => {
    console.log(action);
    if (!action) {
        action = {
            type: "DEFAULT"
        };
    }
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