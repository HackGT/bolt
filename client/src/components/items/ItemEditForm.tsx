import React, { ChangeEvent, Component, FormEvent } from "react";
import {
  CheckboxProps,
  DropdownProps,
  Grid,
  Header,
  Item as SMItem,
  Label,
  Message,
  Popup,
} from "semantic-ui-react";
import { withToastManager } from "react-toast-notifications";
import { Navigate } from "react-router";
import { Mutation, Query } from "@apollo/client/react/components";
import { TriggerConfig, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  chakra,
} from "@chakra-ui/react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiUrl, LoadingScreen } from "@hex-labs/core";

import AddOptionDropdown from "../util/AddOptionDropdown";
import HardwareItem from "../inventory/HardwareItem";
import { CREATE_ITEM, UPDATE_ITEM } from "../../graphql/Mutations";
import { ALL_CATEGORIES, ALL_ITEMS, ALL_LOCATIONS } from "../../graphql/Queries";
import { Item, Location, Category } from "../../types/Hardware";

// class ItemEditForm extends Component<ItemEditProps> {
//   constructor(props: ItemEditProps) {
//     super(props);
//     this.state = {
//       categoryError: false,
//       ownerError: false,
//       locationError: false,
//       qtyPerRequestTooLargeError: false,
//       loading: false,
//       item: this.props.createItem
//         ? {
//             name: "",
//             description: "",
//             imageUrl: "",
//             category: "",
//             location: "",
//             totalAvailable: 0,
//             maxRequestQty: 0,
//             qtyAvailableForApproval: 0,
//             qtyUnreserved: 0,
//             qtyInStock: 0,
//             price: 0,
//             approvalRequired: true,
//             returnRequired: true,
//             hidden: false,
//             owner: "HackGT",
//           }
//         : {
//             name: this.props.preloadItem.name,
//             description: this.props.preloadItem.description,
//             imageUrl: this.props.preloadItem.imageUrl || "",
//             category: this.props.preloadItem.category.name,
//             location: this.props.preloadItem.location.name,
//             totalAvailable: this.props.preloadItem.totalAvailable,
//             maxRequestQty: this.props.preloadItem.maxRequestQty,
//             qtyAvailableForApproval: this.props.preloadItem.qtyAvailableForApproval,
//             qtyUnreserved: this.props.preloadItem.qtyUnreserved,
//             qtyInStock: this.props.preloadItem.qtyInStock,
//             price: this.props.preloadItem.price,
//             approvalRequired: this.props.preloadItem.approvalRequired,
//             returnRequired: this.props.preloadItem.returnRequired,
//             hidden: this.props.preloadItem.hidden,
//             owner: this.props.preloadItem.owner,
//           },
//       itemPreviewKey: 0,
//     };
//   }

//   public handleInputChangeCheckbox = (
//     event: FormEvent<HTMLInputElement>,
//     checkboxProps: CheckboxProps
//   ): void => {
//     if (checkboxProps && checkboxProps.name && typeof checkboxProps.checked !== "undefined") {
//       const value: boolean = checkboxProps.checked;
//       const { name } = checkboxProps;

//       this.setState(prevState => ({
//         item: {
//           ...prevState.item,
//           [name]: value,
//         },
//       }));
//     }
//   };

//   public handleInputChangeDropdown = (
//     event: React.SyntheticEvent<HTMLElement>,
//     data: DropdownProps,
//     inputName: string
//   ): void => {
//     const { value } = data;
//     this.setState(prevState => ({
//       item: {
//         ...prevState.item,
//         [inputName]: value,
//       },
//     }));
//   };

//   public handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
//     const { target } = event;
//     let { value }: { value: any } = target;
//     const { name } = target;
//     const inputType = target.type;

//     // Convert number input values to numbers
//     if (inputType === "number") {
//       value = Number.parseFloat(value);
//     }

//     if (name === "totalAvailable") {
//       this.setState(prevState => ({
//         itemPreviewKey: prevState.itemPreviewKey + 1,
//       }));
//     }

//     this.setState(prevState => ({
//       item: {
//         ...prevState.item,
//         [name]: value,
//       },
//     }));
//   };

//   public render() {
//     const itemOwnerChoices = ["HackGT", "The Hive", "Invention Studio"];

