import React from "react";
import {Button, Icon} from "semantic-ui-react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {CREATE_REQUEST} from "../util/graphql/Mutations";
import {RequestedItem} from "../../types/Hardware";
import {GET_USER} from "../util/graphql/Queries";

interface RequestButtonProps {
    request: RequestedItem,
}

function RequestButton({request}: RequestButtonProps) {
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
                })}
                labelPosition="right">
            Request {request.qtyRequested}
            <Icon name="arrow alternate circle right outline"/>
        </Button>
    );
}

export default RequestButton;
