import {ItemStatus} from "./types/Hardware";

export const StatusToString = (status: ItemStatus) => {
    switch(status) {
        case ItemStatus.SUBMITTED: return "Submitted"
        case ItemStatus.APPROVED: return "Approved"
        case ItemStatus.DECLINED: return "Declined"
        case ItemStatus.CANCELLED: return "Cancelled"
        case ItemStatus.READY: return "Ready"
        case ItemStatus.FULFILLED: return "Fulfilled"
        case ItemStatus.RETURNED: return "Returned"
        case ItemStatus.LOST: return "Lost"
        case ItemStatus.DAMAGED: return "Damaged"
    }
}

export const StatusToColor = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.SUBMITTED: return "yellow"
        case ItemStatus.APPROVED: return "orange"
        case ItemStatus.DECLINED: return "red"
        case ItemStatus.CANCELLED: return "red"
        case ItemStatus.READY: return "blue"
        case ItemStatus.FULFILLED: return "green"
        case ItemStatus.RETURNED: return "grey"
        case ItemStatus.LOST: return "red"
        case ItemStatus.DAMAGED: return "red"
    }
}