//     const qtyPerRequestTooBigErrorMessage = (
//       <Message
//         error
//         visible={this.state.qtyPerRequestTooLargeError}
//         size="small"
//         content="The quantity allowed per request can't be greater than the quantity in stock."
//       />
//     );

//     return (
//       <Grid columns={16} stackable>
//         <Grid.Row>
//           <Grid.Column width={11}>
//             <Mutation
//               mutation={this.props.createItem ? CREATE_ITEM : UPDATE_ITEM}
//               refetchQueries={[{ query: ALL_ITEMS }, { query: ALL_CATEGORIES }]}
//             >
//               {(submitForm: any, { loading, error, data }: any) => (
//                 <Form
//                   loading={this.state.loading || loading || this.props.loading}
//                   onChange={this.handleInputChange}
//                   error={this.state.categoryError || this.state.ownerError}
//                   /* eslint-disable react/no-access-state-in-setstate, no-underscore-dangle */
//                   onSubmit={e => {
//                     e.preventDefault();
//                     const { toastManager } = this.props;

//                     let variables: any = { newItem: this.state.item };

//                     if (!this.props.createItem) {
//                       variables = {
//                         itemId: this.props.preloadItemId,
//                         updatedItem: this.state.item,
//                       };
//                       if (typeof variables.updatedItem.location === "object") {
//                         // Transform location from the object from server into just the location name
//                         variables.updatedItem.location = variables.updatedItem.location.name;
//                       }
//                       delete variables.updatedItem.__typename;
//                       delete variables.updatedItem.qtyAvailableForApproval;
//                       delete variables.updatedItem.qtyInStock;
//                       delete variables.updatedItem.qtyUnreserved;
//                     } else {
//                       if (typeof variables.newItem.location === "object") {
//                         // Transform location from the object from server into just the location name
//                         variables.newItem.location = variables.newItem.location.name;
//                       }
//                       delete variables.newItem.__typename;
//                       delete variables.newItem.qtyAvailableForApproval;
//                       delete variables.newItem.qtyInStock;
//                       delete variables.newItem.qtyUnreserved;
//                     }
//                     const categoryError = this.state.item.category === "";
//                     const locationError = this.state.item.location === "";
//                     const ownerError = this.state.item.owner === "";
//                     const qtyPerRequestTooLargeError =
//                       this.state.item.maxRequestQty > this.state.item.totalAvailable;

//                     this.setState({
//                       categoryError,
//                       locationError,
//                       ownerError,
//                       qtyPerRequestTooLargeError,
//                     });

//                     if (
//                       categoryError ||
//                       locationError ||
//                       ownerError ||
//                       qtyPerRequestTooLargeError
//                     ) {
//                       return;
//                     }

