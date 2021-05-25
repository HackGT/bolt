import { useQuery } from "@apollo/client";
import React from "react";
import { useParams } from "react-router";
import { Header, Message } from "semantic-ui-react";

import { GET_REQUEST } from "../../graphql/Queries";
import RequestEditForm from "./RequestEditForm";

interface ParamTypes {
  requestId: string;
}

const EditRequestWrapper: React.FC = () => {
  const { requestId } = useParams<ParamTypes>();

  const { data, loading, error } = useQuery(GET_REQUEST, {
    variables: {
      requestId: parseInt(requestId),
    },
  });

  if (loading) {
    return null;
  }

  if (error) {
    return <Message error visible header="Can't fetch request" content={error.message} />;
  }

  return (
    <div>
      <Header as="h1">Edit Request</Header>
      <RequestEditForm
        preloadRequestId={data.request.id}
        preloadRequest={{
          userId: data.request.user.uuid,
          itemId: data.request.item.id,
          quantity: data.request.quantity,
          status: data.request.status,
        }}
      />
    </div>
  );
};

export default EditRequestWrapper;
