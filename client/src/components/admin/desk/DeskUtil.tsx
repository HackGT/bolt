import { Request } from "../../../types/Request";

export function updateRequestStatus(
  updateRequest: any,
  id: string,
  newStatus: any,
  updatedHaveID: boolean | null = null
) {
  const updatedRequest: any = {
    id,
    status: newStatus,
  };

  if (updatedHaveID !== null) {
    updatedRequest.userHaveId = updatedHaveID;
  }
  return updateRequest({
    variables: {
      updatedRequest,
    },
  });
}

export function requestSearch(r: Request, searchQuery: string): boolean {
  console.log(r);
  return (
    r.user.displayName!.toLowerCase().includes(searchQuery) ||
    r.user.email!.toLowerCase().includes(searchQuery) ||
    r.user.phoneNumber!.includes(searchQuery)
  );
}
