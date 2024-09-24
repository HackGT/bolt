import React from "react";
import { Button, Icon, Loader, Message } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import { Query } from "@apollo/client/react/components";
import { withToastManager } from "react-toast-notifications";

import { CREATE_REQUEST } from "../../graphql/Mutations";
import { RequestedItem } from "../../types/Hardware";
import { GET_SETTING, USER_REQUESTS } from "../../graphql/Queries";
import { User } from "../../types/User";

interface Props {
  requestedItem: RequestedItem;
  user: User;
  toastManager: any;
}

const RequestButton: React.FC<Props> = ({ requestedItem, user, toastManager }) => {
  const [createRequest, { loading, error }] = useMutation(CREATE_REQUEST, {
    refetchQueries: [
      {
        query: USER_REQUESTS,
        variables: {
          uuid: user.userId,
        },
      },
    ],
  });

  if (loading) {
    return <Loader active inline="centered" content="Just a sec!" />;
  }
  if (error) {
    return (
      <Message
        error
        visible
        header="Can't load button"
        content={`Hmm, an error is preventing us from displaying the button.  The error was: ${error.message}`}
      />
    );
  }
  let requestsAllowed = "true";
  return (
    <Query query={GET_SETTING} variables={{ settingName: "requests_allowed" }}>
      {({ loading: queryLoading, error: queryError, data }: any) => {
        if (queryLoading) {
          return <Loader active inline="centered" content="Just a sec!" />;
        }
        if (!queryError && data.setting !== undefined) {
          requestsAllowed = data.setting.value;
        }
        return (
          <Button
            primary
            icon
            disabled={loading || requestsAllowed === "false"}
            loading={loading}
            onClick={() =>
              createRequest({
                variables: {
                  newRequest: {
                    userId: requestedItem.user,
                    itemId: requestedItem.id,
                    quantity: requestedItem.qtyRequested,
                  },
                },
              })
                .then(
                  toastManager.add(
                    `Successfully requested ${requestedItem.qtyRequested}x ${requestedItem.name}`,
                    {
                      appearance: "success",
                      autoDismiss: true,
                      placement: "top-center",
                    }
                  )
                )
                .catch((err: Error) => {
                  toastManager.add(
                    `Successfully requested ${requestedItem.qtyRequested}x ${requestedItem.name}`,
                    {
                      appearance: "error",
                      autoDismiss: true,
                      placement: "top-center",
                    }
                  );
                })
            }
            labelPosition="right"
          >
            Request {requestedItem.qtyRequested}
            <Icon name="arrow alternate circle right outline" />
          </Button>
        );
      }}
    </Query>
  );
};

export default withToastManager(RequestButton);
