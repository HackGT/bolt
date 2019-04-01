import React, {Component} from 'react';
import {Grid, Card, Container} from "semantic-ui-react";
import RequestedHardwareItem from "./RequestedHardwareItem";
import {RequestedItem} from "../inventory/HardwareItem";
import {RequestedItemsByUser} from "./RequestedItemsByUser";
import {UserItemList} from "../RequestManagementContainer";


interface RequestManagementBoardProps {
    title: string,
    boardStyle: any,
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
        const returnValue = this.props.sortByUsers ? (
            <Grid.Column>
                <h2>{this.props.title}</h2>
                <Container placeholder style={this.props.boardStyle}>
                    <Card.Group>
                        {this.props.sortedItems.map((item, index) => {
                            return (
                                <RequestedItemsByUser
                                    key={index}
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
                <Container placeholder style={this.props.boardStyle}>
                    <Card.Group>
                        {this.props.items.map((item, index) => {
                            return (
                                <RequestedHardwareItem
                                    key={index}
                                    item={item}
                                    handleApprove={this.props.handleApprove}
                                    handleDecline={this.props.handleDecline}
                                />
                            )
                        })}
                    </Card.Group>
                </Container>
            </Grid.Column>
        )
        return returnValue;
    }
}

export default RequestManagementBoard;
