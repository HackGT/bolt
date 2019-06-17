import React, {ChangeEvent, Component, FormEvent} from "react";
import HardwareItem, {ItemNoId} from "../inventory/HardwareItem";
import {Button, CheckboxProps, DropdownProps, Form, Grid, Header, Item, Label, Message, Popup} from "semantic-ui-react";
import AddOptionDropdown, {Option} from "./AddOptionDropdown";
import Mutation from "react-apollo/Mutation";
import {withToastManager} from "react-toast-notifications";
import gql from "graphql-tag";
import {Redirect} from "react-router";
import {Query} from "react-apollo";

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

export type Category = {
    category_id: number;
    category_name: string;
};

interface ItemEditState {
    loading: boolean;
    item: ItemComplete;
    itemOwnerChoices: DropdownProps[];
    itemPreviewKey: number;
    categoryError: boolean;
    ownerError: boolean;
}

const GET_ITEMS = gql`
    query {
        items {
            id
            item_name
            description
            imageUrl
            category
            totalAvailable
            maxRequestQty
            hidden
            approvalRequired
            returnRequired
            owner
        }
    }
`;

const CREATE_ITEM = gql`
    mutation createItem ($newItem: ItemInput!) {
        createItem(newItem: $newItem) {
            id
            item_name
        }
    }
`;

// temporary - will be resolved in a future PR
const UPDATE_ITEM = CREATE_ITEM;

const CATEGORIES_QUERY = gql`
    query categories {
        categories {
            category_id
            category_name
        }
    }
`;

