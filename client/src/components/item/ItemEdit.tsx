import React, {Component} from 'react';
import {match} from "react-router";
import {Item} from "../inventory/HardwareItem";
import {Form, Label, Popup} from "semantic-ui-react";

interface ItemDetails {
    requireApproval: boolean,
    returnRequired: boolean,
    price: number,
    hidden: boolean,
    owner: string
}

interface ItemEditProps {
    match: match & ItemEditParams
}

interface ItemEditParams {
    params: { itemId: string }
}

interface ItemEditState {
    loading: boolean
    item: Item & ItemDetails | null
}

class ItemEdit extends Component<ItemEditProps, ItemEditState> {
    constructor(props: ItemEditProps) {
        super(props);
        this.state = {
            loading: true,
            item: null
        };
        this.loadItemData = this.loadItemData.bind(this);
        this.finishedLoadingItemData = this.finishedLoadingItemData.bind(this);
    }

    componentDidMount(): void {
        this.loadItemData(this.props.match.params.itemId);

    }

    finishedLoadingItemData() {
        this.setState({
            item: {
                category: "Microcontrollers",
                name: "Raspberry Pi 3",
                totalQty: 50,
                maxReqQty: 1,
                qtyRemaining: 45,
                description: "",
                imageUrl: "",
                hidden: false,
                owner: "HackGT",
                requireApproval: true,
                returnRequired: true,
                price: 35
            },
            loading: false
        })
    }

    loadItemData(id: string) {
        setTimeout(this.finishedLoadingItemData, 1000);
    }

    render() {
        return (
            <Form loading={this.state.loading}>
                <h2>About this item</h2>
                <Form.Group>
                    <Form.Input width={6} label="Item name" type="text" required/>
                    <Form.Input width={6} label='Image' type="file"/>
                </Form.Group>
                <Form.TextArea width={12} label="Description" type="textarea" rows={2}/>
                <Form.Group>
                    <Form.Input width={4} label="Category" type="text" required/>
                    <Form.Input width={4} label="Item value ($)" type="number" labelPosition="left">
                        <Label>$</Label>
                        <input min={0}/>
                    </Form.Input>
                    <Form.Input width={4} label="Owner" type="text" required/>
                </Form.Group>

                <h2>Stock</h2>
                <Form.Group>
                    <Form.Input width={6} label="Quantity in stock" type="number" required>
                        <input type="number" min={0}/>
                    </Form.Input>
                    <Form.Input width={6} label="Quantity allowed per request" type="number" required>
                        <input type="number" min={0}/>
                    </Form.Input>
                </Form.Group>

                <h2>Checkout Controls</h2>
                <Popup inverted={true} trigger={<Form.Checkbox label='Return required' defaultChecked/>}
                       content="Whether the user who checks out this item must return it"/>
                <Popup inverted={true} trigger={<Form.Checkbox label='Approval required' defaultChecked/>}
                       content="Whether hardware checkout staff must approve requests for this item"/>
                <Popup inverted={true} trigger={<Form.Checkbox label='Hidden'/>}
                       content="Whether to hide this item on the public list of hardware"/>
                <Form.TextArea width={6} label="Serial numbers (one per line)" rows={6}/>
            </Form>

        );

    }
}

export default ItemEdit;