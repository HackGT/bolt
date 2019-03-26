import React, {Component} from 'react';
import {Grid} from "semantic-ui-react";
import HardwareList from "./inventory/HardwareList";
import RequestsList from "./requests/RequestsList";

class HomeContainer extends Component {
    render() {
        return (
            <Grid stackable columns={2}>
                <Grid.Row>
                    <Grid.Column>
                        <HardwareList requestsEnabled={true}>
                        </HardwareList>
                    </Grid.Column>
                    <Grid.Column>
                        <h1>My Requests</h1>
                        <RequestsList/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default HomeContainer;
