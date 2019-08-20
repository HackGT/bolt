import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import HardwareList from "./inventory/HardwareList";
import RequestsList from "./requests/RequestsList";
import {RequestedItem} from "./inventory/HardwareItem";
import {connect} from "react-redux";
import {User} from "../types/User";
import {AppState} from "../state/Store";

export interface OwnProps {}

interface StateProps {
    user: User | null;
}

type Props = StateProps & OwnProps | any;

interface State {
    requestedItemsList: RequestedItem[];
    item: RequestedItem | null;
}

class HomeContainer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            requestedItemsList: [] as RequestedItem[],
            item: {} as RequestedItem | null
        };
    }

    public handleAddItem = (item: RequestedItem) => {
        const listOfItems: RequestedItem[] = this.state.requestedItemsList;
        listOfItems.push(item);
        this.setState({
            requestedItemsList: listOfItems
        });
    };

    public handleRemoveItem = (index: number) => {
        const listOfItems: RequestedItem[] = this.state.requestedItemsList;
        const itemToAddBack: RequestedItem = listOfItems[index];
        listOfItems.splice(index, 1);
        this.setState({
            requestedItemsList: listOfItems,
            item: itemToAddBack
        });
    };

    public render() {
        const myRequests = this.props.user ? (<Grid.Column>
            <h1>My Requests</h1>
            <RequestsList requestedItemsList={this.state.requestedItemsList} removeItem={this.handleRemoveItem}/>
        </Grid.Column>) : "";

        return (
            <Grid stackable columns={2}>
                <Grid.Row>
                    <Grid.Column>
                        <HardwareList requestsEnabled={true} handleAddItem={this.handleAddItem} qtyUpdate={this.state.item}>
                        </HardwareList>
                    </Grid.Column>
                    {myRequests}
                </Grid.Row>
            </Grid>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}


export default connect(mapStateToProps) (HomeContainer);
