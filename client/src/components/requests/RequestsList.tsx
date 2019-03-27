import React, {Component} from 'react';
import {Header, Icon, Segment, Card, Image, Button, Label, Grid, Divider, Container, Step} from "semantic-ui-react";
import {RequestedItem, ItemStatus} from "../inventory/HardwareItem"

class RequestsList extends Component<{requestedItemsList: RequestedItem[], removeItem: (index: number) => void}>{
    getItemStatusString(status: ItemStatus) {
        switch(status) {
            case ItemStatus.SUBMITTED: return "Submitted"
            case ItemStatus.APPROVED: return "Approved"
            case ItemStatus.DECLINED: return "Declined"
            case ItemStatus.ABANDONED: return "Abandoned"
            case ItemStatus.READY: return "Ready"
            case ItemStatus.FULFILLED: return "Fulfilled"
            case ItemStatus.RETURNED: return "Returned"
            case ItemStatus.LOST: return "Lost"
            case ItemStatus.DAMAGED: return "Damaged"
        }
    }

    render() {
        const noRequest = (
            <Segment placeholder>
                <Container textAlign="center">
                        <Header>
                            You haven't requested any hardware yet.
                        </Header>
                </Container>
            </Segment>
        )
        const requestIsThere = <h1>YAS</h1>
        return this.props.requestedItemsList.length == 0 ? noRequest : (
            <Segment placeholder>
                <Card.Group>
                    {this.props.requestedItemsList.map((item, index ) => {
                        return (
                            <Card key={index} fluid>
                                <Card.Content>
                                    <Card.Header>{item.name}</Card.Header>
                                    <Card.Description>


                                        <Label medium circular color="blue">{item.qtyRequested}</Label>

                                        <Label large color={item.status}>{this.getItemStatusString(item.status)}</Label>

                                        <Button floated="right" basic color="red" onClick={() => {this.props.removeItem(index)}}>
                                            Cancel Request
                                        </Button>

                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        )
                    })}
                </Card.Group>
            </Segment>
        );
    }
}

export default RequestsList;
