import {Request} from "../types/Request";
import {APPROVED, READY_FOR_PICKUP, SUBMITTED} from "../types/Hardware";


// Action Types
export const FILL_REQUESTS = "FILL_REQUESTS";
export const UPDATED_REQUEST = "UPDATED_REQUEST";

const emptyDeskData = null;

// Action Creators
export function fillRequests(requests: Request[]) {
    const submitted = [];
    const approved = [];
    const ready_for_pickup = [];
    console.log("requests redux", requests);

    for (let i = 0; i < requests.length; i++) {
        const request: Request = requests[i];
        if (request.status === SUBMITTED) {
            submitted.push(request);
        }
        if (request.status === APPROVED) {
            approved.push(request);
        }
        if (request.status === READY_FOR_PICKUP) {
            ready_for_pickup.push(request);
        }
    }

    return {
        type: FILL_REQUESTS, requests: {
            submitted,
            approved,
            ready_for_pickup
        }
    };
}

// Reducer
export default function desk(state: any | null = emptyDeskData, action: any) {
    switch (action.type) {
        case FILL_REQUESTS:
            return action.requests;
        default:
            return state;
    }
}
