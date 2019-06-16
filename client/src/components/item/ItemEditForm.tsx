import React, {ChangeEvent, Component, FormEvent} from "react";
import {ItemNoId} from "../inventory/HardwareItem";
import {Button, CheckboxProps, DropdownProps, Form, Label, Popup} from "semantic-ui-react";
import AddOptionDropdown from "./AddOptionDropdown";
import Mutation from "react-apollo/Mutation";
import {withToastManager} from "react-toast-notifications";
import gql from "graphql-tag";
import {Redirect} from "react-router";

interface ItemDetails {
    approvalRequired: boolean;
    returnRequired: boolean;
    price: number;
    hidden: boolean;
    owner: string;
}

interface ItemEditProps {
    itemId?: number;
    createItem: boolean;
    toastManager: any;
}

export type ItemComplete = ItemNoId & ItemDetails & {
    [name: string]: any | any[];
};

interface ItemEditState {
    loading: boolean;
    item: ItemComplete | null;

    [name: string]: any | any[];
}

const CREATE_ITEM = gql`
    mutation createItem ($newItem: ItemInput!) {
        createItem(newItem: $newItem) {
            id
            item_name
        }
    }
`;

const UPDATE_ITEM = CREATE_ITEM;

class ItemEditForm extends Component<ItemEditProps, ItemEditState> {
    constructor(props: ItemEditProps) {
        super(props);
        this.state = {
            loading: !this.props.createItem,
            item: {
                item_name: "",
                description: "",
                imageUrl: "",
                category: "",
                totalAvailable: 0,
                maxRequestQty: 0,
                price: 0,
                approvalRequired: true,
                returnRequired: true,
                hidden: false,
                owner: "HackGT"
            },
            itemOwnerChoices: [
                {key: "hackgt", text: "HackGT", value: "HackGT"},
                {key: "hive", text: "The Hive", value: "The Hive"},
                {key: "is", text: "Invention Studio", value: "Invention Studio"}]
        };

    }

    public componentDidMount = (): void => {
        // this.loadItemData(this.props.match.params.itemId);

    }

    public handleInputChangeCheckbox = (event: FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps): void => {
        console.log(checkboxProps.checked);
        console.log(event);
        if (checkboxProps && checkboxProps.name && typeof checkboxProps.checked !== "undefined") {
            const value: boolean = checkboxProps.checked;
            const name: string = checkboxProps.name;

            // @ts-ignore
            this.setState({
                item: {
                    ...this.state.item,
                    [name]: value
                }
            });
        }
    }

