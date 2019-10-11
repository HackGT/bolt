import {Request} from "../../types/Request";

export function updateRequestStatus(updateRequest: any, request_id: number, newStatus: any, updatedHaveID: boolean | null = null) {
    const updatedRequest: any = {
        request_id,
        new_status: newStatus
    };

    if (updatedHaveID !== null) {
        updatedRequest.user_haveID = updatedHaveID;
    }
    return updateRequest({
        variables: {
            updatedRequest
        }
    });
}

export function requestSearch(r: Request, searchQuery: string): boolean {
    return r.user.name.toLowerCase().indexOf(searchQuery) >= 0
        || r.user.slackUsername.toLowerCase().indexOf(searchQuery) >= 0
        || r.user.email.toLowerCase().indexOf(searchQuery) >= 0
        || r.user.phone.indexOf(searchQuery) >= 0;
}
