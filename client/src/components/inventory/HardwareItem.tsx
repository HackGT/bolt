import React, {ChangeEvent} from "react";
import {Button, Form, Icon, Input, Item, Label, Popup} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {Link} from "react-router-dom";
import {User} from "../../actions/actions";

export interface Item {
    id: string;
    name: string; // name of this item
    description: string; // brief description
    totalQty: number;
    maxReqQty: number; // max number of a specific item you can request at once
    category: string;
    imageUrl: string;
}

export interface RequestedItem {
    id: string;
    user: string;
    name: string;
    qtyRequested: number;
    category: string;
    status: ItemStatus;
    cancelled: boolean;
}

export enum ItemStatus {
    SUBMITTED = "submitted",
    APPROVED = "approved",
    DECLINED = "declined",
    CANCELLED = "cancelled",
    READY = "ready",
    FULFILLED = "fulfilled",
    RETURNED = "returned",
    LOST = "lost",
    DAMAGED = "damaged"
}

interface HardwareItem {
    qtyRemaining: number; // # of this item remaining in our stock
    requestsEnabled: boolean; // whether hardware requests can be made at this time
    toastManager: any; // for making toast notifications
    addItem: (item: RequestedItem) => void;
    qtyUpdate: RequestedItem | null;
    user: User|null;
}

interface HardwareItemState {
    qtyRequested: number;
    loading: boolean;
    qtyRemaining: number;
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
        this.addCancelledItem = this.addCancelledItem.bind(this);
        this.state = {
            qtyRequested: 1,
            loading: false,
            qtyRemaining: this.props.qtyRemaining
        };
    }

    public finishedLoading() {
        const {toastManager} = this.props;
        toastManager.add(`Successfully requested ${this.state.qtyRequested}x ${this.props.name}`,
            {
                appearance: "success",
                autoDismiss: true,
                placement: "top-center"
            });
        let updatedQtyRemaining = this.state.qtyRemaining - this.state.qtyRequested;
        if (updatedQtyRemaining < 0) {
            updatedQtyRemaining = 0;
        }
        this.setState({
            loading: false,
            qtyRemaining: updatedQtyRemaining
        });
        const newRequest: RequestedItem = {
            id: this.props.id,
            user: "Beardell",
            name: this.props.name,
            qtyRequested: this.state.qtyRequested,
            category: this.props.category,
            status: ItemStatus.SUBMITTED,
            cancelled: false
        };
        this.props.addItem(newRequest);
    }

    public incrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested + 1
        });
    }

    public decrementQty() {
        this.setState({
            qtyRequested: this.state.qtyRequested - 1
        });
    }

    public handleItemRequest() {
        this.setState({
            loading: true
        });
        setTimeout(this.finishedLoading, 3000);
    }

    public handleQtyUpdate(qtyInput: ChangeEvent<HTMLInputElement>) {
        const qtyAsNumber: number = Number.parseInt(qtyInput.target.value, 10);

        this.updateQtyRequested(qtyAsNumber);
    }

    public updateQtyRequested(newQty: number) {
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
        });
    }

    public addCancelledItem(qtyToAdd: number) {
        this.setState({
            qtyRemaining: this.state.qtyRemaining + qtyToAdd
        });
    }

    public componentDidUpdate(prevProps: Item & HardwareItem, prevState: HardwareItemState) {
        if (this.props.qtyUpdate) {
            if (this.props.qtyUpdate.name === this.props.name && this.state.qtyRemaining === prevState.qtyRemaining && !this.props.qtyUpdate.cancelled) {
                this.addCancelledItem(this.props.qtyUpdate.qtyRequested);
                this.props.qtyUpdate.cancelled = true;
            }
        }
    }

    public render() {
        const qtyRequest = this.props.requestsEnabled ? (<Form.Group>
            <Input type="number"
                   placeholder="Quantity"
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
        </Form.Group>) : "";

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
                                 disabled={this.state.loading || (this.state.qtyRequested === this.state.qtyRemaining
                                     && this.state.qtyRemaining <= this.props.maxReqQty
                                     && this.state.qtyRemaining > 0) || (this.state.qtyRequested === this.props.maxReqQty)}/>);
        const qtyRequest2 = this.props.requestsEnabled ? (
            <Input action>
                <input style={{width: 50, textAlign: "center"}}
                       value={this.state.qtyRequested}
                       disabled={this.state.loading}
                       onChange={this.handleQtyUpdate}/>
                <Popup disabled={this.state.loading || !this.state.qtyRequested} inverted trigger={minusBtn}
                       content="Remove one from request"/>
                <Popup disabled={this.state.loading || (this.state.qtyRequested === this.state.qtyRemaining
                    && this.state.qtyRemaining <= this.props.maxReqQty
                    && this.state.qtyRemaining > 0) || (this.state.qtyRequested === this.props.maxReqQty)} inverted
                       trigger={plusBtn} content="Request another"/>
                {requestBtn}
            </Input>) : "";


        let maxPerRequest;
        if (!this.state.qtyRemaining) {
            maxPerRequest = `Request up to ${this.props.maxReqQty} at a time`;
        } else {
            maxPerRequest = `Request up to ${Math.min(this.props.maxReqQty, this.state.qtyRemaining)} at a time`;
        }

        const editBtn = this.props.user && this.props.user.admin ? (<Button size="mini" basic primary={true} icon labelPosition="left">
            <Icon name="pencil"/>
            <Link to={"/item/" + this.props.id}>Edit</Link>
        </Button>) : "";
        return (
            <Item>
                <Item.Image draggable={false} className="hw-image" size="tiny" src="http://placekitten.com/300/300"/>
                <Item.Content>
                    <Item.Header>{this.props.name} {editBtn}</Item.Header>
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
