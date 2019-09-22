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
