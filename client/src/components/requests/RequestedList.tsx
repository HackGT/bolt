import React from "react";
import {
    Card,
    Container,
    Header, Icon, Item,
    Label, Loader, Message,
    Step
} from "semantic-ui-react";
import {RequestedItem} from "../../types/Hardware";
import {useQuery} from "@apollo/react-hooks";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request} from "../../types/Request";
import ItemAndQuantity from "../desk/ItemAndQuantity";

interface RequestedListProps {
    requestedItemsList: RequestedItem[]
}

function RequestedList({requestedItemsList}: RequestedListProps) {
    const {loading, error, data} = useQuery(DESK_REQUESTS, {
        pollInterval: 500
    });
    if (loading) {
        return (
            <Loader active inline="centered" content="Please wait..."/>
        );
    }

    if (error) {
        return (
            <Message
                title="View-only inventory"
                warning icon>
                <Icon name="warning sign"/>
                {error.message}
            </Message>);
    }

    let steps = (
        <Step.Group>
            <Step>
                <Step.Content>
                    <Step.Title>Loading steps</Step.Title>
                </Step.Content>
            </Step>
        </Step.Group>
    );

    if (data.requests.length === 0) {
        return (
            <Container textAlign="center">
                <Header>
                    You haven't requested any hardware yet. To request an item,
                    select the quantity and click on the blue Request button.
                </Header>
            </Container>
        );
    }

    if (data.requests.length > 0) {
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
                            <ItemAndQuantity quantity={r.quantity}
                                             itemName={r.item.item_name}/>
                        </Card.Header>
                        <Card.Description>
                            {steps}
                        </Card.Description>
                    </Card.Content>
                </Card>
            </Card.Group>);
        });
    }
}

export default RequestedList;
