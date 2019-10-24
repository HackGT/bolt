import React from "react";
import {Button, Icon} from "semantic-ui-react";
import {useMutation} from "@apollo/react-hooks";
import {CREATE_REQUEST} from "../util/graphql/Mutations";
import {RequestedItem} from "../../types/Hardware";
import {withToastManager} from "react-toast-notifications";
import {USER_REQUESTS} from "../util/graphql/Queries";
import {User} from "../../types/User";

interface RequestButtonProps {
    requestedItem: RequestedItem,
    user: User,
    toastManager: any
}

function RequestButton({requestedItem, user, toastManager}: RequestButtonProps) {
    const [createRequest, {data, loading, error}] = useMutation(CREATE_REQUEST, {
        refetchQueries: [
            {
                query: USER_REQUESTS,
                variables: {
                    uuid: user.uuid
                },
            },
        ],
    });

    return (
        <Button primary
                icon
                disabled={loading}
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
    );
}

export default withToastManager(RequestButton);
