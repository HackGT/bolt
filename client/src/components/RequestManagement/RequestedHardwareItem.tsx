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
        console.log(this.props);
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
