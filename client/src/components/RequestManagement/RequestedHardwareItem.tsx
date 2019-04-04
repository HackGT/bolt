import React, {Component} from "react";
import {Button, Card, Label} from "semantic-ui-react";
import {RequestedItem} from "../inventory/HardwareItem";

interface RequestedHardwareItemProps {
    item: RequestedItem,
    handleApprove: (id: number) => void,
    handleDecline: (id: number) => void,
}
class RequestedHardwareItem extends Component<RequestedHardwareItemProps,{}> {
    constructor(props: RequestedHardwareItemProps) {
        super(props);
        this.onClickApprove = this.onClickApprove.bind(this);
        this.onClickDecline = this.onClickDecline.bind(this);
    }
    onClickApprove() {
        this.props.handleApprove(this.props.item.id);
    }

    onClickDecline() {
        this.props.handleDecline(this.props.item.id);
    }

    render() {
        return (
            <Card>
              <Card.Content>
                <h3 className="hardware-item-user-name">{this.props.item.user}</h3>
                <span style={{float: "right"}}><em>Time</em></span>
                <Card.Description>
                <Label circular color="blue">
                    {this.props.item.qtyRequested}x
                </Label>
                    <span className="hardware-item-name">{this.props.item.name}</span>
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button color='green' onClick={this.onClickApprove}>
                    Approve
                  </Button>
                  <Button color='red' onClick={this.onClickDecline}>
                    Decline
                  </Button>
                </div>
              </Card.Content>
            </Card>
        )
    }
}

export default RequestedHardwareItem;
