import React, {ChangeEvent, Component, FormEvent} from 'react';
import {match} from "react-router";
import {Item} from "../inventory/HardwareItem";
import {Button, CheckboxProps, DropdownProps, Form, Label, Popup} from "semantic-ui-react";
import AddOptionDropdown from "./AddOptionDropdown";

interface ItemDetails {
    requireApproval: boolean,
    returnRequired: boolean,
    price: number,
    hidden: boolean,
    owner: string,
}

interface ItemEditProps {
    match: match & ItemEditParams
}

interface ItemEditParams {
    params: { itemId: string }
}

export type ItemComplete = Item & ItemDetails

interface ItemEditState {
    loading: boolean,
    item: ItemComplete | null,

    [name: string]: any | any[],
}

class ItemEdit extends Component<ItemEditProps, ItemEditState> {
    constructor(props: ItemEditProps) {
        super(props);
        this.state = {
            loading: true,
            item: null,
            "item-return-required": true,
            "item-approval-required": true,
            "item-hidden": false,
            itemOwnerChoices: [
                {key: 'hackgt', text: 'HackGT', value: 'HackGT'},
                {key: 'hive', text: 'The Hive', value: 'The Hive'},
                {key: 'is', text: 'Invention Studio', value: 'Invention Studio'}]
        };
        this.loadItemData = this.loadItemData.bind(this);
        this.finishedLoadingItemData = this.finishedLoadingItemData.bind(this);
        this.handleInputChangeCheckbox = this.handleInputChangeCheckbox.bind(this);
        this.handleInputChangeDropdown = this.handleInputChangeDropdown.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

    }

    componentDidMount(): void {
        this.loadItemData(this.props.match.params.itemId);

    }

    finishedLoadingItemData() {
        this.setState({
            item: {
                id: "3a",
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
            loading: false,
        })
    }

    loadItemData(id: string): void {
        setTimeout(this.finishedLoadingItemData, 1000);
    }

    handleInputChangeCheckbox(event: FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps): void {
        console.log(checkboxProps.checked);
        console.log(event);
        if (checkboxProps && checkboxProps.name && typeof checkboxProps.checked !== "undefined") {
            const value: boolean = checkboxProps.checked;
            const name: string = checkboxProps.name;

            this.setState({
                [name]: value
            });
        }
    }

    handleInputChangeDropdown(name: string, dropdownProps: DropdownProps): void {
        const value = dropdownProps.value;
    }

    handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        const categories = ['Extension Cords', 'Laptops', 'Microcontrollers', 'Robotics'];

        const categoryChoices = categories.map(item => {
            return {
                key: item.replace(' ', '_').toLowerCase(),
                value: item,
                text: item
            }
        });

        const itemOwnerChoices = [
            {key: 'hackgt', text: 'HackGT', value: 'HackGT'},
            {key: 'the_hive', text: 'The Hive', value: 'The Hive'},
            {key: 'invention_studio', text: 'Invention Studio', value: 'Invention Studio'}];

        return (
            <div>
                <h1>Edit {this.state["item-name"] || "item"}</h1>
                <Form loading={this.state.loading} onChange={this.handleInputChange}>
                    <Form.Group>
                        <Form.Input width={6}
                                    label="Item name"
                                    type="text"
                                    name="item-name"
                                    required
                                    placeholder="Ventral quark accelerator"/>
                        <Form.Input width={6}
                                    name="item-img"
                                    label='Image'
                                    type="file"/>
                    </Form.Group>
                    <Form.TextArea width={12}
                                   label="Description"
                                   type="textarea"
                                   name="item-description"
                                   rows={2}
                                   placeholder="Prior to use, dust the dorsal tachyon resistance sensor array."/>
                    <Form.Group>
                        <Form.Input label="Category"
                        >
                            <AddOptionDropdown name="item-category" required={true} placeholder="Spacecraft"
                                               options={categoryChoices}/>
                        </Form.Input>
                        <Form.Input width={4}
                                    label="Item value ($)"
                                    type="number"
                                    name="item-value"
                                    labelPosition="left"
                                    placeholder="42.00">
                            <Label>$</Label>
                            <input min={0}/>
                        </Form.Input>
                        <Form.Input label="Owner">
                            <AddOptionDropdown name="item-owner" required={true} placeholder="Owner"
                                               options={itemOwnerChoices}/>
                        </Form.Input>
                    </Form.Group>

                    <h2>Stock</h2>
                    <Form.Group>
                        <Form.Input width={6}
                                    label="Quantity in stock"
                                    type="number"
                                    name="item-qty-in-stock"
                                    required
                                    placeholder="47">
                            <input type="number" min={0}/>
                        </Form.Input>
                        <Form.Input width={6}
                                    label="Quantity allowed per request"
                                    type="number"
                                    name="item-qty-per-request"
                                    required
                                    placeholder="6">
                            <input type="number" min={0}/>
                        </Form.Input>
                    </Form.Group>
                    <Form.TextArea width={6}
                                   label="Serial numbers (one per line)"
                                   name="item-serial-nums"
                                   rows={6}
                                   placeholder="2873-813"/>

                    <h2>Checkout Controls</h2>
                    <Popup inverted={true} trigger={<Form.Checkbox name="item-return-required"
                                                                   label='Return required'
                                                                   onChange={this.handleInputChangeCheckbox}
                                                                   defaultChecked/>}
                           content="Whether users who check out this item are expected to return it"/>
                    <Popup inverted={true} trigger={<Form.Checkbox label='Approval required'
                                                                   name="item-approval-required"
                                                                   onChange={this.handleInputChangeCheckbox}
                                                                   defaultChecked/>}
                           content="Whether hardware checkout staff must approve requests for this item"/>
                    <Popup inverted={true} trigger={<Form.Checkbox label='Hidden'
                                                                   name="item-hidden"
                                                                   onChange={this.handleInputChangeCheckbox}/>}
                           content="Whether to hide this item on the public list of hardware"/>

                    <Button primary>Save</Button>
                </Form>
            </div>
        );

    }
}

export default ItemEdit;
