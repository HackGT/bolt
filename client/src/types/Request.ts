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
  user: BaseUserWithID;
  item: Item;
  status: RequestStatus;
  location: Location;
  quantity: number;
  createdAt: number;
  updatedAt: string;
}

export interface UserAndRequests {
  user: BaseUserWithID;
  requests: [Request];
}
