import gql from "graphql-tag";

export const ITEM_EDIT_GET_ITEM = gql`
  query getItem($itemId: Int!) {
    item(id: $itemId) {
      id
      name
      description
      imageUrl
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
      category {
        id
        name
      }
      location {
        id
        name
        hidden
      }
    }
  }
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
          id
          name
          qtyUnreserved
          qtyInStock
          description
          imageUrl
          totalAvailable
          maxRequestQty
          hidden
          approvalRequired
          returnRequired
          owner
          hidden
          qtyAvailableForApproval
          category {
            id
            name
          }
          location {
            id
            name
            hidden
          }
        }
      }
    }
  }
`;

export const USER_INFO = gql`
  query user {
    user {
      uuid
      name
      admin
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
      id
      name
      hidden
    }
    requests(
      search: { statuses: [SUBMITTED, APPROVED, READY_FOR_PICKUP, FULFILLED, LOST, DAMAGED] }
    ) {
      id
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
        uuid
        name
        haveID
        slackUsername
        phone
        email
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
        name
        qtyUnreserved
        qtyInStock
        qtyAvailableForApproval
        description
        imageUrl
        totalAvailable
        maxRequestQty
        hidden
        approvalRequired
        returnRequired
        owner
        hidden
        category {
          id
          name
        }
        location {
          id
          name
          hidden
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
