import { BaseUserWithID, FullUser } from "./User";
import { Item } from "./Hardware";

export type RequestStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "DENIED"
  | "ABANDONED"
  | "CANCELLED"
  | "READY_FOR_PICKUP"
  | "FULFILLED"
  | "RETURNED"
  | "LOST"
  | "DAMAGED"
  | "KEPT";

export interface Request {
  id: number;
  user: FullUser;
  item: Item;
  status: RequestStatus;
  location: Location;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAndRequests {
  user: BaseUserWithID;
  requests: [Request];
}
