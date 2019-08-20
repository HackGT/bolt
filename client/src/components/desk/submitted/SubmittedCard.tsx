import React from "react";
import {Button, Card, Header, Icon, Label, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request} from "../../../types/Request";

interface SubmittedCardProps {
    request: Request;
}

function SubmittedCard({request}: SubmittedCardProps) {
    const noStockWarning = <Card.Content className="hw-negative">
        <Icon name="wrench"/>Insufficient stock (0 left)
    </Card.Content>;

    const noIssues = <Card.Content className="hw-positive">
        <Icon name="check circle"/> No issues found
    </Card.Content>;

    return (
        <Card className="hw-card">
            <Card.Content>
                <Header size="medium">
                    <Label pointing="right" color="blue" className="hw-qty">
                        {request.quantity}x
                    </Label> {request.item.item_name}
                </Header>
            </Card.Content>
            {Math.random() > .5 ? noIssues : noStockWarning}
            <Card.Content>
                <Icon name="user"/> {request.user.name}
            </Card.Content>
            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={request.createdAt}/>
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

export default SubmittedCard;
