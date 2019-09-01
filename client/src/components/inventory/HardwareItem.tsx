import React, {ChangeEvent} from "react";
import {Button, Form, Icon, Input, Item, Label, Popup} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {Link} from "react-router-dom";
import {HwListItem, ItemStatus, RequestedItem} from "../../types/Hardware";

interface HardwareItemState {
    qtyRequested: number;
    loading: boolean;
}


class HardwareItemBase extends React.Component<HwListItem, HardwareItemState> {
    constructor(props: HwListItem) {
        super(props);
        this.state = {
            qtyRequested: 1,
            loading: false,
        };
    }

    public finishedLoading = () => {
        const {toastManager} = this.props;
        toastManager.add(`Successfully requested ${this.state.qtyRequested}x ${this.props.item_name}`,
            {
                appearance: "success",
                autoDismiss: true,
                placement: "top-center"
            });

        this.setState({
            loading: false,
        });
        const newRequest: RequestedItem = {
            id: this.props.id,
            user: "Beardell",
            name: this.props.item_name,
            qtyRequested: this.state.qtyRequested,
            category: this.props.category,
            status: ItemStatus.SUBMITTED,
            cancelled: false
        };
        this.props.addItem(newRequest);
    }

    public incrementQty = () => {
        this.setState({
            qtyRequested: this.state.qtyRequested + 1
        });
    }

    public decrementQty = () => {
        this.setState({
            qtyRequested: this.state.qtyRequested - 1
        });
    }

    public handleItemRequest = () => {
        this.setState({
            loading: true
        });
        setTimeout(this.finishedLoading, 3000);
    }

    public handleQtyUpdate = (qtyInput: ChangeEvent<HTMLInputElement>) => {
        const qtyAsNumber: number = Number.parseInt(qtyInput.target.value, 10);

        this.updateQtyRequested(qtyAsNumber);
    }

    public updateQtyRequested = (qtyRequested: number) => {
        if (Number.isNaN(qtyRequested)) {
            qtyRequested = 0;
        }

        // Clip qtyRequested to between 0 and maxRequestQty (inclusive)
        qtyRequested = Math.min(Math.max(qtyRequested, 0), this.props.maxRequestQty);

        this.setState({
            qtyRequested
        });
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
                       content: this.props.inStock ? "Request" : "Add to waitlist",
                       disabled: this.state.qtyRequested <= 0,
                       loading: this.state.loading,
                       onClick: this.handleItemRequest
                   }}
                   disabled={this.state.loading}
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
                                  disabled={this.state.loading || this.state.qtyRequested === 0}/>);

        const plusBtn = (<Button icon="plus"
                                 onClick={this.incrementQty}
                                 disabled={this.state.loading || this.state.qtyRequested === this.props.maxRequestQty}/>);
        const qtyRequest2 = this.props.requestsEnabled ? (
            <Input action>
                <input style={{width: 50, textAlign: "center"}}
                       value={this.state.qtyRequested}
                       disabled={this.state.loading}
                       onChange={this.handleQtyUpdate}/>
                <Popup disabled={this.state.loading || !this.state.qtyRequested} inverted trigger={minusBtn}
                       content="Remove one from request"/>
                <Popup disabled={this.state.loading} inverted
                       trigger={plusBtn} content="Request another"/>
                {requestBtn}
            </Input>) : "";


        const maxPerRequest = `Request up to ${this.props.maxRequestQty} at a time`;

        const editBtn = this.props.user && this.props.user.admin ? (
            <Popup content="Edit this item" inverted
                   trigger={<Button size="mini" basic primary icon as={Link} to={`admin/items/${this.props.id}`}>
                       <Icon name="pencil"/>
                   </Button>}>
            </Popup>
        ) : "";
        return (
            <Item>
                <Item.Image draggable={false} className="hw-image" size="tiny" src="http://placekitten.com/300/300"/>
                <Item.Content>
                    <Item.Header>{editBtn} {this.props.item_name}</Item.Header>
                    {!this.props.inStock ? <Item.Meta style={{color: "#dc3545"}}>Out of stock</Item.Meta> : ""}
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
