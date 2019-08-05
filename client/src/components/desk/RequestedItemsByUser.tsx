import React, {Component} from "react";
import {UserItemList} from "./DeskContainer";
import {Button, Card, Icon, Label, Popup} from "semantic-ui-react";

interface RequestedItemsByUserProps {
    item: UserItemList;
    backToPrep: boolean;
    handleCross: (user: string) => void;
    handleReady: (user: string) => void;
    handlePrep: (user: string) => void;
    handleDone: (user: string) => void;
}

export class RequestedItemsByUser extends Component<RequestedItemsByUserProps> {
    constructor(props: RequestedItemsByUserProps) {
        super(props);
    }

    public onClickReady = () => {
        this.props.handleReady(this.props.item.user);
    }

    public onClickCross = () => {
        this.props.handleCross(this.props.item.user);
    }

    public onClickPrep = () => {
        this.props.handlePrep(this.props.item.user);
    }

    public onClickDone = () => {
        this.props.handleDone(this.props.item.user);
    }

    public render() {
        const leftButton = this.props.backToPrep ? (
                <Button onClick={this.onClickPrep} color="orange" size="mini" icon labelPosition="left">Prep<Icon
                    name="arrow alternate circle left outline"/></Button>
        ) :
        (
            <div></div>
        );
        const rightButton = this.props.backToPrep ? (
                <Button onClick={this.onClickDone} color="green" size="mini">Done</Button>
        ) :
        (
            <Button onClick={this.onClickReady} color="green" size="mini" icon labelPosition="right">Ready<Icon
                name="arrow alternate circle right outline"/></Button>
        );
        return (
            <Card>
                <Card.Header style={{padding: "1rem"}}>
                        <h3>{this.props.item.user}</h3>
                    <Button.Group fluid>
                        {leftButton}
                        <Popup trigger={<Button onClick={this.onClickCross} color="red" size="mini"><Icon name="close"/></Button>}
                               content="Remove User block"/>
                        {rightButton}
                    </Button.Group>
                </Card.Header>
                {this.props.item.items.map((item, index) => {
                    return (
                        <Card.Content>
                            <Card.Content>
                              <Card.Description>
                              <Label circular color="blue">
                                  {item.qtyRequested}x
                              </Label>
                                  <span style={{paddingLeft: "1rem", paddingTop: "0.5rem"}}>{item.name}</span>
                              </Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <div className="ui two buttons" style={{paddingTop: "1rem"}}>
                                    <Popup trigger={<Button basic color="grey"><Icon name="edit"/></Button>}
                                           content="Edit Quantity Requested"/>
                                    <Popup trigger={<Button basic color="red"><Icon name="close"/></Button>}
                                           content="Remove item"/>
                              </div>
                            </Card.Content>
                        </Card.Content>
                    );
                })}
            </Card>
        );
    }
}
