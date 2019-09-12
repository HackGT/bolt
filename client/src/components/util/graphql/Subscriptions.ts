import gql from "graphql-tag";

export const REQUEST_CHANGE = gql`
    subscription rc {
        request_change {
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
