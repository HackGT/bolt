import React, {ChangeEvent} from "react";
import {
    Button,
    Icon,
    Input,
    Item,
    Popup
} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {Link} from "react-router-dom";
import {
    HwItem,
    ItemStatus,
    RequestedItem
} from "../../types/Hardware";
import {AppState} from "../../state/Store";
import {connect} from "react-redux";
import {User} from "../../types/User";
import RequestButton from "./RequestButton";

interface HardwareItemState {
    qtyRequested: number;
    loading: boolean;
}

interface HardwareItemProps {
    item: HwItem;
    toastManager: any;
    requestsEnabled: boolean;
    user: User | null;
    preview?: boolean;
}

function itemImage(src: string, outOfStock: boolean = false) {

    return <Item.Image draggable={false} size="tiny"
                       src={src || "http://placekitten.com/300/300"}
                       label={outOfStock && {
                           color: "red",
                           content: "Out of stock",
                           ribbon: true
                       }}
    />;
}

class HardwareItem extends React.Component<HardwareItemProps, HardwareItemState> {
    constructor(props: HardwareItemProps) {
        super(props);
        this.state = {
            qtyRequested: 1,
            loading: false,
        };
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

    public handleQtyUpdate = (qtyInput: ChangeEvent<HTMLInputElement>) => {
        const qtyAsNumber: number = Number.parseInt(qtyInput.target.value, 10);

        this.updateQtyRequested(qtyAsNumber);
    }

    public updateQtyRequested = (qtyRequested: number) => {
        if (Number.isNaN(qtyRequested)) {
            qtyRequested = 0;
        }

        // Clip qtyRequested to between 0 and maxRequestQty (inclusive)
        qtyRequested = Math.min(Math.max(qtyRequested, 0), this.props.item.maxRequestQty);

        this.setState({
            qtyRequested
        });
    }

    public render() {
        const newRequest: RequestedItem = {
            id: this.props.item.id,
            user: "Beardell",
            name: this.props.item.item_name,
            qtyRequested: this.state.qtyRequested,
            category: this.props.item.category,
            status: ItemStatus.SUBMITTED,
            cancelled: false
        };

        const minusBtn = (<Button icon="minus"
                                  onClick={this.decrementQty}
                                  disabled={this.state.loading || this.state.qtyRequested === 0}/>);

        const plusBtn = (<Button icon="plus"
                                 onClick={this.incrementQty}
                                 disabled={this.state.loading || this.state.qtyRequested === this.props.item.maxRequestQty}/>);
        const qtyRequest = this.props.requestsEnabled ? (
            <Input action>
                <input style={{width: 50, textAlign: "center"}}
                       value={this.state.qtyRequested}
                       disabled={this.state.loading}
                       onChange={this.handleQtyUpdate}/>
                <Popup disabled={this.state.loading || !this.state.qtyRequested}
                       inverted trigger={minusBtn}
                       content="Remove one from request"/>
                <Popup disabled={this.state.loading} inverted
                       trigger={plusBtn} content="Request another"/>
                {/*{requestBtn}*/}
                <RequestButton requestedItem={newRequest} user={this.props.user}/>
            </Input>) : "";


        const maxPerRequest = `Request up to ${this.props.item.maxRequestQty} at a time`;

        const editBtn = this.props.user && this.props.user.admin ? (
            <Popup content="Edit this item" inverted
                   trigger={<Button size="mini"
                                    basic primary
                                    disabled={this.props.preview}
                                    icon as={Link}
                                    to={`admin/items/${this.props.item.id}`}>
                       <Icon name="pencil"/>
                   </Button>}>
            </Popup>
        ) : "";

        const hidden = this.props.user && this.props.item.hidden ? (
            <Popup content="Item is not visible to non-admins" inverted
                   trigger={<Icon style={{color: "gray"}}
                                  name="eye slash outline"/>}>
            </Popup>
        ) : "";

        return (
            <Item>
                {itemImage(this.props.item.imageUrl, this.props.item.qtyUnreserved <= 0)}
                <Item.Content>
                    <Item.Header>{editBtn} {hidden} {this.props.item.item_name || (this.props.preview && "Item Name")}</Item.Header>
                    <Item.Meta>{maxPerRequest}</Item.Meta>
                    <Item.Description>{this.props.item.description || (this.props.preview && "Description")}</Item.Description>
                    <Item.Extra>{qtyRequest}</Item.Extra>
                </Item.Content>
            </Item>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default withToastManager(connect(mapStateToProps)(HardwareItem));



