import React from "react";
import {
    Card,
    Container,
    Header, Icon, Label,
    Loader, Message,
    Step
} from "semantic-ui-react";
import {
    APPROVED, FULFILLED,
    READY_FOR_PICKUP,
    RequestedItem,
    SUBMITTED
} from "../../types/Hardware";
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
                title="Error displaying requests"
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

    let idInfo = (
        <Label as='a'>
        </Label>
    )

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
            if (r.item.returnRequired) {
                idInfo = (<Label as='a' color={'yellow'} attached='top right'>
                    <Icon name='id badge' />
                    Return required
                </Label>)
            }

            steps = (
                <Step.Group stackable='tablet' size='mini'>
                    <Step active={r.status === SUBMITTED} disabled={r.status !== SUBMITTED}>
                        <Step.Content>
                            <Step.Title>Submitted</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step active={r.status === APPROVED} disabled={r.status !== APPROVED}>
                        <Step.Content>
                            <Step.Title>Approved</Step.Title>
                        </Step.Content>
                    </Step>
                    <Step active={r.status === READY_FOR_PICKUP} disabled={r.status !== READY_FOR_PICKUP}>
                        <Step.Content>
                            <Step.Title>Ready for
                                Pickup</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>);

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
                    {idInfo}
                </Card>
            </Card.Group>);
        });
    }
}

export default RequestedList;
