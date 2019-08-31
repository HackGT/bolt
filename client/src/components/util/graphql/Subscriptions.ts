import gql from "graphql-tag";

export const REQUEST_CHANGE = gql`
    subscription rc {
        request_change {
            request_id
            status
            quantity
            createdAt
            updatedAt
        }
    }
`;
