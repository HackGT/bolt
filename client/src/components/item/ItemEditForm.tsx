import React, {ChangeEvent, Component, FormEvent} from "react";
import HardwareItem from "../inventory/HardwareItem";
import {Button, CheckboxProps, DropdownProps, Form, Grid, Header, Item, Label, Message, Popup} from "semantic-ui-react";
import AddOptionDropdown from "../util/AddOptionDropdown";
import {withToastManager} from "react-toast-notifications";
import {Redirect} from "react-router";
import {Mutation, Query} from "@apollo/react-components";
import {CREATE_ITEM, UPDATE_ITEM} from "../util/graphql/Mutations";
import {ALL_CATEGORIES, ALL_ITEMS, ALL_LOCATIONS} from "../util/graphql/Queries";
import {ItemNoId, Location} from "../../types/Hardware";

interface ItemDetails {
    approvalRequired: boolean;
    returnRequired: boolean;
    price: number;
    hidden: boolean;
    owner: string;
}

interface ItemEditProps {
    preloadItemId: number;
    preloadItem: ItemComplete;
    createItem: boolean;
    toastManager: any;
    loading?: boolean;
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
    itemOwnerChoices: string[];
    itemPreviewKey: number;
    categoryError: boolean;
    ownerError: boolean;
    locationError: boolean;
    qtyPerRequestTooLargeError: boolean;
}

class ItemEditForm extends Component<ItemEditProps, ItemEditState> {
    constructor(props: ItemEditProps) {
        super(props);
        this.state = {
            categoryError: false,
            ownerError: false,
            locationError: false,
            qtyPerRequestTooLargeError: false,
            loading: false,
            item: this.props.createItem ? {
                item_name: "",
                description: "",
                imageUrl: "",
                category: "",
                location: "",
                totalAvailable: 0,
                maxRequestQty: 0,
                price: 0,
                approvalRequired: true,
                returnRequired: true,
                hidden: false,
                owner: "HackGT"
            } : this.props.preloadItem,
            itemOwnerChoices: ["HackGT", "The Hive", "Invention Studio"],
            itemPreviewKey: 0
        };

    }

