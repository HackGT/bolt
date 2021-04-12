import React from "react";
import {Button, Card, Header, Icon, Popup} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request, UserAndRequests} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import {READY_FOR_PICKUP, SUBMITTED} from "../../../types/Hardware";
import {useMutation} from "@apollo/client";
import {UPDATE_REQUEST} from "../../util/graphql/Mutations";
import {updateRequestStatus} from "../DeskUtil";


interface ReadyToFulfillCardProps {
    card: UserAndRequests
}

function ReadyToPrepareCard({card}: ReadyToFulfillCardProps) {
    const [updateRequest, {loading, error}] = useMutation(UPDATE_REQUEST);

    // @ts-ignore
    card.requests.sort((a: Request, b: Request) => new Date(a.updatedAt) - new Date(b.updatedAt));

    return (
        <Card className="hw-card">
            <Card.Content>
                <Header size="medium">
                    {card.user.name}
                </Header>
            </Card.Content>
            {
                card.requests.map(request => <Card.Content key={request.request_id}>
                    <strong>
                        <ItemAndQuantity quantity={request.quantity} itemName={request.item.item_name}/></strong>&nbsp;
                    <span style={{color: "gray"}}>#{request.request_id}</span>

                    <div style={{display: "inline", float: "right"}}>
                        <Popup inverted position={"top center"}
                               trigger={<Button icon basic loading={loading} size={"tiny"}
                                                onClick={event => updateRequestStatus(updateRequest, request.request_id, SUBMITTED)}>
                                   <Icon className="hw-negative" name="arrow left"/>
                               </Button>}
                               content="Return to Submitted"
                        />
                        <Popup inverted position={"top right"} trigger={
                            <Button icon basic loading={loading} size={"tiny"}
                                    onClick={event => updateRequestStatus(updateRequest, request.request_id, READY_FOR_PICKUP)}>
                                <Icon className="hw-positive" name="arrow right"/>
                            </Button>}
                               content="Mark Ready for Pickup"
                        />
                    </div>
                </Card.Content>)
            }

            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={card.requests[0].updatedAt}/>
            </Card.Content>
            <Card.Content>
                <Icon name={"slack hash"}/>{card.user.slackUsername}
            </Card.Content>
            {error ? <Card.Content className="hw-negative">
                <Icon name="warning sign"/>Unable to change request status: {error.message}
            </Card.Content> : ""}
            <Card.Content extra>
                <div className="ui two buttons right aligned">
                    <Button.Group floated={"right"}>
                        <Popup inverted trigger={
                            <Button icon loading={loading} onClick={event =>
                                card.requests.forEach(request =>
                                    updateRequestStatus(updateRequest, request.request_id, SUBMITTED)
                                )
                            }>
                                <Icon className="hw-negative" name="arrow left"/>
                            </Button>}
                               content="Return all to Submitted"
                        />
                        <Popup inverted trigger={
                            <Button icon loading={loading} labelPosition="right" color="green" onClick={event =>
                                card.requests.forEach(request =>
                                    updateRequestStatus(updateRequest, request.request_id, READY_FOR_PICKUP)
                                )
                            }>
                                <Icon name="arrow right"/>
                                RFP
                            </Button>}
                               content="Mark all Ready for Pickup"
                        />
                    </Button.Group>
                </div>
            </Card.Content>
        </Card>
    );
}

export default ReadyToPrepareCard;
