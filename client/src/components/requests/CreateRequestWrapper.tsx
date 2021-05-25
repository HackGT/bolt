import React from "react";
import { Header } from "semantic-ui-react";

import { READY_FOR_PICKUP } from "../../types/Hardware";
import RequestEditForm from "./RequestEditForm";

const CreateRequestWrapper: React.FC = () => (
  <div>
    <Header as="h1">Create Request</Header>
    <RequestEditForm
      preloadRequest={{
        userId: undefined,
        itemId: undefined,
        quantity: 1,
        status: READY_FOR_PICKUP,
      }}
      createRequest
    />
  </div>
);

export default CreateRequestWrapper;
