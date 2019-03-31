import React, {Component} from 'react';
import {Grid, Card, Container} from "semantic-ui-react";
import RequestedHardwareItem from "./RequestedHardwareItem";
import {RequestedItem} from "../inventory/HardwareItem"


interface RequestManagementBoardProps {
    title: string,
    boardStyle: any,
    items: RequestedItem[]
}

class RequestManagementBoard extends Component<RequestManagementBoardProps, {}> {
    render() {
        return (
            <Grid.Column>
                <h2>{this.props.title}</h2>
                <Container placeholder style={this.props.boardStyle}>
                    <Card.Group>
                        {this.props.items.map((item, index) => {
                            return (
                                <RequestedHardwareItem key={index} item={item}/>
                            )
                        })}
                    </Card.Group>
                </Container>
            </Grid.Column>
        )
    }
}

export default RequestManagementBoard;
