import React, {Component} from "react";
import {Button, Card, Container, Header, Label, Segment} from "semantic-ui-react";
import {StatusToColor, StatusToString} from "../../enums";
import {RequestedItem} from "../../types/Hardware";

class RequestsList extends Component<{ requestedItemsList: RequestedItem[], removeItem: (index: number) => void }> {

    public render() {
        const noRequest = (
            <Segment placeholder>
                <Container textAlign="center">
                        <Header>
                            You haven't requested any hardware yet.
                        </Header>
                </Container>
            </Segment>
        );
        const requestIsThere = <h1>YAS</h1>;
        return this.props.requestedItemsList.length == 0 ? noRequest : (
            <Segment placeholder>
                <Card.Group>
                    {this.props.requestedItemsList.map((item, index ) => {
                        return (
                            <Card key={index} fluid>
                                <Card.Content>
                                    <Card.Header>{item.name}</Card.Header>
                                    <Card.Description>


                                        <Label medium circular color="blue">{item.qtyRequested}</Label>

                                        <Label large color={StatusToColor(item.status)}>{StatusToString(item.status)}</Label>

                                        <Button floated="right" basic color="red" onClick={() => {
                                            this.props.removeItem(index);
                                        }}>
                                            Cancel Request
                                        </Button>

                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </Card.Group>
            </Segment>
        );
    }
}

export default RequestsList;
