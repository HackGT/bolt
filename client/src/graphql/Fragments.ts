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
