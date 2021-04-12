import React from "react";
import {Button, Icon, Loader, Message} from "semantic-ui-react";
import {useMutation} from "@apollo/client";
import {Query} from "@apollo/client/react/components";
import {CREATE_REQUEST} from "../util/graphql/Mutations";
import {RequestedItem} from "../../types/Hardware";
import {withToastManager} from "react-toast-notifications";
import {GET_SETTING, USER_REQUESTS} from "../util/graphql/Queries";
import {User} from "../../types/User";

interface RequestButtonProps {
    requestedItem: RequestedItem,
    user: User,
    toastManager: any
}

function RequestButton({requestedItem, user, toastManager}: RequestButtonProps) {
    const [createRequest, {loading, error}] = useMutation(CREATE_REQUEST, {
        refetchQueries: [
            {
                query: USER_REQUESTS,
                variables: {
                    uuid: user.uuid
                },
            },
        ],
    });

    if (loading) {
        return <Loader active inline="centered" content="Just a sec!"/>;
    }
    if (error) {
        return <Message error visible={true}
                        header="Can't load button"
                        content={`Hmm, an error is preventing us from displaying the button.  The error was: ${error.message}`}
        />;
    }
    let requests_allowed = "true";
    return (
        <Query
            query={GET_SETTING}
            variables={{settingName: "requests_allowed"}}
        >
          {
              ({loading, error, data}: any) => {
                if (loading) {
                    return <Loader active inline="centered" content="Just a sec!"/>;
                }
                if (!error && data.setting !== undefined) {
                  requests_allowed = data.setting.value;
                }
                return <Button primary
                        icon
                        disabled={loading || (requests_allowed === "false")}
                        loading={loading}
                        onClick={event => createRequest({
                            variables: {
                                newRequest: {
                                    user_id: requestedItem.user,
                                    request_item_id: requestedItem.id,
                                    quantity: requestedItem.qtyRequested
                                }
                            }
                        }).then(toastManager.add(`Successfully requested ${requestedItem.qtyRequested}x ${requestedItem.name}`, {
                            appearance: "success",
                            autoDismiss: true,
                            placement: "top-center"
                        })).catch((err: Error) => {
                            toastManager.add(`Successfully requested ${requestedItem.qtyRequested}x ${requestedItem.name}`, {
                                appearance: "error",
                                autoDismiss: true,
                                placement: "top-center"
                            })
                        })
                        }
                        labelPosition="right">
                    Request {requestedItem.qtyRequested}
                    <Icon name="arrow alternate circle right outline"/>
                </Button>
              }
          }
        </Query>
    );
}

export default withToastManager(RequestButton);
