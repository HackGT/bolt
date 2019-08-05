import React, {Component} from "react";
import {Button, Card, Header, Icon, Label} from "semantic-ui-react";
import {RequestedItem} from "../inventory/HardwareItem";
import TimeAgo from "react-timeago";

interface RequestedHardwareItemProps {
    item: RequestedItem;
    handleApprove: (id: number) => void;
    handleDecline: (id: number) => void;
}
class RequestedHardwareItem extends Component<RequestedHardwareItemProps, {}> {
    constructor(props: RequestedHardwareItemProps) {
        super(props);
    }

    public onClickApprove = () => {
        this.props.handleApprove(this.props.item.id);
    }

    public onClickDecline = () => {
        this.props.handleDecline(this.props.item.id);
    }

    public render() {
        return (
            <Card>
              <Card.Content>
                  <Header size="small" className="hardware-item-user-name">
                      <Label circular color="blue">
                          {this.props.item.qtyRequested}x
                      </Label> {this.props.item.name}
                  </Header>
              </Card.Content>
                <Card.Content>
                    <Icon name="wrench"/> 16 in stock, <span style={{color: "red"}}>2 fulfilled</span>
                </Card.Content>
                <Card.Content>
                    <Icon name="user"/> {this.props.item.user}
                </Card.Content>
                <Card.Content>
                    <Icon name="clock outline"/> <TimeAgo date={"August 4, 2019"}/>
                </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                    <Button color="red" onClick={this.onClickDecline}>
                        Decline
                    </Button>
                    <Button color="green" onClick={this.onClickApprove}>
                        Approve
                    </Button>
                </div>
              </Card.Content>
            </Card>
        );
    }
}

export default RequestedHardwareItem;
