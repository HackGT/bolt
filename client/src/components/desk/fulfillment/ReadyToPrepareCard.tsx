import React, {useState} from "react";
import {Button, Card, Header, Icon, Image, Label, List, Popup, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request, UserAndRequests} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import {APPROVED, DENIED, READY_FOR_PICKUP, SUBMITTED} from "../../../types/Hardware";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_REQUEST} from "../../util/graphql/Mutations";


interface ReadyToFulfillCardProps {
    card: UserAndRequests
}

export function updateRequestStatus(updateRequest: any, request: Request, newStatus: any) {
    return updateRequest({
        variables: {
            updatedRequest: {
                request_id: request.request_id,
                new_status: newStatus
            }
        }
    });
}

function ReadyToPrepareCard({card}: ReadyToFulfillCardProps) {
    const [updateRequest, {data, loading, error}] = useMutation(UPDATE_REQUEST);

    // const reqDate = new Date();
    // const dueDate = new Date().setMinutes(reqDate.getMinutes() + 15);
    //
    // const totalTime = dueDate.valueOf() - reqDate.valueOf();
    //
    // const [time, setTime] = useState(0)
    //
    // setInterval(() => {
    //     console.log(reqDate, dueDate);
    //     const newTime = new Date();
    //     const elapsed = dueDate.valueOf() - newTime.valueOf();
    //     const percent = elapsed / totalTime;
    //     console.log(elapsed, totalTime);
    //     console.log(elapsed);
    // }, 5000)

    console.log("card", card.requests[0].updatedAt);
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
                               trigger={<Button icon basic size={"tiny"}
                                                onClick={event => updateRequestStatus(updateRequest, request, SUBMITTED)}>
                                   <Icon className="hw-negative" name="arrow left"/>
                               </Button>}
                               content="Return to Submitted"
                        />
                        <Popup inverted position={"top right"} trigger={
                            <Button icon basic size={"tiny"}
                                    onClick={event => updateRequestStatus(updateRequest, request, READY_FOR_PICKUP)}>
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
            <Card.Content extra>
                <div className="ui two buttons right aligned">
                    <Button.Group floated={"right"}>
                        <Popup inverted trigger={
                            <Button icon onClick={event =>
                                card.requests.forEach(request =>
                                    updateRequestStatus(updateRequest, request, SUBMITTED)
                                )
                            }>
                                <Icon className="hw-negative" name="arrow left"/>
                            </Button>}
                               content="Return all to Submitted"
                        />
                        <Popup inverted trigger={
                            <Button icon labelPosition="right" color="green" onClick={event =>
                                card.requests.forEach(request =>
                                    updateRequestStatus(updateRequest, request, READY_FOR_PICKUP)
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
            <Progress attached="top" percent={5} active={true} color={"green"}/>
        </Card>
    );
}

export default ReadyToPrepareCard;
