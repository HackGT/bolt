import {Action, ActionCreator} from "redux";

export const testAction: ActionCreator<Action> = () => ({
    type: 'TEST_ACTION'
});
