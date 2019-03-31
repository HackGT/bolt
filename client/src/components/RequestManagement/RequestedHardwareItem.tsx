import React, {Component} from 'react';
import {Card, Button, Label} from "semantic-ui-react";
import {RequestedItem} from "../inventory/HardwareItem"

interface RequestedHardwareItemProps {
    item: RequestedItem
}
class RequestedHardwareItem extends Component<RequestedHardwareItemProps,{}> {
    render() {
        return (
            <Card>
              <Card.Content>
                <h3 style={{display: "inline", paddingRight: "2rem"}}>{this.props.item.user}</h3>
                <span style={{float: "right"}}><em>Time</em></span>
                <Card.Description>
                <Label circular color="blue">
                    {this.props.item.qtyRequested}x
                </Label>
                    <span style={{paddingLeft: "1rem", paddingTop: "0.5rem"}}>{this.props.item.name}</span>
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button basic color='green'>
                    Approve
                  </Button>
                  <Button basic color='red'>
                    Decline
                  </Button>
                </div>
              </Card.Content>
            </Card>
        )
    }
}

export default RequestedHardwareItem;
