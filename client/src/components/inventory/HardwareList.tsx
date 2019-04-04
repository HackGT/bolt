import React from 'react';
import HardwareItem from "./HardwareItem";
import {Icon, Item, Message, Grid, Header} from "semantic-ui-react";
import PlaceholderItem from "./PlaceholderItem";
import {RequestedItem} from "../inventory/HardwareItem"
import {AppState} from "../../reducers/reducers";
import {connect} from "react-redux";
import {User} from "../../actions/actions";

const sampleData = [
    {
        name: "Arduino Uno",
        description: "Potato potato let's call the whole thing off",
        qtyRemaining: 20,
        totalQty: 30,
        maxReqQty: 1,
        returnRequired: true,
        owner: "The Hive",
        category: "Microcontrollers",
        id: "541"
    },
    {
        name: "Mango",
        description: "The one and only Hardware Queen(TM)",
        qtyRemaining: 0,
        totalQty: 1,
        maxReqQty: 1,
        returnRequired: true,
        owner: "Mango",
        category: "People?",
        id: "3432"
    },
    {
        name: "Raspberry Pi 3",
        description: "We heard you like fruit so we put a fruit in ya computer",
        qtyRemaining: 20,
        totalQty: 30,
        maxReqQty: 1,
        returnRequired: true,
        owner: "HackGT",
        category: "Microcontrollers",
        id: "4642"
    },
    {
        name: "10 Ohm Resistors",
        description: "Not 9, not 11, 10 Ohms.  The perfect amount",
        qtyRemaining: 1000,
        totalQty: 1000,
        maxReqQty: 10,
        returnRequired: false,
        owner: "",
        category: "Resistors",
        id: "46234"
    },
];

export interface OwnProps {
    requestsEnabled: boolean,
    handleAddItem: (item: RequestedItem) => void,
    qtyUpdate: RequestedItem | null
}

interface StateProps {
    a: number
    user: User|null
}

type Props = StateProps & OwnProps;

export class HardwareList extends React.Component<Props, { loading: boolean }> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true
        };
        this.dataCallback = this.dataCallback.bind(this);
    }

    dataCallback() {
        this.setState({
            loading: false
        });
    }

    componentDidMount(): void {
        setTimeout(this.dataCallback, 3000);
    }

    render() 
        console.log(this.props.requestsEnabled && !this.props.user , this.props.requestsEnabled, this.props.user);

        let noRequestsMessageText = "";

        if (!this.props.requestsEnabled) {
            noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
        } else if (this.props.requestsEnabled && !this.props.user) {
            noRequestsMessageText = "Sign in to request hardware.";
        }

        const noRequestsMessage = this.props.requestsEnabled && !this.props.user ? (<Message
            title="View-only inventory"
            warning icon>
            <Icon name='warning sign'/>
            {noRequestsMessageText}
        </Message>) : '';

        sampleData.sort((a, b) => {
            return a.category.toLocaleLowerCase().localeCompare(b.category.toLocaleLowerCase()) || a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        });
        const normalContent = (<Item.Group>
            {sampleData.map((item) => (
                <HardwareItem name={item.name}
                              description={item.description}
                              requestsEnabled={this.props.requestsEnabled && this.props.user}
                              qtyRemaining={item.qtyRemaining}
                              totalQty={item.totalQty}
                              maxReqQty={item.maxReqQty}
                              category={item.category}
                              key={item.id}
                              id={item.id}
                              addItem={this.props.handleAddItem} // prop that invokes the handleAddItem method of parent container to update its state
                              qtyUpdate={this.props.qtyUpdate} // this prop is the object whose request has been cancelled
                              user={this.props.user}
                />))}
        </Item.Group>);
        const loading = (<Item.Group>
            <PlaceholderItem/>
            <PlaceholderItem/>
            <PlaceholderItem/>
        </Item.Group>);

        return (
                <div>
                        <Header>Inventory</Header>
                        {noRequestsMessage}
                        {this.state.loading ? loading : normalContent}
                </div>
        )
    }
}

function mapStateToProps(state: AppState) {
    return {
        a: state.a,
        user: state.user
    }
}


export default connect(mapStateToProps) (HardwareList);
