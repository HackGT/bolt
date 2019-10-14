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
    return r.user.name.toLowerCase().includes(searchQuery)
        || r.user.slackUsername.toLowerCase().includes(searchQuery)
        || r.user.email.toLowerCase().includes(searchQuery)
        || r.user.phone.includes(searchQuery);
}
