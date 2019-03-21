import React, {Component} from 'react';
import {Header, Icon, Segment, Card, Image, Button, Label, Divider} from "semantic-ui-react";
import {RequestItem} from "../inventory/HardwareList";
import {RequestedItem} from "./RequestedItem";

class RequestsList extends Component<{requestedItems: RequestItem[], removeRequestedItem: (event: any) => any}> {
    render() {
        return (
            <Segment placeholder>
                <Card.Group>
                {(this.props.requestedItems.length > 0) ?
                    this.props.requestedItems.map(requestedItem => {
                        return (
                            <RequestedItem requestedItem={requestedItem} removeRequestedItem={this.props.removeRequestedItem}/>
                            // <Card>
                            //  <Card.Content>
                            //         <Image floated='right' size = 'mini' src = '/images/avatar/large/steve.jpg'/>
                            //         <Card.Header>Steve Sanders </Card.Header>
                            //         <Card.Meta> Friends of Elliot </Card.Meta>
                            //         <Card.Description>
                            //             Steve wants to add you to the group <strong> best friends </strong>
                            //         </Card.Description>
                            // </Card.Content>
                            // <Card.Content extra>
                            //     <div className='ui two buttons'>
                            //         <Button basic color = 'green'>
                            //             Approve
                            //         </Button>
                            //         < Button basic color = 'red'>
                            //             Decline
                            //         </Button>
                            //     < /div>
                            // </Card.Content>
                            // </Card>
                    )
                    }) : (
                        <Header>
                            You haven't requested any hardware yet.
                        </Header>
                    )
                }
                </Card.Group>
            </Segment>
        );
    }
}

export default RequestsList;
