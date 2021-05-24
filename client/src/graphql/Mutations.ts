import gql from "graphql-tag";

import { ITEM_INFO_FRAGMENT, USER_INFO_FRAGMENT } from "./Fragments";

export const UPDATE_USER = gql`
  mutation updateUser($uuid: String!, $updatedUser: UserUpdateInput!) {
    updateUser(uuid: $uuid, updatedUser: $updatedUser) {
      uuid
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation createItem($newItem: ItemInput!) {
    createItem(newItem: $newItem) {
      ...ItemInfoFragment
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;

// Having this mutation return the item metadata is what makes the cache update when an item is updated!
export const UPDATE_ITEM = gql`
  mutation updateItem($itemId: Int!, $updatedItem: ItemInput!) {
    updateItem(id: $itemId, updatedItem: $updatedItem) {
      ...ItemInfoFragment
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;

export const CREATE_REQUEST = gql`
  mutation createRequest($newRequest: RequestInput!) {
    createRequest(newRequest: $newRequest) {
      id
      user {
        ...UserInfoFragment
      }
      item {
        id
        name
        qtyAvailableForApproval
        returnRequired
        location {
          id
          name
          hidden
        }
      }
      status
      quantity
      createdAt
      updatedAt
    }
  }
  ${USER_INFO_FRAGMENT}
`;

export const UPDATE_REQUEST = gql`
  mutation updateRequest($updatedRequest: RequestUpdateInput!) {
    updateRequest(updatedRequest: $updatedRequest) {
      id
      user {
        ...UserInfoFragment
      }
      item {
        id
        name
        qtyAvailableForApproval
        returnRequired
        location {
          id
          name
          hidden
        }
      }
      status
      quantity
      createdAt
      updatedAt
    }
  }
  ${USER_INFO_FRAGMENT}
`;

export const CREATE_SETTING = gql`
  mutation createSetting($newSetting: SettingInput!) {
    createSetting(newSetting: $newSetting) {
      name
      value
    }
  }
`;

export const UPDATE_SETTING = gql`
  mutation updateSetting($settingName: String!, $updatedSetting: SettingInput!) {
    updateSetting(name: $settingName, updatedSetting: $updatedSetting) {
      name
      value
    }
  }
`;
