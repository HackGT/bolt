import { Request } from "../../../types/Request";

export function updateRequestStatus(
  updateRequest: any,
  id: number,
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
  return (
    r.user.name.toLowerCase().includes(searchQuery) ||
    r.user.email.toLowerCase().includes(searchQuery) ||
    r.user.phone.includes(searchQuery)
  );
}
