import React, {ChangeEvent} from 'react';
import {Form, Input, Item, Label} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {RequestItem, ItemStatus} from "./HardwareList";

interface HardwareItemProps {
    name: string, // name of this item
    description: string, // brief description
    requestsEnabled: boolean, // whether hardware requests can be made at this time
    toastManager: any, // for making toast notifications
    qtyRemaining: number, // # of this item remaining in our stock
    totalQty: number,
    maxReqQty: number, // max number of a specific item you can request at once
    category: string,
    addRequestedItem: (requestItem: RequestItem) => void
}

interface HardwareItemState {
    qtyRequested: number,
    loading: boolean,
    qtyRemaining: number
}


class HardwareItemBase extends React.Component<HardwareItemProps, HardwareItemState> {
    constructor(props: HardwareItemProps) {
        super(props);
        this.handleItemRequest = this.handleItemRequest.bind(this);
        this.handleQtyUpdate = this.handleQtyUpdate.bind(this);
        this.finishedLoading = this.finishedLoading.bind(this);
        this.state = {
            qtyRequested: 1,
            loading: false,
            qtyRemaining: this.props.qtyRemaining
        }
    }

    finishedLoading() {
        const {toastManager} = this.props;
        toastManager.add(`Successfully requested ${this.state.qtyRequested}x ${this.props.name}`,
            {
                appearance: 'success',
                autoDismiss: true,
                placement: "top-center"
            });
        let updatedQtyRemaining = this.state.qtyRemaining - this.state.qtyRequested;
        if (updatedQtyRemaining < 0) {
            updatedQtyRemaining = 0;
        }
        let requestItem: RequestItem = {
            item: this.props.name,
            quantity: this.state.qtyRequested,
            status: ItemStatus.Submitted
        }
        this.setState({
            loading: false,
            qtyRequested: 1,
            qtyRemaining: updatedQtyRemaining
        });

        this.props.addRequestedItem(requestItem);
    }

    handleItemRequest() {
        this.setState({
            loading: true
        });
        setTimeout(this.finishedLoading, 3000);
    }

    handleQtyUpdate(qtyInput: ChangeEvent<HTMLInputElement>) {
        let qtyAsNumber: number = Number.parseInt(qtyInput.target.value);

        if (Number.isNaN(qtyAsNumber)) {
            qtyAsNumber = 0;
        }

        if (qtyAsNumber < 0) {
            qtyAsNumber = 0;
        }

        if (qtyAsNumber > this.state.qtyRemaining
            && this.state.qtyRemaining <= this.props.maxReqQty
            && this.state.qtyRemaining > 0) {
            qtyAsNumber = this.state.qtyRemaining;
        } else if (qtyAsNumber > this.props.maxReqQty) {
            qtyAsNumber = this.props.maxReqQty;
        }

        this.setState({
            qtyRequested: qtyAsNumber
        })
    }

    render() {
        const qtyRequest = this.props.requestsEnabled ? (<Form.Group>
            <Input type='number'
                   placeholder='Quantity'
                   floated="right"
                   action={{
                       color: "blue",
                       labelPosition: "right",
                       icon: "arrow alternate circle right outline",
                       content: this.state.qtyRemaining > 0 ? "Request" : "Add to waitlist",
                       disabled: this.state.qtyRequested <= 0,
                       loading: this.state.loading,
                       onClick: this.handleItemRequest
                   }}
                   disabled={this.state.loading}
                   onChange={this.handleQtyUpdate}
                   value={this.state.qtyRequested}>
            </Input>
        </Form.Group>) : '';
        let maxPerRequest;
        if (!this.state.qtyRemaining) {
            maxPerRequest = `Request up to ${this.props.maxReqQty} at a time`
        } else {
            maxPerRequest = `Request up to ${Math.min(this.props.maxReqQty, this.state.qtyRemaining)} at a time`;
        }
        return (
            <Item className="hw-card">
                <Item.Image draggable={false} className="hw-image" size='tiny' src='http://placekitten.com/300/300'/>
                <Item.Content>
                    <Item.Header>{this.props.name}</Item.Header>
                    <Item.Meta>{!this.state.qtyRemaining ? "Out of stock" : `${this.state.qtyRemaining} of ${this.props.totalQty} available`}</Item.Meta>
                    <Item.Meta>{maxPerRequest}</Item.Meta>
                    <Item.Meta><Label>{this.props.category}</Label></Item.Meta>
                    <Item.Description>{this.props.description}</Item.Description>
                    <Item.Extra>{qtyRequest}</Item.Extra>
                </Item.Content>
            </Item>
        );
    }
}

const HardwareItem = withToastManager(HardwareItemBase);

export default HardwareItem;
