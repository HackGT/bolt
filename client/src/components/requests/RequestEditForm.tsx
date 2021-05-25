import { useMutation, useQuery } from "@apollo/client";
import React, { ChangeEvent, useState } from "react";
import { withToastManager } from "react-toast-notifications";
import { Form, Message, Popup, Button, Dropdown, DropdownProps } from "semantic-ui-react";

import { CREATE_REQUEST, UPDATE_REQUEST } from "../../graphql/Mutations";
import { ALL_REQUESTS, REQUEST_FORM_INFO } from "../../graphql/Queries";
import { APPROVED, READY_FOR_PICKUP, SUBMITTED } from "../../types/Hardware";

export type FormRequest = {
  userId: string;
  itemId: string;
  quantity: number;
  status: string;
};

interface Props {
  preloadRequestId?: string;
  preloadRequest: FormRequest;
  createRequest: boolean;
  toastManager: any;
  loading?: boolean;
}

const RequestEditForm: React.FC<Props> = props => {
  const [requestData, setRequestData] = useState(props.preloadRequest);

  const { data, loading, error } = useQuery(REQUEST_FORM_INFO);
  const [updateRequest, { loading: updateLoading }] = useMutation(UPDATE_REQUEST);
  const [createRequest, { loading: createLoading }] = useMutation(CREATE_REQUEST, {
    refetchQueries: [{ query: ALL_REQUESTS }],
  });

  if (error) {
    return <Message error visible size="small" content="Error loading data from server." />;
  }

  const userOptions = loading
    ? []
    : data.users.map((user: any) => ({
        text: `${user.name} [${user.email}]`,
        value: user.uuid,
      }));

  const itemOptions = loading
    ? []
    : data.items.map((item: any) => ({
        text: `${item.category.name} - ${item.name} [${item.location.name}]`,
        value: item.id,
      }));

  const selectedItem = !loading && data.items.find((item: any) => item.id === requestData.itemId);

  const onSubmit = async () => {
    const mutationData = props.createRequest
      ? {
          userId: requestData.userId,
          itemId: requestData.itemId,
          quantity: requestData.quantity,
          status: requestData.status,
        }
      : {
          id: props.preloadRequestId,
          userId: requestData.userId,
          quantity: requestData.quantity,
        };

    try {
      if (props.createRequest) {
        await createRequest({ variables: { newRequest: mutationData } });
      } else {
        await updateRequest({ variables: { updatedRequest: mutationData } });
      }

      props.toastManager.add(
        `Requisition ${props.createRequest ? "created" : "saved"} successfully`,
        {
          appearance: "success",
          autoDismiss: true,
          placement: "top-center",
        }
      );
    } catch (err) {
      console.error(JSON.parse(JSON.stringify(err)));
      props.toastManager.add(`Couldn't save your requisition because of an error: ${err.message}`, {
        appearance: "error",
        autoDismiss: false,
        placement: "top-center",
      });
    }
  };

  const handleInputChangeDropdown = (
    event: React.SyntheticEvent<HTMLElement>,
    dropdownData: DropdownProps
  ): void => {
    const { name, value } = dropdownData;
    setRequestData(oldValue => ({
      ...oldValue,
      [name]: value,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    let { value }: { value: any } = target;
    const { name } = target;
    const inputType = target.type;

    // Convert number input values to numbers
    if (inputType === "number") {
      value = Number.parseFloat(value);
    }

    setRequestData(oldValue => ({
      ...oldValue,
      [name]: value,
    }));
  };

  return (
    <Form
      loading={loading || props.loading || updateLoading || createLoading}
      onChange={handleInputChange}
      onSubmit={onSubmit}
    >
      {props.createRequest && (
        <Message
          visible
          size="small"
          content='Requests created here will automatically be put the "Ready for Pickup" status.'
        />
      )}
      <Form.Group>
        <Form.Input label="User" required>
          <Dropdown
            type="text"
            name="userId"
            onChange={handleInputChangeDropdown}
            selection
            search
            loading={loading}
            required
            options={userOptions}
            disabled={
              ![SUBMITTED, APPROVED, READY_FOR_PICKUP].includes(props.preloadRequest.status)
            }
            placeholder="John Doe"
            value={requestData.userId}
          />
        </Form.Input>
        <Form.Field width={6}>
          <label>Request Status</label>
          <p>{requestData.status}</p>
        </Form.Field>
      </Form.Group>
      <h3>Item</h3>
      <Form.Group>
        <Form.Input label="Item" required>
          <Dropdown
            type="text"
            name="itemId"
            onChange={handleInputChangeDropdown}
            selection
            search
            loading={loading}
            required
            options={itemOptions}
            disabled={!props.createRequest}
            placeholder="Big rubber duck"
            value={requestData.itemId}
          />
        </Form.Input>
        <Form.Field width={6}>
          <label>Quantity allowed per request</label>
          <p>{selectedItem?.maxRequestQty}</p>
        </Form.Field>
      </Form.Group>
      <Form.Input
        label="Quantity"
        type="number"
        name="quantity"
        value={requestData.quantity}
        required
        placeholder="5"
        width={4}
      >
        <input type="number" min={1} />
      </Form.Input>
      {selectedItem?.maxRequestQty && requestData.quantity > selectedItem?.maxRequestQty && (
        <Message
          warning
          visible
          size="small"
          content="This quantity exceeds the max quantity allowed per request."
        />
      )}
      {selectedItem?.qtyAvailableForApproval &&
        requestData.quantity > selectedItem?.qtyAvailableForApproval && (
          <Message
            warning
            visible
            size="small"
            content="This quantity exceeds the number of items available for approval."
          />
        )}
      <h3>Calculated Quantities</h3>
      <Form.Group>
        <Form.Field width={4}>
          <Popup
            inverted
            trigger={<label>Unreserved</label>}
            content="The number of an item that is not reserved"
          />
          <p>{selectedItem?.qtyUnreserved}</p>
        </Form.Field>
        <Form.Field width={4}>
          <Popup
            inverted
            trigger={<label>In stock</label>}
            content="The number of an item that should be physically at the hardware desk"
          />
          <p>{selectedItem?.qtyInStock}</p>
        </Form.Field>
        <Form.Field width={4}>
          <Popup
            inverted
            trigger={<label>Available for approval</label>}
            content="The number of an item that is available to be allocated to requests waiting to be approved"
          />
          <p>{selectedItem?.qtyAvailableForApproval}</p>
        </Form.Field>
      </Form.Group>
      <Button primary type="submit">
        {props.createRequest ? "Create request" : "Edit request"}
      </Button>
    </Form>
  );
};

export default withToastManager(RequestEditForm);
