import gql from "graphql-tag";

export const REQUEST_CHANGE = gql`
  subscription rc {
    requestChange {
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
          __typename @skip(if: false)
        }
      }
      status
      quantity
      createdAt
      updatedAt
    }
  }
`;
