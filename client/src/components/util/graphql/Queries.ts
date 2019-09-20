import gql from "graphql-tag";

export const ITEM_EDIT_GET_ITEM = gql`
    query getItem($itemId: Int!) {
        item(id: $itemId) {
            item_name
            description
            imageUrl
            category
            totalAvailable
            maxRequestQty
            price
            approvalRequired
            returnRequired
            hidden
            owner
        }
    }`;

export const ITEM_EDIT_GET_ITEMS = gql`
    query {
        items {
            id
            item_name
            description
            imageUrl
            category
            totalAvailable
            maxRequestQty
            hidden
            approvalRequired
            returnRequired
            owner
        }
    }
`;

export const ALL_CATEGORIES = gql`
    query categories {
        categories {
            category_id
            category_name
        }
    }
`;

export const ALL_ITEMS = gql`
    query {
        items {
            id
            item_name
            description
            imageUrl
            category
            totalAvailable
            maxRequestQty
            hidden
            approvalRequired
            returnRequired
            owner
            qtyUnreserved
        }
    }
`;

export const ALL_USERS = gql`
    query users {
        users(search: {}) {
            uuid
            name
            email
            phone
            slackUsername
            haveID
            admin
        }
    }
`;

export const DESK_REQUESTS = gql`
    query {
        requests(search:{statuses: [SUBMITTED, APPROVED, READY_FOR_PICKUP]}) {
            request_id
            user {
                uuid
                name
            }
            item {
                id
                item_name
                qtyAvailableForApproval
            }
            status
            quantity
            createdAt
            updatedAt
        }
    }
`;

export const USER_PROFILE = gql`
    query users($uuid:String!) {
        users(search:{uuid:$uuid}) {
            uuid
            name
            email
            phone
            slackUsername
            haveID
            admin
        }
    }
`;