//                     submitForm({
//                       variables,
//                     })
//                       .then(() => {
//                         toastManager.add(`${this.state.item.name} saved`, {
//                           appearance: "success",
//                           autoDismiss: true,
//                           placement: "top-center",
//                         });
//                       })
//                       .catch((err: Error) => {
//                         toastManager.add(
//                           `Couldn't save your item because of an error: ${err.message}`,
//                           {
//                             appearance: "error",
//                             autoDismiss: false,
//                             placement: "top-center",
//                           }
//                         );
//                         console.error(err);
//                       });
//                   }}
//                 >
//                   {data && !error ? <Navigate to="/" replace /> : ""}
//                   <Message
//                     error
//                     header="Missing required fields"
//                     content="To create this item, you must complete the fields highlighted in red below."
//                   />
//                   <Form.Group>
//                     <Form.Input
//                       width={6}
//                       label="Item name"
//                       type="text"
//                       name="name"
//                       value={this.state.item.name}
//                       required
//                       placeholder="Ventral quark accelerator"
//                     />
//                     <Form.Input
//                       width={6}
//                       name="imageUrl"
//                       value={this.state.item.imageUrl}
//                       label="Image URL"
//                       type="url"
//                     />
//                   </Form.Group>
//                   <Form.TextArea
//                     width={12}
//                     label="Description"
//                     type="textarea"
//                     name="description"
//                     value={this.state.item.description}
//                     rows={2}
//                     required
//                     placeholder="Prior to use, dust the dorsal tachyon resistance sensor array."
//                   />
//                   <Form.Group>
//                     <Form.Input label="Category" required>
//                       <Query query={ALL_CATEGORIES}>
//                         {(result: any) => {
//                           const queryLoading = result.loading;
//                           const queryError = result.error;
//                           const queryData = result.data;
//                           let categoriesList: string[] = [];
//                           let dataLoadedKey = 0; // this allows us to "reset" the AddOptionDropdown when we
//                           // have the list of existing categories it should show.
//                           // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
//                           // for more information on why this is necessary and why it works.
//                           if (queryData && queryData.categories) {
//                             categoriesList = queryData.categories.map(
//                               (item: Category) => item.name
//                             );
//                             dataLoadedKey = 1;
//                           }
//                           const queryErrorMsg = (
//                             <Message
//                               error
//                               visible={queryError}
//                               size="small"
//                               content="Error loading categories list from server.  You can still enter a category by hand."
//                             />
//                           );
//                           return (
//                             <div>
//                               {queryError ? queryErrorMsg : ""}
//                               <AddOptionDropdown
//                                 name="category"
//                                 required
//                                 placeholder="Spacecraft"
//                                 loading={queryLoading}
//                                 disabled={queryLoading}
//                                 key={dataLoadedKey}
//                                 value={this.state.item.category}
//                                 options={categoriesList}
//                                 error={this.state.categoryError}
//                                 onChange={this.handleInputChangeDropdown}
//                               />
//                             </div>
//                           );
//                         }}
//                       </Query>
//                     </Form.Input>
//                     <Form.Input
//                       width={4}
//                       label="Item value ($)"
//                       type="number"
//                       step={0.01}
//                       min={0}
//                       required
//                       name="price"
//                       value={this.state.item.price || ""}
//                       labelPosition="left"
//                       placeholder="42.00"
//                     >
//                       <Label>$</Label>
//                       <input min={0} />
//                     </Form.Input>
//                     <Form.Input label="Owner" required>
//                       <AddOptionDropdown
//                         name="owner"
//                         required
//                         placeholder="Owner"
//                         options={itemOwnerChoices}
//                         value={this.state.item.owner}
//                         error={this.state.ownerError}
//                         key={this.state.itemPreviewKey}
//                         onChange={this.handleInputChangeDropdown}
//                       />
//                     </Form.Input>
//                   </Form.Group>

//                   <Form.Group>
//                     <Form.Input label="Location" required>
//                       <Query query={ALL_LOCATIONS}>
//                         {(result: any) => {
//                           const queryLoading = result.loading;
//                           const queryError = result.error;
//                           const queryData = result.data;
//                           let locationsList: string[] = [];
//                           let dataLoadedKey = 0; // this allows us to "reset" the AddOptionDropdown when we
//                           // have the list of existing locations it should show.
//                           // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
//                           // for more information on why this is necessary and why it works.
//                           if (queryData && queryData.locations) {
//                             locationsList = queryData.locations.map((item: Location) => item.name);
//                             dataLoadedKey = 1;
//                           }
//                           const queryErrorMsg = (
//                             <Message
//                               error
//                               visible={queryError}
//                               size="small"
//                               content="Error loading locations list from server.  You can still enter a location by hand."
//                             />
//                           );

//                           return (
//                             <div>
//                               {queryError ? queryErrorMsg : ""}
//                               <AddOptionDropdown
//                                 name="location"
//                                 required
//                                 placeholder="Milky Way"
//                                 loading={queryLoading}
//                                 disabled={queryLoading}
//                                 key={dataLoadedKey}
//                                 value={this.state.item.location}
//                                 options={locationsList}
//                                 error={this.state.locationError}
//                                 onChange={this.handleInputChangeDropdown}
//                               />
//                             </div>
//                           );
//                         }}
//                       </Query>
//                     </Form.Input>
//                   </Form.Group>

