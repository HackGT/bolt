import gql from "graphql-tag";

export const UPDATE_USER = gql`
    mutation updateUser($uuid: String!, $updatedUser: UserUpdateInput!) {
        updateUser(uuid:$uuid, updatedUser:$updatedUser) {
            uuid
        }
    }
`;

export const CREATE_ITEM = gql`
    mutation createItem ($newItem: ItemInput!) {
        createItem(newItem: $newItem) {
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

// Having this mutation return the item metadata (everything except ID) is
// what makes the cache update when an item is updated!
export const UPDATE_ITEM = gql`
    mutation updateItem ($itemId: Int!, $updatedItem: ItemInput!) {
        updateItem(id: $itemId, updatedItem: $updatedItem) {
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
