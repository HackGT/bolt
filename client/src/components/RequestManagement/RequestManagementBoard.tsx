import React, {Component} from 'react';
import {Card, Container, Grid} from "semantic-ui-react";
import RequestedHardwareItem from "./RequestedHardwareItem";
import {RequestedItem} from "../inventory/HardwareItem";
import {RequestedItemsByUser} from "./RequestedItemsByUser";
import {UserItemList} from "../RequestManagementContainer";


interface RequestManagementBoardProps {
    title: string,
    items: RequestedItem[],
    sortedItems: UserItemList[],
    sortByUsers: boolean,
    backToPrep: boolean,
    handleApprove: (id: number) => void,
    handleDecline: (id: number) => void,
    handleReady: (user: string) => void,
    handleCross: (user: string) => void,
    handlePrep: (user: string) => void,
    handleDone: (user: string) => void,
}

class RequestManagementBoard extends Component<RequestManagementBoardProps, {}> {
    render() {
        return this.props.sortByUsers ? (
            <Grid.Column>
                <h2>{this.props.title}</h2>
                <Container placeholder className="hardware-board-style">
                    <Card.Group>
                        {this.props.sortedItems.map((item, index) => {
                            return (
                                <RequestedItemsByUser
                                    key={item.user}
                                    item={item}
                                    backToPrep={this.props.backToPrep}
                                    handleReady={this.props.handleReady}
                                    handleCross={this.props.handleCross}
                                    handlePrep={this.props.handlePrep}
                                    handleDone={this.props.handleDone}
                                />
                            )
                        })}
                    </Card.Group>
                </Container>
            </Grid.Column>
        ) : (
            <Grid.Column>
                <h2>{this.props.title}</h2>
                <Container placeholder className="hardware-board-style">
                    <Card.Group>
                        {this.props.items.map((item, index) => {
                            return (
                                <RequestedHardwareItem
                                    key={item.id}
                                    item={item}
                                    handleApprove={this.props.handleApprove}
                                    handleDecline={this.props.handleDecline}
                                />
                            )
                        })}
                    </Card.Group>
                </Container>
            </Grid.Column>
        );
    }
}

export default RequestManagementBoard;
