import React from "react";
import {
    Card,
    Container,
    Header, Icon, Label,
    Loader, Message,
    Step
} from "semantic-ui-react";
import {
    ABANDONED,
    APPROVED, CANCELLED, DAMAGED, DENIED, FULFILLED, LOST,
    READY_FOR_PICKUP, RETURNED,
    SUBMITTED
} from "../../types/Hardware";
import {useQuery} from "@apollo/react-hooks";
import {USER_REQUESTS} from "../util/graphql/Queries";
import {Request} from "../../types/Request";
import ItemAndQuantity from "../desk/ItemAndQuantity";
import {User} from "../../types/User";

interface RequestedListProps {
    user: User
}

function RequestedList({user}: RequestedListProps) {
    const {loading, error, data} = useQuery(USER_REQUESTS, {
        variables: {
            uuid: user.uuid
        },
        pollInterval: 30000
    });
    if (loading) {
        return (
            <Loader active inline="centered"
                    content="Loading your requests..."/>
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
        return data.requests.sort((a: Request, b: Request) => a.item.location.location_name.localeCompare(b.item.location.location_name) || a.item.item_name.localeCompare(b.item.item_name) || a.request_id - b.request_id).map((r: Request) => {

            let idInfo = (r.item.returnRequired) && (
                <Label as='a' color={'yellow'} attached='top right'>
                    <Icon name='id badge'/>
                    Return required
                </Label>
            )

            let locationInfo = (<Card.Content>
                <Label attached='bottom'>
                    <Icon name='map marker alternate'/>
                    Checked out at {r.item.location.location_name}
                </Label>
            </Card.Content>);

            if (r.status == SUBMITTED || r.status === APPROVED) {
                steps = (
                    <Label.Group size={'large'}>
                        <Label
                            color={(r.status === SUBMITTED) ? 'blue' : undefined}>
                            Submitted
                        </Label>
                        <Label
                            color={(r.status === APPROVED) ? 'blue' : undefined}>
                            Approved
                        </Label>
                        <Label>
                            Ready for Pickup
                        </Label>
                    </Label.Group>);
            } else if (r.status === READY_FOR_PICKUP || r.status === FULFILLED) {
                steps = (<Label.Group size={'large'}>
                    <Label
                        color={(r.status === READY_FOR_PICKUP) ? 'green' : undefined}>
                        Ready for Pickup
                    </Label>
                    <Label
                        color={(r.status === FULFILLED) ? 'blue' : undefined}>
                        Fulfilled
                    </Label>
                    {(r.item.returnRequired) &&
                    <Label disabled>
                        Returned
                    </Label>}
                </Label.Group>);
            } else {
                steps = (
                    <Label.Group size={'large'}>
                        {(r.status === RETURNED) &&
                        <Label basic size={'large'} color={'green'}>
                            <Icon name='check circle'/>
                            Returned
                        </Label>}
                        {(r.status === DENIED || r.status === ABANDONED || r.status === CANCELLED) &&
                        <Label size={'large'} color={'red'}>
                            <Icon name='times circle'/>
                            {r.status.charAt(0).toUpperCase() + r.status.substring(1).toLowerCase()}
                        </Label>}
                        {(r.status === LOST || r.status === DAMAGED) &&
                        <Label size={'large'} color={'orange'}>
                            <Icon name='exclamation circle'/>
                            {r.status.charAt(0).toUpperCase() + r.status.substring(1).toLowerCase()}
                        </Label>}
                    </Label.Group>);
            }

            return (
                <Card fluid>
                    <Card.Content>
                        <Card.Header>
                            <ItemAndQuantity quantity={r.quantity}
                                             itemName={r.item.item_name}/>
                            &nbsp;<span style={{
                            color: "gray",
                            fontSize: 14,
                            fontWeight: "normal"
                        }}>#{r.request_id}</span>
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
