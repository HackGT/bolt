import React from "react";
import {Button, Card, Header, Icon, Label, Popup} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_REQUEST} from "../../util/graphql/Mutations";
import {APPROVED, DENIED} from "../../../types/Hardware";

interface SubmittedCardProps {
    request: Request;
}

function noStockWarning(remaining: number) {
    return <Card.Content className="hw-negative">
        <Icon name="wrench"/>{`Insufficient stock (${remaining} available for approval)`}
    </Card.Content>;
}

function SubmittedCard({request}: SubmittedCardProps) {
    const [updateRequest, {data, loading, error}] = useMutation(UPDATE_REQUEST);


    const noIssues = <Card.Content className="hw-positive">
        <Icon name="check circle"/> No issues found
    </Card.Content>;

    return (

        <Card className="hw-card">
            <Card.Content>
                <Label attached="top left">
                    <Icon name={"user"}/>{request.user.name}
                </Label>
                <Label attached="top right">
                    <Icon name={"slack hash"}/>{request.user.slackUsername}
                </Label>

                <Header style={{display: "inline-block"}} size="medium">
                    <ItemAndQuantity itemName={request.item.item_name} quantity={request.quantity}/>
                    &nbsp;<span style={{color: "gray", fontSize: 14, fontWeight: "normal"}}>#{request.request_id}</span>
                </Header>
            </Card.Content>
            {request.item.qtyAvailableForApproval >= request.quantity ? noIssues : noStockWarning(request.item.qtyAvailableForApproval)}
            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={request.createdAt}/>
            </Card.Content>
            {error ? <Card.Content className="hw-negative">
                <Icon name="warning sign"/>Unable to change request status: {error.message}
            </Card.Content> : ""}
            <Card.Content extra>
                <div className="ui two buttons right aligned">
                    <Button.Group floated={"right"}>
                        <Popup inverted trigger={
                            <Button icon loading={loading} disabled={loading} onClick={event => updateRequest({
                                variables: {
                                    updatedRequest: {
                                        request_id: request.request_id,
                                        new_status: DENIED
                                    }
                                }
                            })}>
                                <Icon className="hw-negative" name="times circle"/>
                            </Button>}
                               content="Deny request"
                        />
                        <Popup inverted trigger={
                            <Button icon labelPosition="right" color="green" loading={loading} disabled={loading}
                                    onClick={event => updateRequest({
                                        variables: {
                                            updatedRequest: {
                                                request_id: request.request_id,
                                                new_status: APPROVED
                                            }
                                        }
                                    })}>
                                <Icon name="checkmark"/>
                                Approve
                            </Button>}
                               content="Approve request"
                        />
                    </Button.Group>
                </div>
            </Card.Content>
        </Card>
    );
}

export default SubmittedCard;
