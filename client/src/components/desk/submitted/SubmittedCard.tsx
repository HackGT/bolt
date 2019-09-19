import React from "react";
import {Button, Card, Header, Icon, Label, Popup, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";

interface SubmittedCardProps {
    request: Request;
}

function noStockWarning(remaining: number) {
    return <Card.Content className="hw-negative">
        <Icon name="wrench"/>{`Insufficient stock (${remaining} available for approval)`}
    </Card.Content>;
}

function SubmittedCard({request}: SubmittedCardProps) {

    const noIssues = <Card.Content className="hw-positive">
        <Icon name="check circle"/> No issues found
    </Card.Content>;

    return (

        <Card className="hw-card">

            {console.log("sc rendered")}
            <Card.Content>
                <Label attached="top left">
                    #{request.request_id}
                </Label>
                <Label attached="top right">
                    <Icon name={"user"}/>{request.user.name}
                </Label>
                <Header style={{display: "inline-block"}} size="medium">
                    <ItemAndQuantity itemName={request.item.item_name} quantity={request.quantity}/>
                </Header>
            </Card.Content>
            {request.item.qtyAvailableForApproval >= request.quantity ? noIssues : noStockWarning(request.item.qtyAvailableForApproval)}
            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={request.createdAt}/>
            </Card.Content>
            <Card.Content extra>
                <div className="ui two buttons right aligned">
                    <Button.Group floated={"right"}>
                        <Popup inverted trigger={
                            <Button icon>
                                <Icon className="hw-negative" name="times circle"/>
                            </Button>}
                               content="Deny request"
                        />
                        <Popup inverted trigger={
                            <Button icon labelPosition="right" color="green">
                                <Icon name="checkmark"/>
                                Approve
                            </Button>}
                               content="Approve request"
                        />

                    </Button.Group>
                </div>
            </Card.Content>
            <Progress attached="top" percent={5} active={true} color={"green"}/>
        </Card>
    );
}

export default SubmittedCard;
