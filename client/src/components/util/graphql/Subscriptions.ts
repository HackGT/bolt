import gql from "graphql-tag";

import { USER_INFO_FRAGMENT } from "./Fragments";

export const REQUEST_CHANGE = gql`
  subscription rc {
    requestChange {
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
          __typename @skip(if: false)
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
