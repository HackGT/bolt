import React from "react";
import {Button, Icon} from "semantic-ui-react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {CREATE_REQUEST} from "../util/graphql/Mutations";
import {RequestedItem} from "../../types/Hardware";
import {GET_USER} from "../util/graphql/Queries";
import {withToastManager} from "react-toast-notifications";

interface RequestButtonProps {
    request: RequestedItem,
    toastManager: any
}

function RequestButton({request, toastManager}: RequestButtonProps) {
    const {subscribeToMore, ...query} = useQuery(GET_USER);
    const [createRequest, {data, loading, error}] = useMutation(CREATE_REQUEST);

    return (

        <Button primary
                icon
                disabled={loading}
                loading={loading}
                onClick={event => createRequest({
                    variables: {
                        newRequest: {
                            user_id: query.data.user.uuid,
                            request_item_id: request.id,
                            quantity: request.qtyRequested
                        }
                    }
                }).then(toastManager.add(`Successfully requested ${request.qtyRequested}x ${request.name}`, {
                    appearance: "success",
                    autoDismiss: true,
                    placement: "top-center"
                }))}
                labelPosition="right">
            Request {request.qtyRequested}
            <Icon name="arrow alternate circle right outline"/>
        </Button>
    );
}

export default withToastManager(RequestButton);
