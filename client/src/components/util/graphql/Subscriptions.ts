import gql from "graphql-tag";

export const REQUEST_CHANGE = gql`
  subscription rc {
    request_change {
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
