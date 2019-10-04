import React, {useState} from "react";
import {Button, Card, Header, Icon, Label, Popup} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request, UserAndRequests} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import {DAMAGED, FULFILLED, LOST, READY_FOR_PICKUP} from "../../../types/Hardware";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_REQUEST} from "../../util/graphql/Mutations";
import {updateRequestStatus} from "../DeskUtil";
import PhotoIdReturn from "./PhotoIdReturn";


interface ReadyForReturnCardProps {
    card: UserAndRequests
}

function returnRequired(requests: Request[]): boolean {
    return requests.some(request => request.item.returnRequired);
}

function WarningLabel({text}: { text: string }) {
    return <Label><span className={"hw-negative"}><Icon name={"exclamation triangle"}/>{text}</span></Label>;
}

function ControlledPopup(props: any) {
    let [isOpen, setOpen] = useState(false);

    return <Popup position={"bottom right"} on="click" open={isOpen}
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  trigger={props.children}
                  content={<PhotoIdReturn userName={props.user.name} loading={props.loading} error={props.error}
                                          updateRequest={props.updateRequest}
                                          returnRequired={props.returnRequired}
                                          haveID={props.user.haveID}
                                          requests={props.requests}
                                          optional={props.optional}
                                          setOpen={setOpen}
                  />}
    />;
}

function ReadyForPickupCard({card}: ReadyForReturnCardProps) {
    const [updateRequest, {data, loading, error}] = useMutation(UPDATE_REQUEST);

    // @ts-ignore
    card.requests.sort((a: Request, b: Request) => a.item.returnRequired - b.item.returnRequired || a.request_id - b.request_id);

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
                        <ItemAndQuantity quantity={request.quantity} itemName={request.item.item_name}/>
                    </strong>&nbsp;
                    <span style={{color: "gray"}}>#{request.request_id}</span>

                    <div style={{display: "inline", float: "right"}}>
                        {request.status === LOST && <WarningLabel text="LOST"/>}
                        {request.status === DAMAGED && <WarningLabel text="DAMAGED"/>}
                        {request.status === FULFILLED && !request.item.returnRequired &&
                        <Popup inverted position={"top center"}
                               trigger={<Label><span className={"hw-positive"}>Optional</span></Label>}
                               content={`${card.user.name} is not required to return this item`}
                        />}

                        &nbsp;
                        <ControlledPopup loading={loading} user={card.user} error={error} updateRequest={updateRequest}
                                         returnRequired={card.requests.length > 1 && returnRequired(card.requests)}
                                         optional={request.status === FULFILLED && !request.item.returnRequired}
                                         requests={[request]}>
                            <Button icon basic loading={loading} size={"tiny"}>
                                <Icon name="gavel"/>
                            </Button>
                        </ControlledPopup>
                    </div>
                </Card.Content>)
            }

            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={card.requests[0].updatedAt}/>
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
                                    updateRequestStatus(updateRequest, request.request_id, READY_FOR_PICKUP)
                                )
                            }>
                                <Icon className="hw-negative" name="arrow left"/>
                            </Button>}
                               content="Return all to Ready for Pickup"
                        />
                        <ControlledPopup loading={loading} user={card.user} error={error} updateRequest={updateRequest}
                                         requests={card.requests}
                                         returnRequired={false}
                        >
                            <Button icon loading={loading} labelPosition="right" color="green">
                                <Icon name="checkmark"/>
                                All Returned
                            </Button>
                        </ControlledPopup>

                    </Button.Group>
                </div>
            </Card.Content>
        </Card>
    );
}

export default ReadyForPickupCard;
