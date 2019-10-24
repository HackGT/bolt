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
    Location,
    SUBMITTED
} from "../../types/Hardware";
import {useQuery} from "@apollo/react-hooks";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request} from "../../types/Request";
import ItemAndQuantity from "../desk/ItemAndQuantity";

function filteredRequests(requests: Request[], locationFilter: string): Request[] {
    return requests.filter((r: Request) => r.item.location.location_name === locationFilter);
}

function RequestedList() {
    const {loading, error, data} = useQuery(DESK_REQUESTS, {
        pollInterval: 500
    });
    if (loading) {
        return (
            <Loader active inline="centered" content="Loading your requests..."/>
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
        const locations:Location[] = data.locations;
        locations.sort((a:Location, b:Location) => a.location_name.localeCompare(b.location_name))
        return data.requests.sort((a:Request, b:Request) => a.item.item_name.localeCompare(b.item.item_name)).sort((a:Request, b:Request) => a.item.location.location_name.localeCompare(b.item.location.location_name)).map((r: Request) => {
            if (r.item.returnRequired) {
                idInfo = (<Label as='a' color={'yellow'} attached='top right'>
                    <Icon name='id badge' />
                    Return required
                </Label>)
            }

            let locationInfo = (<Label>
                <Icon name='map marker alternate' />
                Checked out at {r.item.location.location_name}
            </Label>)

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

            if (r.status === FULFILLED && r.item.returnRequired) {
                steps = (
                    <Step.Group stackable='tablet' size='mini'>
                        <Step>
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
            }
            if (r.status === FULFILLED && !r.item.returnRequired) {
                steps = (
                    <Step.Group stackable='tablet' size='mini'>
                        <Step active>
                            <Step.Content>
                                <Step.Title>Fulfilled</Step.Title>
                            </Step.Content>
                        </Step>
                    </Step.Group>);
            }

            return (
                <Card fluid>
                    <Card.Content>
                        <Card.Header>
                            <ItemAndQuantity quantity={r.quantity}
                                             itemName={r.item.item_name}/>
                            &nbsp;<span style={{color: "gray", fontSize: 14, fontWeight: "normal"}}>#{r.request_id}</span>
                        </Card.Header>
                        <Card.Description>
                            {steps}
                        </Card.Description>
                    </Card.Content>
                    {idInfo}
                    {locationInfo}
                </Card>
            );
        });
    }
}

export default RequestedList;
