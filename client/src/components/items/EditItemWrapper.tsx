import React from "react";
import { Query } from "@apollo/client/react/components";
import { Header, Loader, Message } from "semantic-ui-react";
import { useParams } from "react-router-dom";

import ItemEditForm from "./ItemEditForm";
import { ITEM_EDIT_GET_ITEM } from "../../graphql/Queries";

const EditItemWrapper: React.FC = props => {
  const params = useParams();

  return (
    <div>
      <Header as="h1">Edit Item</Header>
      <Query
        query={ITEM_EDIT_GET_ITEM}
        variables={{ itemId: params.itemId }}
        fetchPolicy="no-cache"
      >
        {({ loading, error, data }: any) => {
          if (loading) {
            return <Loader active inline="centered" content="Just a sec!" />;
          }
          if (error) {
            return <Message error visible header="Can't fetch item" content={error.message} />;
          }
          // return <ItemEditForm preloadItemId={params.itemId} preloadItem={data.item} />;
          return <ItemEditForm />;
        }}
      </Query>
    </div>
  );
};

export default EditItemWrapper;