    public handleInputChangeDropdown = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, inputName: string): void => {
        const target = event.target;
        const value = data.value;
        // @ts-ignore
        this.setState({
            item: {
                ...this.state.item,
                [inputName]: value
            }
        });
    };

    public handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;

        // @ts-ignore
        this.setState({
            item: {
                ...this.state.item,
                [name]: value
            }
        });
    }

    public render() {
        console.log("itemId is...", this.props.itemId);
        const categories = ["Extension Cords", "Laptops", "Microcontrollers", "Robotics"];

        const categoryChoices = categories.map(item => {
            return {
                key: item.replace(" ", "_").toLowerCase(),
                value: item,
                text: item
            };
        });

        const itemOwnerChoices = [
            {key: "hackgt", text: "HackGT", value: "HackGT"},
            {key: "the_hive", text: "The Hive", value: "The Hive"},
            {key: "invention_studio", text: "Invention Studio", value: "Invention Studio"}];

        return (
            <Mutation mutation={this.props.createItem ? CREATE_ITEM : UPDATE_ITEM}>
                {(submitForm: any, {loading, error, called, data}: any) => (
                    <Form loading={this.state.loading || loading} onChange={this.handleInputChange}
                          onSubmit={e => {
                              e.preventDefault();
                              const {toastManager} = this.props;
                              submitForm({
                                  variables: {
                                      newItem: {
                                          item_name: "Blueberry Pi 2",
                                          description: "Better than Raspberry",
                                          imageUrl: "lolno",
                                          category: "Microcontrollers",
                                          totalAvailable: 3,
                                          maxRequestQty: 1,
                                          price: 29.95,
                                          approvalRequired: true,
                                          returnRequired: true,
                                          hidden: false,
                                          owner: "HackGT"
                                      }
                                  }
                              }).then(() => {
                                  toastManager.add("Successfully created ${item_name}", {
                                      appearance: "success",
                                      autoDismiss: true,
                                      placement: "top-center"
                                  });
                              }).catch(() => {
                                  toastManager.add("Unable to create your item :(", {
                                      appearance: "error",
                                      autoDismiss: false,
                                      placement: "top-center"
                                  });
                              });


                          }}>

                        {data && !error ? <Redirect to="/"/> : ""}
                        <Form.Group>
                            <Form.Input width={6}
                                        label="Item name"
                                        type="text"
                                        name="item_name"
                                        required
                                        placeholder="Ventral quark accelerator"/>
                            <Form.Input width={6}
                                        name="item-img"
                                        label="Image"
                                        type="file"/>
                        </Form.Group>
                        <Form.TextArea width={12}
                                       label="Description"
                                       type="textarea"
                                       name="description"
                                       rows={2}
                                       placeholder="Prior to use, dust the dorsal tachyon resistance sensor array."/>
                        <Form.Group>
                            <Form.Input label="Category"
                            >
                                <AddOptionDropdown name="category" required={true} placeholder="Spacecraft"
                                                   options={categoryChoices} onChange={this.handleInputChangeDropdown}/>
                            </Form.Input>
                            <Form.Input width={4}
                                        label="Item value ($)"
                                        type="number"
                                        name="price"
                                        labelPosition="left"
                                        placeholder="42.00">
                                <Label>$</Label>
                                <input min={0}/>
                            </Form.Input>
                            <Form.Input label="Owner">
                                <AddOptionDropdown name="owner" required={true} placeholder="Owner"
                                                   options={itemOwnerChoices}
                                                   onChange={this.handleInputChangeDropdown}/>
                            </Form.Input>
                        </Form.Group>

                        <h2>Stock</h2>
                        <Form.Group>
                            <Form.Input width={6}
                                        label="Quantity in stock"
                                        type="number"
                                        name="totalAvailable"
                                        required
                                        placeholder="47">
                                <input type="number" min={0}/>
                            </Form.Input>
                            <Form.Input width={6}
                                        label="Quantity allowed per request"
                                        type="number"
                                        name="maxRequestQty"
                                        required
                                        placeholder="6">
                                <input type="number" min={0}/>
                            </Form.Input>
                        </Form.Group>
                        {/*<Form.TextArea width={6}*/}
                        {/*               label="Serial numbers (one per line)"*/}
                        {/*               name="item-serial-nums"*/}
                        {/*               rows={6}*/}
                        {/*               placeholder="2873-813"/>*/}

                        <h2>Checkout Controls</h2>

                        <Popup inverted={true} trigger={<Form.Checkbox name="returnRequired"
                                                                       label="Return required"
                                                                       onChange={this.handleInputChangeCheckbox}
                                                                       defaultChecked/>}
                               content="Whether users who check out this item are expected to return it"/>
                        <Popup inverted={true} trigger={<Form.Checkbox label="Approval required"
                                                                       name="approvalRequired"
                                                                       onChange={this.handleInputChangeCheckbox}
                                                                       defaultChecked/>}
                               content="Whether hardware checkout staff must approve requests for this item"/>
                        <Popup inverted={true} trigger={<Form.Checkbox label="Hidden"
                                                                       name="hidden"
                                                                       onChange={this.handleInputChangeCheckbox}/>}
                               content="Whether to hide this item on the public list of hardware"/>

                        <Button primary type="submit">Create item</Button>
                        {console.log(loading, called, error, data)}
                    </Form>
                )}
            </Mutation>
        );
    }
}

export default withToastManager(ItemEditForm);
