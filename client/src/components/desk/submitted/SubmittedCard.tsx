import React, {Component} from "react";
import {Button, Card, Header, Icon, Label, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";

class SubmittedCard extends Component {
    public render() {
        return (
            <Card className="hw-card">
                <Card.Content>
                    <Header size="medium">
                        <Label pointing="right" color="blue" className="hw-qty">
                            3x
                        </Label> Item Name
                    </Header>
                </Card.Content>
                <Card.Content className="hw-positive">
                    <Icon name="check circle"/> No issues found
                </Card.Content>
                <Card.Content className="hw-negative">
                    <Icon name="wrench"/>Insufficient stock (2 left)
                </Card.Content>
                <Card.Content className="hw-negative">
                    <Icon name="flag"/>Lots of requests
                </Card.Content>
                <Card.Content>
                    <Icon name="user"/> User
                </Card.Content>
                <Card.Content>
                    <Icon name="clock outline"/> <TimeAgo date={"2019-08-11T23:38-04:00"}/>
                </Card.Content>
                <Card.Content extra>
                    <div className="ui two buttons">
                        <Button color="red">
                            Decline
                        </Button>
                        <Button color="green">
                            Approve
                        </Button>
                    </div>
                </Card.Content>
                <Progress attached="top" percent={5} active={true} color={"green"}/>
            </Card>
        );
    }
}

export default SubmittedCard;
