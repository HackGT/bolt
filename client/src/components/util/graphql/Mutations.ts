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
            location {
                location_id
                location_name
                location_hidden
            }
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
            hidden
            location {
                location_id
                location_name
                location_hidden
            }
        }
    }
`;

export const CREATE_REQUEST = gql`
    mutation createRequest($newRequest: RequestInput!) {
        createRequest(newRequest: $newRequest) {
            request_id
            user {
                uuid
                name
                haveID
            }
            item {
                id
                item_name
                qtyAvailableForApproval
                returnRequired
            }
            location {
                location_id
                location_name
                location_hidden
            }
            status
            quantity
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_REQUEST = gql`
    mutation updateRequest($updatedRequest: RequestUpdateInput!) {
        updateRequest(updatedRequest: $updatedRequest) {
            request_id
            user {
                uuid
                name
                haveID
                slackUsername
                phone
                email
            }
            item {
                id
                item_name
                qtyAvailableForApproval
                returnRequired
                location {
                    location_id
                    location_name
                    location_hidden
                }
            }
            status
            quantity
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_SETTING = gql`
    mutation createSetting ($newSetting: SettingInput!) {
        createSetting(newSetting: $newSetting) {
            name
            value
        }
    }
`;

export const UPDATE_SETTING = gql`
    mutation updateSetting ($settingName: String!, $updatedSetting: SettingInput!) {
        updateSetting(name: $settingName, updatedSetting: $updatedSetting) {
            name
            value
        }
    }
`;