class ItemEditForm extends Component<ItemEditProps, ItemEditState> {
    constructor(props: ItemEditProps) {
        super(props);
        this.state = {
            categoryError: false,
            ownerError: false,
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
                {key: "is", text: "Invention Studio", value: "Invention Studio"}],
            itemPreviewKey: 0
        };

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
        const value = data.value;
        // @ts-ignore
        this.setState({
            item: {
                ...this.state.item,
                [inputName]: value
            }
        });
    }

    public handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        let value: string | number = target.value;
        const name = target.name;
        const inputType = target.type;
        console.log("inputType", inputType);

        // Convert number input values to numbers
        if (inputType === "number") {
            value = Number.parseFloat(value);
        }

        if (name === "totalAvailable") {
            this.setState({
                itemPreviewKey: this.state.itemPreviewKey + 1
            });
        }

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
            <Grid columns={16}>
                <Grid.Row>
                    <Grid.Column width={11}>
                        <Mutation mutation={this.props.createItem ? CREATE_ITEM : UPDATE_ITEM}
                                  update={(cache: any, {data: {createItem}}: any): any => {
                                      const {items} = cache.readQuery({query: GET_ITEMS});
                                      cache.writeQuery({
                                          query: GET_ITEMS,
                                          data: {
                                              items: items.concat([createItem])
                                          }
                                      });
                                  }}
                                  refetchQueries={[{
                                      query: CATEGORIES_QUERY
                                  }]}>
                            {(submitForm: any, {loading, error, called, data}: any) => (
                                <Form loading={this.state.loading || loading} onChange={this.handleInputChange}
                                      error={this.state.categoryError || this.state.ownerError}
                                      onSubmit={e => {
                                          e.preventDefault();
                                          const {toastManager} = this.props;
                                          const categoryError = this.state.item.category === "";
                                          const ownerError = this.state.item.owner === "";
                                          this.setState({
                                              categoryError,
                                              ownerError
                                          });
                                          if (categoryError || ownerError) {
                                              return;
                                          }
                                          submitForm({
                                              variables: {
                                                  newItem: this.state.item
                                              }
                                          }).then(() => {
                                              toastManager.add(`Successfully created ${this.state.item.item_name}`, {
                                                  appearance: "success",
                                                  autoDismiss: true,
                                                  placement: "top-center"
                                              });
                                          }).catch(() => {
                                              toastManager.add("Couldn't create your item because of an error", {
                                                  appearance: "error",
                                                  autoDismiss: false,
                                                  placement: "top-center"
                                              });
                                          });


                                      }}>

                                    {data && !error ? <Redirect to="/"/> : ""}
                                    <Message error header="Missing required fields"
                                             content="To create this item, you must complete the fields highlighted in red below."/>
                                    <Form.Group>
                                        <Form.Input width={6}
                                                    label="Item name"
                                                    type="text"
                                                    name="item_name"
                                                    required
                                                    placeholder="Ventral quark accelerator"/>
                                        <Form.Input width={6}
                                                    name="imageUrl"
                                                    label="Image URL"
                                                    type="url"/>
                                    </Form.Group>
                                    <Form.TextArea width={12}
                                                   label="Description"
                                                   type="textarea"
                                                   name="description"
                                                   rows={2}
                                                   required
                                                   placeholder="Prior to use, dust the dorsal tachyon resistance sensor array."/>
                                    <Form.Group>
                                        <Form.Input label="Category" required
                                        >
                                            <Query query={CATEGORIES_QUERY}>

                                                {(result: any) => {
                                                    const queryLoading = result.loading;
                                                    const queryError = result.error;
                                                    const queryData = result.data;
                                                    console.log("categories query, l, e, d", queryLoading, queryError, queryData);
                                                    let categoriesList: Option[] = [];
                                                    console.log(categoriesList);
                                                    let dataLoadedKey = 0; // this allows us to "reset" the AddOptionDropdown when we
                                                    // have the list of existing categories it should show.
                                                    // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                                                    // for more information on why this is necessary and why it works.
                                                    if (queryData && queryData.categories) {
                                                        categoriesList = queryData.categories.map((c: Category) => {
                                                            return {
                                                                value: c.category_name,
                                                                text: c.category_name
                                                            };
                                                        });
                                                        dataLoadedKey = 1;
                                                    }
                                                    return (<div>
                                                        <Message error visible={queryError} size="small"
                                                                 content="Error loading categories list from server.  You can still enter a category by hand."/>
                                                        <AddOptionDropdown name="category" required
                                                                           placeholder="Spacecraft"
                                                                           loading={queryLoading}
                                                                           disabled={queryLoading}
                                                                           key={dataLoadedKey}
                                                                           options={categoriesList}
                                                                           error={this.state.categoryError}
                                                                           onChange={this.handleInputChangeDropdown}/>
                                                    </div>);
                                                }}
                                            </Query>

                                        </Form.Input>
                                        <Form.Input width={4}
                                                    label="Item value ($)"
                                                    type="number"
                                                    step={.01}
                                                    min={0}
                                                    required
                                                    name="price"
                                                    labelPosition="left"
                                                    placeholder="42.00">
                                            <Label>$</Label>
                                            <input min={0}/>
                                        </Form.Input>
                                        <Form.Input label="Owner" required>
                                            <AddOptionDropdown name="owner" required={true} placeholder="Owner"
                                                               options={itemOwnerChoices}
                                                               value={this.state.item.owner}
                                                               error={this.state.ownerError}
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
                                            <input type="number" min={1}/>
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

                                </Form>
                            )}
                        </Mutation>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Header>Preview</Header>
                        <Item.Group>
                            <HardwareItem item_name={this.state.item.item_name || "Item Name"}
                                          description={this.state.item.description}
                                          requestsEnabled={false}
                                          qtyRemaining={this.state.item.totalAvailable}
                                          totalAvailable={this.state.item.totalAvailable}
                                          maxRequestQty={this.state.item.maxRequestQty || 1}
                                          category={this.state.item.category || "Category"}
                                          key={this.state.itemPreviewKey}
                                          id={1}
                                          addItem={null}
                                          qtyUpdate={null}
                                          user={null}
                            />
                        </Item.Group>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default withToastManager(ItemEditForm);
