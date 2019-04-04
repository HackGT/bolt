import React, {Component} from 'react';
import {Grid} from "semantic-ui-react";
import HardwareList from "./inventory/HardwareList";
import RequestsList from "./requests/RequestsList";
import {RequestedItem} from "./inventory/HardwareItem";
import {AppState} from "../reducers/reducers";
import {connect} from "react-redux";
import {User} from "../actions/actions";
import {compose} from "redux";
import {withRouter} from "react-router";
import {withToastManager} from "react-toast-notifications";

export interface OwnProps {}

interface StateProps {
    a: number
    user: User|null
}

type Props = StateProps & OwnProps | any;

interface State {requestedItemsList: RequestedItem[], item: RequestedItem | null}

class HomeContainer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            requestedItemsList: [] as RequestedItem[],
            item: {} as RequestedItem | null
        };
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleRemoveItem = this.handleRemoveItem.bind(this);
    }

    handleAddItem(item: RequestedItem) {
        let listOfItems: RequestedItem[] = this.state.requestedItemsList;
        listOfItems.push(item);
        this.setState({
            requestedItemsList: listOfItems
        })
    }

    handleRemoveItem(index: number) {
        let listOfItems: RequestedItem[] = this.state.requestedItemsList;
        let itemToAddBack: RequestedItem = listOfItems[index];
        listOfItems.splice(index, 1);
        this.setState({
            requestedItemsList: listOfItems,
            item: itemToAddBack
        })
    }

    render() {
        const myRequests = this.props.user ? (<Grid.Column>
            <h1>My Requests</h1>
            <RequestsList requestedItemsList={this.state.requestedItemsList} removeItem={this.handleRemoveItem}/>
        </Grid.Column>): '';

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
        a: state.a,
        user: state.user
    }
}


export default connect(mapStateToProps) (HomeContainer);
