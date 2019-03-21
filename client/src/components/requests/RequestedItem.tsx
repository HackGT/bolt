import React, {Component} from "react";
import {RequestItem} from "../inventory/HardwareList";
import {Header, Icon, Segment, Card, Image, Button, Label, Divider} from "semantic-ui-react";

export class RequestedItem extends Component<{requestedItem: RequestItem, removeRequestedItem: (requestedItem: RequestItem) => any}> {
    constructor(props: {requestedItem: RequestItem, removeRequestedItem: (requestedItem: RequestItem) => any}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        let itemToRemove: RequestItem = {
            item: this.props.requestedItem.item,
            quantity: this.props.requestedItem.quantity,
            status: this.props.requestedItem.status
        }
        this.props.removeRequestedItem(itemToRemove);
    }
    render() {
        return (
            <Card fluid>
                <Card.Content>
                    <Card.Header>
                        {this.props.requestedItem.item}
                    </Card.Header>
                    <Card.Meta>
                        <p>Beardell</p>
                        <Label circular color="blue" size="medium">
                            {this.props.requestedItem.quantity}
                        </Label>
                        <Label color={this.props.requestedItem.status}>
                            Pending
                        </Label>
                        <Button onClick={this.handleClick} floated="right" color="red">
                            Cancel Request
                        </Button>
                    </Card.Meta>
                </Card.Content>
            </Card>
        )
    }
}
