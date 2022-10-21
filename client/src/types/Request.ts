import { User } from "firebase/auth";

import { BaseUserWithID, FullUser } from "./User";
import { Item, Location } from "./Hardware";

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
  | "DAMAGED";

export interface Request {
  id: string;
  user: User;
  item: Item;
  status: RequestStatus;
  location: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAndRequests {
  user: BaseUserWithID;
  requests: [Request];
}
