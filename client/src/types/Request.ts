import {BaseUser, FullUser} from "./User";
import {HwItem} from "./Hardware";

export type RequestStatus =
    "SUBMITTED" |
    "APPROVED" |
    "DENIED" |
    "ABANDONED" |
    "CANCELLED" |
    "READY_FOR_PICKUP" |
    "FULFILLED" |
    "RETURNED" |
    "LOST" |
    "DAMAGED";

export interface Request {
    request_id: number;
    user: FullUser;
    item: HwItem;
    status: RequestStatus;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserAndRequests {
    user: BaseUser,
    requests: [Request]
}