    public handleInputChangeCheckbox = (event: FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps): void => {
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
        const categories = ["Extension Cords", "Laptops", "Microcontrollers", "Robotics"];

        const categoryChoices = categories.map(item => {
            return {
                key: item.replace(" ", "_").toLowerCase(),
                value: item,
                text: item
            };
        });
        const editing = !this.props.createItem;

        const itemOwnerChoices = ["HackGT", "The Hive", "Invention Studio"];

        const qtyPerRequestTooBigErrorMessage = <Message error visible={this.state.qtyPerRequestTooLargeError}
                                                         size="small"
                                                         content="The quantity allowed per request can't be greater than the quantity in stock."/>;


        return (
            <Grid columns={16} stackable>
                <Grid.Row>
                    <Grid.Column width={11}>
                        <Mutation mutation={this.props.createItem ? CREATE_ITEM : UPDATE_ITEM}
                                  refetchQueries={
                                      [
                                          {query: ALL_ITEMS},
                                          {query: ALL_CATEGORIES}
                                      ]
                                  }>
                            {(submitForm: any, {loading, error, data}: any) => (
                                <Form loading={this.state.loading || loading || this.props.loading}
                                      onChange={this.handleInputChange}
                                      error={this.state.categoryError || this.state.ownerError}
                                      onSubmit={e => {
                                          e.preventDefault();
                                          const {toastManager} = this.props;

                                          let variables: any = {newItem: this.state.item};

                                          if (!this.props.createItem) {
                                              variables = {
                                                  itemId: this.props.preloadItemId,
                                                  updatedItem: this.state.item
                                              };
                                              if (typeof variables.updatedItem.location === "object") { // Transform location from the object from server into just the location name
                                                  variables.updatedItem.location = variables.updatedItem.location.location_name;
                                              }
                                              delete variables.updatedItem.__typename;
                                          } else {
                                              if (typeof variables.newItem.location === "object") { // Transform location from the object from server into just the location name
                                                  variables.newItem.location = variables.newItem.location.location_name;
                                              }
                                              delete variables.newItem.__typename;
                                          }

                                          const categoryError = this.state.item.category === "";
                                          const locationError = this.state.item.location === "";
                                          const ownerError = this.state.item.owner === "";
                                          const qtyPerRequestTooLargeError = this.state.item.maxRequestQty > this.state.item.totalAvailable;

                                          this.setState({
                                              categoryError,
                                              locationError,
                                              ownerError,
                                              qtyPerRequestTooLargeError
                                          });

                                          if (categoryError || locationError || ownerError || qtyPerRequestTooLargeError) {
                                              return;
                                          }

                                          submitForm({
                                              variables
                                          }).then(() => {
                                              toastManager.add(`${this.state.item.item_name} saved`, {
                                                  appearance: "success",
                                                  autoDismiss: true,
                                                  placement: "top-center"
                                              });
                                          }).catch((err: Error) => {
                                              toastManager.add(`Couldn't save your item because of an error: ${err.message}`, {
                                                  appearance: "error",
                                                  autoDismiss: false,
                                                  placement: "top-center"
                                              });
                                              console.error(err);
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
                                                    value={this.state.item.item_name}
                                                    required
                                                    placeholder="Ventral quark accelerator"/>
                                        <Form.Input width={6}
                                                    name="imageUrl"
                                                    value={this.state.item.imageUrl}
                                                    label="Image URL"
                                                    type="url"/>
                                    </Form.Group>
                                    <Form.TextArea width={12}
                                                   label="Description"
                                                   type="textarea"
                                                   name="description"
                                                   value={this.state.item.description}
                                                   rows={2}
                                                   required
                                                   placeholder="Prior to use, dust the dorsal tachyon resistance sensor array."/>
                                    <Form.Group>
                                        <Form.Input label="Category" required
                                        >
                                            <Query query={ALL_CATEGORIES}>

                                                {(result: any) => {
                                                    const queryLoading = result.loading;
                                                    const queryError = result.error;
                                                    const queryData = result.data;
                                                    let categoriesList: string[] = [];
                                                    let dataLoadedKey = 0; // this allows us to "reset" the AddOptionDropdown when we
                                                    // have the list of existing categories it should show.
                                                    // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                                                    // for more information on why this is necessary and why it works.
                                                    if (queryData && queryData.categories) {
                                                        categoriesList = queryData.categories.map((item: Category) => item.category_name);
                                                        dataLoadedKey = 1;
                                                    }
                                                    const queryErrorMsg = <Message error visible={queryError}
                                                                                   size="small"
                                                                                   content="Error loading categories list from server.  You can still enter a category by hand."/>;
                                                    return (<div>
                                                        {queryError ? queryErrorMsg : ""}
                                                        <AddOptionDropdown name="category" required
                                                                           placeholder="Spacecraft"
                                                                           loading={queryLoading}
                                                                           disabled={queryLoading}
                                                                           key={dataLoadedKey}
                                                                           value={this.state.item.category}
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
                                                    value={this.state.item.price || ""}
                                                    labelPosition="left"
                                                    placeholder="42.00">
                                            <Label>$</Label>
                                            <input min={0}/>
                                        </Form.Input>
                                        <Form.Input label="Owner" required>
                                            <AddOptionDropdown name="owner" required
                                                               placeholder="Owner"
                                                               options={itemOwnerChoices}
                                                               value={this.state.item.owner}
                                                               error={this.state.ownerError}
                                                               key={this.state.itemPreviewKey}
                                                               onChange={this.handleInputChangeDropdown}/>
                                        </Form.Input>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Input label="Location" required
                                        >
                                            <Query query={ALL_LOCATIONS}>

                                                {(result: any) => {
                                                    const queryLoading = result.loading;
                                                    const queryError = result.error;
                                                    const queryData = result.data;
                                                    let locationsList: string[] = [];
                                                    let dataLoadedKey = 0; // this allows us to "reset" the AddOptionDropdown when we
                                                    // have the list of existing locations it should show.
                                                    // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                                                    // for more information on why this is necessary and why it works.
                                                    if (queryData && queryData.locations) {
                                                        locationsList = queryData.locations.map((item: Location) => item.location_name);
                                                        dataLoadedKey = 1;
                                                    }
                                                    const queryErrorMsg = <Message error visible={queryError}
                                                                                   size="small"
                                                                                   content="Error loading locations list from server.  You can still enter a location by hand."/>;

                                                    return (<div>
                                                        {queryError ? queryErrorMsg : ""}
                                                        <AddOptionDropdown name="location" required
                                                                           placeholder="Milky Way"
                                                                           loading={queryLoading}
                                                                           disabled={queryLoading}
                                                                           key={dataLoadedKey}
                                                                           value={this.state.item.location.location_name}
                                                                           options={locationsList}
                                                                           error={this.state.locationError}
                                                                           onChange={this.handleInputChangeDropdown}/>
                                                    </div>);
                                                }}
                                            </Query>

                                        </Form.Input>
                                    </Form.Group>

                                    <h2>Stock</h2>
                                    {this.state.qtyPerRequestTooLargeError ? qtyPerRequestTooBigErrorMessage : ""}
                                    <Form.Group>
                                        <Form.Input width={6}
                                                    label="Quantity in stock"
                                                    type="number"
                                                    name="totalAvailable"
                                                    value={this.state.item.totalAvailable || ""}
                                                    error={this.state.qtyPerRequestTooLargeError}
                                                    required
                                                    placeholder="47">
                                            <input type="number" min={0}/>
                                        </Form.Input>
                                        <Form.Input width={6}
                                                    label="Quantity allowed per request"
                                                    type="number"
                                                    name="maxRequestQty"
                                                    value={this.state.item.maxRequestQty || ""}
                                                    error={this.state.qtyPerRequestTooLargeError}
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
                                                                                   checked={this.state.item.returnRequired}
                                                                                   onChange={this.handleInputChangeCheckbox}
                                    />}
                                           content="Whether users who check out this item are expected to return it"/>
                                    <Popup inverted={true} trigger={<Form.Checkbox label="Approval required"
                                                                                   name="approvalRequired"
                                                                                   checked={this.state.item.approvalRequired}
                                                                                   onChange={this.handleInputChangeCheckbox}
                                    />}
                                           content="Whether hardware checkout staff must approve requests for this item"/>
                                    <Popup inverted={true} trigger={<Form.Checkbox label="Hidden"
                                                                                   name="hidden"
                                                                                   checked={this.state.item.hidden}
                                                                                   onChange={this.handleInputChangeCheckbox}/>}
                                           content="Whether to hide this item on the public list of hardware"/>

                                    <Button primary
                                            type="submit">{this.props.createItem ? "Create item" : "Edit item"}</Button>

                                </Form>
                            )}
                        </Mutation>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Header>Preview</Header>
                        <Item.Group>
                            <HardwareItem item={this.state.item}
                                          requestsEnabled={false}
                                          key={this.state.itemPreviewKey}
                                          user={null}
                                          preview={true}
                            />
                        </Item.Group>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default withToastManager(ItemEditForm);
