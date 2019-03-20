import React, {Component} from 'react';
import {Header, Icon, Segment} from "semantic-ui-react";

class RequestsList extends Component {
    render() {
        return (
            <Segment placeholder>
                <Header icon>
                    <Icon name='search'/>
                    You haven't requested any hardware yet.
                </Header>
            </Segment>
        );
    }
}

export default RequestsList;