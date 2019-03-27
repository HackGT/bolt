import React, {Component} from 'react';
import {Grid} from "semantic-ui-react";
import HardwareList from "./inventory/HardwareList";
import RequestsList from "./requests/RequestsList";
import {RequestedItem} from "./inventory/HardwareItem";


class HomeContainer extends Component<{}, {requestedItemsList: RequestedItem[], item: RequestedItem | null}> {
    constructor(props: any) {
        super(props)
        this.state = {
            requestedItemsList: [] as RequestedItem[],
            item: {} as RequestedItem | null
        }
        this.handleAddItem = this.handleAddItem.bind(this)
        this.handleRemoveItem = this.handleRemoveItem.bind(this)
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
        return (
            <Grid stackable columns={2}>
                <Grid.Row>
                    <Grid.Column>
                        <HardwareList requestsEnabled={true} handleAddItem={this.handleAddItem} qtyUpdate={this.state.item}>
                        </HardwareList>
                    </Grid.Column>
                    <Grid.Column>
                        <h1>My Requests</h1>
                        <RequestsList requestedItemsList={this.state.requestedItemsList} removeItem={this.handleRemoveItem}/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default HomeContainer;
