import React, {useState} from "react";
import {Button, Card, Header, Icon, Image, Label, List, Popup, Progress} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import {Request} from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";

interface ReadyToFulfillCardProps {
    requests?: [Request];
}

function ReadyToPrepareCard({requests}: ReadyToFulfillCardProps) {
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


    return (
        <Card className="hw-card">
            <Card.Content>
                <Header size="medium">
                    George Burdell <Label>APPROVED</Label>
                </Header>
            </Card.Content>
            <Card.Content>
                <strong>
                    <ItemAndQuantity quantity={1} itemName={"Dell XPS 13"}/>
                </strong>
                <div style={{display: "inline", float: "right"}}>
                    <Popup inverted position={"top center"}
                           trigger={<Button icon basic size={"tiny"}>
                               <Icon className="hw-negative" name="arrow left"/>
                           </Button>}
                           content="Return to Submitted"
                    />
                    <Popup inverted position={"top right"} trigger={
                        <Button icon basic size={"tiny"}>
                            <Icon className="hw-positive" name="arrow right"/>
                        </Button>}
                           content="Mark Ready for Pickup"
                    />
                </div>
            </Card.Content>
            <Card.Content>
                <strong>
                    <ItemAndQuantity quantity={3} itemName={"Super Arduino Mini Uno"}/>
                </strong>
                <div style={{display: "inline", float: "right"}}>
                    <Popup inverted position={"top center"}
                           trigger={<Button icon basic size={"tiny"}>
                               <Icon className="hw-negative" name="arrow left"/>
                           </Button>}
                           content="Return to Submitted"
                    />
                    <Popup inverted position={"top right"} trigger={
                        <Button icon basic size={"tiny"}>
                            <Icon className="hw-positive" name="arrow right"/>
                        </Button>}
                           content="Mark Ready for Pickup"
                    />
                </div>
            </Card.Content>
            <Card.Content>
                <strong>
                    <ItemAndQuantity quantity={1} itemName={"Raspberry Pi 3 B+"}/>
                </strong>
                <div style={{display: "inline", float: "right"}}>
                    <Popup inverted position={"top center"}
                           trigger={<Button icon basic size={"tiny"}>
                               <Icon className="hw-negative" name="arrow left"/>
                           </Button>}
                           content="Return to Submitted"
                    />
                    <Popup inverted position={"top right"} trigger={
                        <Button icon basic size={"tiny"}>
                            <Icon className="hw-positive" name="arrow right"/>
                        </Button>}
                           content="Mark Ready for Pickup"
                    />
                </div>
            </Card.Content>
            <Card.Content>
                <Icon name="clock outline"/> <TimeAgo date={new Date()}/>
            </Card.Content>
            <Card.Content extra>
                <div className="ui two buttons right aligned">
                    <Button.Group floated={"right"}>
                        <Popup inverted trigger={
                            <Button icon>
                                <Icon className="hw-negative" name="arrow left"/>
                            </Button>}
                               content="Return all to Submitted"
                        />
                        <Popup inverted trigger={
                            <Button icon labelPosition="right" color="green">
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
