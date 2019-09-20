import React, {useState} from "react";
import {Button, Card, Header, Icon, Image, Label, List, Popup, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request, UserAndRequests} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import {APPROVED, DENIED, FULFILLED, READY_FOR_PICKUP, SUBMITTED} from "../../../types/Hardware";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_REQUEST} from "../../util/graphql/Mutations";
import {updateRequestStatus} from "../fulfillment/ReadyToPrepareCard";


interface ReadyForPickupCardProps {
    card: UserAndRequests
}

function ReadyForPickupCard({card}: ReadyForPickupCardProps) {
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
                                                onClick={event => updateRequestStatus(updateRequest, request, APPROVED)}>
                                   <Icon className="hw-negative" name="arrow left"/>
                               </Button>}
                               content="Return to Preparing"
                        />
                        <Popup inverted position={"top right"} trigger={
                            <Button icon basic size={"tiny"}
                                    onClick={event => updateRequestStatus(updateRequest, request, FULFILLED)}>
                                <Icon className="hw-positive" name="checkmark"/>
                            </Button>}
                               content="Mark Fulfilled"
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
                                    updateRequestStatus(updateRequest, request, APPROVED)
                                )
                            }>
                                <Icon className="hw-negative" name="arrow left"/>
                            </Button>}
                               content="Return all to Ready to Prepare"
                        />
                        <Popup inverted trigger={
                            <Button icon labelPosition="right" color="green" onClick={event =>
                                card.requests.forEach(request =>
                                    updateRequestStatus(updateRequest, request, FULFILLED)
                                )
                            }>
                                <Icon name="checkmark"/>
                                Fulfilled
                            </Button>}
                               content="Mark all Fulfilled"
                        />

                    </Button.Group>
                </div>
            </Card.Content>
            <Progress attached="top" percent={5} active={true} color={"green"}/>
        </Card>
    );
}

export default ReadyForPickupCard;
