import React, {ChangeEvent} from 'react';
import {Button, Form, Icon, Input, Item, Label, Popup} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {RequestItem, ItemStatus} from "./HardwareList";
import {Link} from "react-router-dom";

export interface Item {
    id: number,
    name: string, // name of this item
    description: string, // brief description
    totalQty: number,
    maxReqQty: number, // max number of a specific item you can request at once
    category: string,
    addRequestedItem: (requestItem: RequestItem) => void
    imageUrl: string
}

interface HardwareItem {
    qtyRemaining: number, // # of this item remaining in our stock
    requestsEnabled: boolean, // whether hardware requests can be made at this time
    toastManager: any, // for making toast notifications
}

interface HardwareItemState {
    qtyRequested: number,
    loading: boolean,
    qtyRemaining: number
}


class HardwareItemBase extends React.Component<Item & HardwareItem, HardwareItemState> {
    constructor(props: Item & HardwareItem) {
        super(props);
        this.handleItemRequest = this.handleItemRequest.bind(this);
        this.handleQtyUpdate = this.handleQtyUpdate.bind(this);
        this.finishedLoading = this.finishedLoading.bind(this);
        this.incrementQty = this.incrementQty.bind(this);
        this.decrementQty = this.decrementQty.bind(this);
        this.updateQtyRequested = this.updateQtyRequested.bind(this);
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

    incrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested + 1
        });
    }

    decrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested - 1
        });
    }

    incrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested + 1
        });
    }

    decrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested - 1
        });
    }

    handleItemRequest() {
        this.setState({
            loading: true
        });
        setTimeout(this.finishedLoading, 3000);
    }

    handleQtyUpdate(qtyInput: ChangeEvent<HTMLInputElement>) {
        let qtyAsNumber: number = Number.parseInt(qtyInput.target.value);

        this.updateQtyRequested(qtyAsNumber);
    }

    updateQtyRequested(newQty: number) {
        if (Number.isNaN(newQty)) {
            newQty = 0;
        }

        if (newQty < 0) {
            newQty = 0;
        }

        if (newQty > this.state.qtyRemaining
            && this.state.qtyRemaining <= this.props.maxReqQty
            && this.state.qtyRemaining > 0) {
            newQty = this.state.qtyRemaining;
        } else if (newQty > this.props.maxReqQty) {
            newQty = this.props.maxReqQty;
        }

        this.setState({
            qtyRequested: newQty
        })
    }

    render() {
        const qtyRequest = this.props.requestsEnabled ? (<Form.Group>
            <Input type='number'
                   placeholder='Quantity'
                   floated="right"
                   style={{
                       width: 75
                   }}
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

        const requestBtn = (
            <Button primary
                    icon
                    disabled={this.state.qtyRequested <= 0}
                    loading={this.state.loading}
                    onClick={this.handleItemRequest}
                    labelPosition="right"
            >Request {this.state.qtyRequested}<Icon name="arrow alternate circle right outline"/></Button>
        );

        const minusBtn = (<Button icon="minus"
                                  onClick={this.decrementQty}
                                  disabled={this.state.loading || !this.state.qtyRequested}/>);

        const plusBtn = (<Button icon="plus"
                                 onClick={this.incrementQty}
                                 disabled={this.state.loading || (this.state.qtyRequested == this.state.qtyRemaining
                                     && this.state.qtyRemaining <= this.props.maxReqQty
                                     && this.state.qtyRemaining > 0) || (this.state.qtyRequested == this.props.maxReqQty)}/>);
        const qtyRequest2 = (
            <Input action>
                <input style={{width: 50, textAlign: "center"}}
                       value={this.state.qtyRequested}
                       disabled={this.state.loading}
                       onChange={this.handleQtyUpdate}/>
                <Popup disabled={this.state.loading || !this.state.qtyRequested} inverted trigger={minusBtn}
                       content="Remove one from request"/>
                <Popup disabled={this.state.loading || (this.state.qtyRequested == this.state.qtyRemaining
                    && this.state.qtyRemaining <= this.props.maxReqQty
                    && this.state.qtyRemaining > 0) || (this.state.qtyRequested == this.props.maxReqQty)} inverted
                       trigger={plusBtn} content="Request another"/>
                {requestBtn}
            </Input>

        );
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
                    <Item.Header>{this.props.name} <Button size="mini" basic primary={true} icon labelPosition='left'>
                        <Icon name='pencil'/>
                        <Link to={"/item/" + this.props.id}>Edit</Link>
                    </Button></Item.Header>
                    <Item.Meta>{!this.state.qtyRemaining ? "Out of stock" : `${this.state.qtyRemaining} of ${this.props.totalQty} available`}</Item.Meta>
                    <Item.Meta>{maxPerRequest}</Item.Meta>
                    <Item.Meta><Label>{this.props.category}</Label></Item.Meta>
                    <Item.Description>{this.props.description}</Item.Description>
                    <Item.Extra>{qtyRequest2}</Item.Extra>
                </Item.Content>
            </Item>
        );
    }
}

const HardwareItem = withToastManager(HardwareItemBase);

export default HardwareItem;
