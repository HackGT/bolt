import React from "react";
import {
    Button,
    Card,
    Container,
    Header,
    Label,
    Segment, Step
} from "semantic-ui-react";
import {RequestedItem} from "../../types/Hardware";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request} from "../../types/Request";
import {DELETE_REQUEST} from "../util/graphql/Mutations";

interface RequestedListProps {
    requestedItemsList: RequestedItem[],
}

// function cancelRequestButton(requestId: number) {
//     const [deleteRequest, {data, loading, error}] = useMutation(DELETE_REQUEST);
//     return <Button floated="right" basic
//                    color="red"
//                    onClick={event => deleteRequest({
//                        variables: {
//                            deleteRequest: {
//                                id: requestId
//                            }
//                        }
//                    })}>
//         Cancel Request
//     </Button>;
// }

function RequestedList({requestedItemsList}: RequestedListProps) {
    const noRequest = (
        <Segment placeholder>
            <Container textAlign="center">
                <Header>
                    You haven't requested any hardware yet.
                </Header>
            </Container>
        </Segment>
    );
    const requestIsThere = <h1>YAS</h1>;
    const {loading, error, data} = useQuery(DESK_REQUESTS);
    const [deleteRequest] = useMutation(DELETE_REQUEST);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
    let steps = (
        <Step.Group>
            <Step>
                <Step.Content>
                    <Step.Title>Loading steps</Step.Title>
                </Step.Content>
            </Step>
        </Step.Group>
    );

    return data.requests.map((r: Request, index: number) => {
        if (r.status === 'SUBMITTED') {
            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step active>
                        <Step.Content>
                            <Step.Title>Submitted</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step disabled>
                        <Step.Content>
                            <Step.Title>Approved</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step disabled>
                        <Step.Content>
                            <Step.Title>Ready for
                                Pickup</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);
        } else if (r.status === 'APPROVED') {
            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step>
                        <Step.Content>
                            <Step.Title>Submitted</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step active>
                        <Step.Content>
                            <Step.Title>Approved</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step disabled>
                        <Step.Content>
                            <Step.Title>Ready for
                                Pickup</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);
        } else if (r.status === 'READY_FOR_PICKUP') {
            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step>
                        <Step.Content>
                            <Step.Title>Submitted</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step>
                        <Step.Content>
                            <Step.Title>Approved</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step active>
                        <Step.Content>
                            <Step.Title>Ready for
                                Pickup</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);
        } else if (r.status === 'FULFILLED' && r.item.returnRequired) {
            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step active>
                        <Step.Content>
                            <Step.Title>Fulfilled</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step disabled>
                        <Step.Content>
                            <Step.Title>Returned</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);
        } else if (r.status === 'FULFILLED' && !r.item.returnRequired) {
            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step active>
                        <Step.Content>
                            <Step.Title>Fulfilled</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step>
                        <Step.Content>
                            <Step.Title>Optional Return</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);
        }

        return (<Card.Group>
            <Card key={index} fluid>
                <Card.Content>
                    <Card.Header>
                        <Label medium circular color="blue">
                            {r.quantity}
                        </Label>
                        {" " + r.item.item_name}
                        <Button floated="right" basic
                                color="red"
                                onClick={event => deleteRequest({
                                    variables: {
                                        deleteRequest: {
                                            id: r.request_id
                                        }
                                    }
                                })}>
                            Cancel Request
                        </Button>
                    </Card.Header>
                    {steps}
                    <Card.Description>
                    </Card.Description>
                </Card.Content>
            </Card>
        </Card.Group>);
    });
}

export default RequestedList;
