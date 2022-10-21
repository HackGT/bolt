import React, { ChangeEvent, useEffect, useState } from "react";
import { withToastManager } from "react-toast-notifications";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoadingScreen, useAuth } from "@hex-labs/core";
import { User } from "firebase/auth";

import { Item, RequestedItem, SUBMITTED } from "../../types/Hardware";
import { AppState } from "../../state/Store";
import { Request } from "../../types/Request";

interface HardwareItemState {
  qtyRequested: number;
  loading: boolean;
}

interface HardwareItemProps {
  item: Item;
  // toastManager: any;
  requestsEnabled: boolean;
  // user: User | null;
  preview?: boolean;
  outOfStock?: boolean;
}

function itemImage(src: string | undefined, outOfStock = false) {
  return (
    <Box boxSize="48">
      <Image draggable={false} src={src || "http://placekitten.com/300/300"} borderRadius="6" />
    </Box>
  );
}

// class HardwareItem extends React.Component<HardwareItemProps> {
//   constructor(props: HardwareItemProps) {
//     super(props);
//     this.state = {
//       qtyRequested: 1,
//       loading: false,
//     };
//   }

//   public incrementQty = () => {
//     this.setState(prevState => ({
//       qtyRequested: prevState.qtyRequested + 1,
//     }));
//   };

//   public decrementQty = () => {
//     this.setState(prevState => ({
//       qtyRequested: prevState.qtyRequested - 1,
//     }));
//   };

//   public handleQtyUpdate = (qtyInput: ChangeEvent<HTMLInputElement>) => {
//     const qtyAsNumber: number = Number.parseInt(qtyInput.target.value);

//     this.updateQtyRequested(qtyAsNumber);
//   };

//   /* eslint-disable no-param-reassign */
//   public updateQtyRequested = (qtyRequested: number) => {
//     if (Number.isNaN(qtyRequested)) {
//       qtyRequested = 0;
//     }

//     // Clip qtyRequested to between 0 and maxRequestQty (inclusive)
//     qtyRequested = Math.min(Math.max(qtyRequested, 0), this.props.item.maxRequestQty);

//     this.setState({
//       qtyRequested,
//     });
//   };

//   public render() {
//     const newRequest: RequestedItem = {
//       id: this.props.item.id,
//       user: this.props.user ? this.props.user.uuid : "",
//       name: this.props.item.name,
//       qtyRequested: this.state.qtyRequested,
//       category: this.props.item.category,
//       status: SUBMITTED,
//       location: this.props.item.location,
//       cancelled: false,
//     };

//     const minusBtn = (
//       <Button
//         icon="minus"
//         onClick={this.decrementQty}
//         disabled={this.state.loading || this.state.qtyRequested === 0}
//       />
//     );

//     const plusBtn = (
//       <Button
//         icon="plus"
//         onClick={this.incrementQty}
//         disabled={this.state.loading || this.state.qtyRequested === this.props.item.maxRequestQty}
//       />
//     );
//     const qtyRequest = this.props.requestsEnabled ? (
//       <Input action>
//         <input
//           style={{ width: 50, textAlign: "center" }}
//           value={this.state.qtyRequested}
//           disabled={this.state.loading}
//           onChange={this.handleQtyUpdate}
//         />
//         <Popup
//           disabled={this.state.loading || !this.state.qtyRequested}
//           inverted
//           trigger={minusBtn}
//           content="Remove one from request"
//         />
//         <Popup disabled={this.state.loading} inverted trigger={plusBtn} content="Request another" />
//         <RequestButton requestedItem={newRequest} user={this.props.user} />
//       </Input>
//     ) : (
//       ""
//     );

//     const maxPerRequest = `Request up to ${this.props.item.maxRequestQty} at a time`;

//     const editBtn =
//       this.props.user && this.props.user.admin ? (
//         <Popup
//           content="Edit this item"
//           inverted
//           trigger={
//             <Button
//               size="mini"
//               basic
//               primary
//               disabled={this.props.preview}
//               icon
//               as={Link}
//               to={`admin/items/${this.props.item.id}`}
//             >
//               <Icon name="pencil" />
//             </Button>
//           }
//         />
//       ) : (
//         ""
//       );

//     const hidden =
//       this.props.user && this.props.item.hidden ? (
//         <Popup
//           content="Item is not visible to non-admins"
//           inverted
//           trigger={<Icon style={{ color: "gray" }} name="eye slash outline" />}
//         />
//       ) : (
//         ""
//       );

//     return (
//       <SMItem>
//         {itemImage(this.props.item.imageUrl, this.props.item.qtyUnreserved <= 0)}
//         <SMItem.Content>
//           <SMItem.Header>
//             {editBtn} {hidden} {this.props.item.name || (this.props.preview && "SMItem Name")}
//           </SMItem.Header>
//           <SMItem.Meta>{maxPerRequest}</SMItem.Meta>
//           <SMItem.Description>
//             {this.props.item.description || (this.props.preview && "Description")}
//           </SMItem.Description>
//           <SMItem.Extra>{qtyRequest}</SMItem.Extra>
//         </SMItem.Content>
//       </SMItem>
//     );
//   }
// }

// export default HardwareItem;

interface IRequestMutation {
  item: string;
  quantity: number;
  user: User;
}

const HardwareItem = ({ item, requestsEnabled, preview, outOfStock }: HardwareItemProps) => {
  const [requestedNum, setRequestedNum] = useState(1);

  const { user, loading } = useAuth();

  const { refetch } = useQuery(["requests"]);
  const { refetch: itemRefetch } = useQuery(["items"]);

  const mutation = useMutation(
    async (newRequest: IRequestMutation): Promise<any> =>
      await axios.post("/hardware-requests", newRequest),
    {
      onSuccess: () => {
        refetch();
        itemRefetch();
      },
    }
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Flex flexDir="row">
      {itemImage(item.imageUrl)}
      <Flex flexDir="column" p="4" gap="1" w="100%">
        <Flex alignItems="center">
          <Heading size="md">{item.name}</Heading>
          <Heading size="sm" color="gray.400" ml={2}>
            {`Available: ${item.totalAvailable}`}
          </Heading>
        </Flex>
        <Text>{item.description}</Text>
        <Flex flexDir="row" justifyContent="space-between">
          <NumberInput
            w="48%"
            display="flex"
            flexDir="row"
            min={outOfStock ? 0 : 1}
            max={item.maxRequestQty}
            value={outOfStock ? 0 : requestedNum}
            onChange={e => setRequestedNum(Number(e))}
            isDisabled={outOfStock}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Button
            w="48%"
            colorScheme="twitter"
            disabled={outOfStock}
            onClick={() => {
              const newRequest = { item: item.id, quantity: requestedNum, user: user as User };
              mutation.mutate(newRequest);
            }}
          >
            {outOfStock ? "Out of stock" : `Request ${requestedNum} items`}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HardwareItem;
