import gql from "graphql-tag";

export const ITEM_INFO_FRAGMENT = gql`
  fragment ItemInfoFragment on Item {
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
`;

export const USER_INFO_FRAGMENT = gql`
  fragment UserInfoFragment on User {
    uuid
    name
    email
    phone
    haveID
    admin
  }
`;

export const REQUEST_INFO_FRAGMENT = gql`
  fragment RequestInfoFragment on Request {
    id
    user {
      ...UserInfoFragment
    }
    item {
      id
      name
      qtyUnreserved
      qtyInStock
      qtyAvailableForApproval
      returnRequired
      maxRequestQty
      location {
        id
        name
        hidden
      }
      category {
        id
        name
      }
    }
    status
    quantity
    createdAt
    updatedAt
  }
  ${USER_INFO_FRAGMENT}
`;
