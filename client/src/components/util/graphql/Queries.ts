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
      qtyUnreserved
      qtyInStock
      qtyAvailableForApproval
      hidden
      owner
      location {
        location_id
        location_name
        location_hidden
      }
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

export const ALL_LOCATIONS = gql`
  query locations {
    locations {
      location_id
      location_name
      location_hidden
    }
  }
`;

export const ALL_ITEMS = gql`
  query {
    allItems {
      location {
        location_id
        location_name
        location_hidden
      }
      categories {
        category {
          category_id
          category_name
        }
        items {
          id
          qtyUnreserved
          qtyInStock
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
          qtyAvailableForApproval
          location {
            location_id
            location_name
            location_hidden
          }
        }
      }
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
    locations {
      location_id
      location_name
      location_hidden
    }
    requests(
      search: { statuses: [SUBMITTED, APPROVED, READY_FOR_PICKUP, FULFILLED, LOST, DAMAGED] }
    ) {
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

export const USER_REQUESTS = gql`
  query userRequests($uuid: String!) {
    locations {
      location_id
      location_name
      location_hidden
    }
    requests(search: { user_id: $uuid }) {
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

export const USER_PROFILE = gql`
  query users($uuid: String!) {
    users(search: { uuid: $uuid }) {
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
        id
        qtyUnreserved
        qtyInStock
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
        qtyAvailableForApproval
        location {
          location_id
          location_name
          location_hidden
        }
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
`;