//                   <h2>Stock</h2>
//                   {this.state.qtyPerRequestTooLargeError ? qtyPerRequestTooBigErrorMessage : ""}
//                   <Form.Group>
//                     <Form.Input
//                       width={6}
//                       label="Quantity in stock"
//                       type="number"
//                       name="totalAvailable"
//                       value={this.state.item.totalAvailable || ""}
//                       error={this.state.qtyPerRequestTooLargeError}
//                       required
//                       placeholder="47"
//                     >
//                       <input type="number" min={0} />
//                     </Form.Input>
//                     <Form.Input
//                       width={6}
//                       label="Quantity allowed per request"
//                       type="number"
//                       name="maxRequestQty"
//                       value={this.state.item.maxRequestQty || ""}
//                       error={this.state.qtyPerRequestTooLargeError}
//                       required
//                       placeholder="6"
//                     >
//                       <input type="number" min={1} />
//                     </Form.Input>
//                   </Form.Group>
//                   <h3>Calculated Quantities</h3>
//                   <Form.Group>
//                     <Form.Field width={4}>
//                       <Popup
//                         inverted
//                         trigger={<label>Unreserved</label>}
//                         content="The number of an item that is not reserved"
//                       />
//                       <p>{this.state.item.qtyUnreserved}</p>
//                     </Form.Field>
//                     <Form.Field width={4}>
//                       <Popup
//                         inverted
//                         trigger={<label>In stock</label>}
//                         content="The number of an item that should be physically at the hardware desk"
//                       />
//                       <p>{this.state.item.qtyInStock}</p>
//                     </Form.Field>
//                     <Form.Field width={4}>
//                       <Popup
//                         inverted
//                         trigger={<label>Available for approval</label>}
//                         content="The number of an item that is available to be allocated to requests waiting to be approved"
//                       />
//                       <p>{this.state.item.qtyAvailableForApproval}</p>
//                     </Form.Field>
//                   </Form.Group>
//                   {/* <Form.TextArea width={6} */}
//                   {/*               label="Serial numbers (one per line)" */}
//                   {/*               name="item-serial-nums" */}
//                   {/*               rows={6} */}
//                   {/*               placeholder="2873-813"/> */}

//                   <h2>Checkout Controls</h2>

//                   <Popup
//                     inverted
//                     trigger={
//                       <Form.Checkbox
//                         name="returnRequired"
//                         label="Return required"
//                         checked={this.state.item.returnRequired}
//                         onChange={this.handleInputChangeCheckbox}
//                       />
//                     }
//                     content="Whether users who check out this item are expected to return it"
//                   />
//                   <Popup
//                     inverted
//                     trigger={
//                       <Form.Checkbox
//                         label="Approval required"
//                         name="approvalRequired"
//                         checked={this.state.item.approvalRequired}
//                         onChange={this.handleInputChangeCheckbox}
//                       />
//                     }
//                     content="Whether hardware checkout staff must approve requests for this item"
//                   />
//                   <Popup
//                     inverted
//                     trigger={
//                       <Form.Checkbox
//                         label="Hidden"
//                         name="hidden"
//                         checked={this.state.item.hidden}
//                         onChange={this.handleInputChangeCheckbox}
//                       />
//                     }
//                     content="Whether to hide this item on the public list of hardware"
//                   />

//                   <Button primary type="submit">
//                     {this.props.createItem ? "Create item" : "Edit item"}
//                   </Button>
//                 </Form>
//               )}
//             </Mutation>
//           </Grid.Column>
//           <Grid.Column width={5}>
//             <Header>Preview</Header>
//             <SMItem.Group>
//               {/* <HardwareItem
//                 item={this.state.item}
//                 requestsEnabled={false}
//                 key={this.state.itemPreviewKey}
//                 user={null}
//                 preview
//               /> */}
//             </SMItem.Group>
//           </Grid.Column>
//         </Grid.Row>
//       </Grid>
//     );
//   }
// }

interface ItemEditProps {
  preloadItemId: number;
  preloadItem: Item;
  createItem: boolean;
  toastManager: any;
  loading?: boolean;
}

export type FormItem = {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  totalAvailable: number;
  maxRequestQty: number;
  price: number;
  hidden: boolean;
  returnRequired: boolean;
  approvalRequired: boolean;
  owner: string;
  location: string;
  qtyUnreserved: number;
  qtyInStock: number;
  qtyAvailableForApproval: number;
};

const ItemEditForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormItem>();

  const itemMutation = useMutation(newItem => axios.post("/items", newItem));
  const locationQuery = useQuery(["locations"], () => axios.get("/locations"));
  const categoryQuery = useQuery(["categories"], () => axios.get("/categories"));

  if (locationQuery.isLoading || categoryQuery.isLoading) {
    return <LoadingScreen />;
  }

  function onSubmit(values: any) {
    itemMutation.mutate(values);
  }

  return (
    <Flex as="form" gap={4} flexDir="column" onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={Boolean(errors.name)}>
        <FormLabel htmlFor="itemName">
          Item name <chakra.span color="red.400">*</chakra.span>
        </FormLabel>
        <Input
          id="name"
          placeholder="Ray Gun"
          {...register("name", { required: "Please provide an item name!" })}
        />
        <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(errors.description)}>
        <FormLabel htmlFor="description">
          Description <chakra.span color="red.400">*</chakra.span>
        </FormLabel>
        <Textarea
          id="description"
          placeholder="Intended for bugs. Be sure not to point at other people."
          {...register("description", { required: "Please provide a description!" })}
        />
        <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(errors.category)}>
        <FormLabel htmlFor="category">
          Category <chakra.span color="red.400">*</chakra.span>
        </FormLabel>
        <Select
          id="category"
          placeholder="Select a category"
          {...register("category", { required: "Please provide a category!" })}
        >
          {categoryQuery.data?.data.map((category: Category) => (
            <option value={category.id}>{category.name}</option>
          ))}
        </Select>
        <FormErrorMessage>{errors.category && errors.category.message}</FormErrorMessage>
      </FormControl>
      <Flex gap="4">
        <FormControl isInvalid={Boolean(errors.price)}>
          <FormLabel>
            Item value <chakra.span color="red.400">*</chakra.span>
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
              $
            </InputLeftElement>
            <Input
              placeholder="Enter amount"
              type="number"
              min={0}
              {...register("price", { required: "Please provide an item value!" })}
            />
          </InputGroup>
          <FormErrorMessage>{errors.price && errors.price.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.owner)}>
          <FormLabel htmlFor="owner">
            Owner <chakra.span color="red.400">*</chakra.span>
          </FormLabel>
          <Select
            id="owner"
            placeholder="Select an owner"
            {...register("owner", { required: "Please provide an owner!" })}
          >
            <option value="Captain Kirk">Captain Kirk</option>
          </Select>
          <FormErrorMessage>{errors.owner && errors.owner.message}</FormErrorMessage>
        </FormControl>
      </Flex>
      <FormControl isInvalid={Boolean(errors.location)}>
        <FormLabel htmlFor="location">
          Location <chakra.span color="red.400">*</chakra.span>
        </FormLabel>
        <Select
          id="location"
          placeholder="Select a location"
          {...register("location", { required: "Please provide a location!" })}
        >
          {locationQuery.data?.data.map((location: Location) => (
            <option value={location.id}>{location.name}</option>
          ))}
        </Select>
        <FormErrorMessage>{errors.location && errors.location.message}</FormErrorMessage>
      </FormControl>
      <Flex flexDir="row" gap="4">
        <FormControl isInvalid={Boolean(errors.totalAvailable)}>
          <FormLabel>
            Quantity in stock <chakra.span color="red.400">*</chakra.span>
          </FormLabel>
          <NumberInput max={99} min={1}>
            <NumberInputField
              placeholder="Enter amount"
              {...register("totalAvailable", {
                required: "Please provide a quantity for the stock!",
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>
            {errors.totalAvailable && errors.totalAvailable.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.maxRequestQty)}>
          <FormLabel>
            Quantity allowed per request <chakra.span color="red.400">*</chakra.span>
          </FormLabel>
          <NumberInput max={99} min={1}>
            <NumberInputField
              placeholder="Enter amount"
              {...register("maxRequestQty", {
                required: "Please provide a quantity allowed!",
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>
            {errors.maxRequestQty && errors.maxRequestQty.message}
          </FormErrorMessage>
        </FormControl>
      </Flex>
      {/* <Heading as="h3" size="md">
        Calculated Quantities
      </Heading>
      <StatGroup>
        <Stat>
          <StatLabel>Unreserved</StatLabel>
          <StatNumber>24</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>In Stock</StatLabel>
          <StatNumber>10</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Available for Approval</StatLabel>
          <StatNumber>24</StatNumber>
        </Stat>
      </StatGroup>
      <Heading as="h3" size="md">
        Checkout Controls
      </Heading> */}
      <CheckboxGroup colorScheme="twitter">
        <Stack spacing={5} direction="row">
          <Checkbox defaultChecked {...register("returnRequired")}>
            Return required
          </Checkbox>
          <Checkbox defaultChecked {...register("approvalRequired")}>
            Approval required
          </Checkbox>
          <Checkbox {...register("hidden")}>Hidden</Checkbox>
        </Stack>
      </CheckboxGroup>
      <Button colorScheme="twitter" type="submit" isLoading={isSubmitting}>
        Create item
      </Button>
    </Flex>
  );
};

export default ItemEditForm;
