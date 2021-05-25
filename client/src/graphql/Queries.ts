import gql from "graphql-tag";

import { ITEM_INFO_FRAGMENT, REQUEST_INFO_FRAGMENT, USER_INFO_FRAGMENT } from "./Fragments";

export const ITEM_EDIT_GET_ITEM = gql`
  query getItem($itemId: Int!) {
    item(id: $itemId) {
      ...ItemInfoFragment
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;

export const ALL_CATEGORIES = gql`
  query categories {
    categories {
      id
      name
    }
  }
`;

export const ALL_LOCATIONS = gql`
  query locations {
    locations {
      id
      name
      hidden
    }
  }
`;

export const ALL_ITEMS = gql`
  query {
    allItems {
      location {
        id
        name
        hidden
      }
      categories {
        category {
          id
          name
        }
        items {
          ...ItemInfoFragment
        }
      }
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;

export const USER_INFO = gql`
  query user {
    user {
      ...UserInfoFragment
    }
  }
  ${USER_INFO_FRAGMENT}
`;

export const ALL_USERS = gql`
  query users {
    users(search: {}) {
      ...UserInfoFragment
    }
  }
  ${USER_INFO_FRAGMENT}
`;

export const ALL_REQUESTS = gql`
  query requests {
    requests(search: {}) {
      ...RequestInfoFragment
    }
  }
  ${REQUEST_INFO_FRAGMENT}
`;

export const GET_REQUEST = gql`
  query request($requestId: Int!) {
    request(id: $requestId) {
      ...RequestInfoFragment
    }
  }
  ${REQUEST_INFO_FRAGMENT}
`;

export const REQUEST_FORM_INFO = gql`
  query requestForm {
    users(search: {}) {
      uuid
      name
      email
    }
    items {
      ...ItemInfoFragment
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;

export const DESK_REQUESTS = gql`
  query {
    locations {
      id
      name
      hidden
    }
    requests(
      search: { statuses: [SUBMITTED, APPROVED, READY_FOR_PICKUP, FULFILLED, LOST, DAMAGED] }
    ) {
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

export const USER_REQUESTS = gql`
  query userRequests($uuid: String!) {
    locations {
      id
      name
      hidden
    }
    requests(search: { userId: $uuid }) {
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

export const USER_PROFILE = gql`
  query users($uuid: String!) {
    users(search: { uuid: $uuid }) {
      ...UserInfoFragment
    }
  }
  ${USER_INFO_FRAGMENT}
`;

export const GET_SETTING = gql`
  query getSetting($settingName: String!) {
    setting(name: $settingName) {
      name
      value
    }
  }
`;

export const DETAILED_ITEM_STATISTICS = gql`
  query {
    itemStatistics {
      item {
        ...ItemInfoFragment
      }
      detailedQuantities {
        SUBMITTED
        APPROVED
        DENIED
        ABANDONED
        CANCELLED
        READY_FOR_PICKUP
        FULFILLED
        RETURNED
        LOST
        DAMAGED
        total
      }
    }
  }
  ${ITEM_INFO_FRAGMENT}
`;
