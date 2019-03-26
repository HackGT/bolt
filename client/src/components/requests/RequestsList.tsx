import React, {Component} from 'react';
import {Header, Icon, Segment, Card, Image, Button, Label, Divider} from "semantic-ui-react";
import {RequestItem} from "../inventory/HardwareList";
import {RequestedItem} from "./RequestedItem";

class RequestsList extends Component {
    render() {
        return (
            <Segment placeholder>
                <Card.Group>
                        <Header>
                            You haven't requested any hardware yet.
                        </Header>
                </Card.Group>
            </Segment>
        );
    }
}

export default RequestsList;
