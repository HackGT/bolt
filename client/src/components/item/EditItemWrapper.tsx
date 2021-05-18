import React from "react";
import { match } from "react-router";
import { Query } from "@apollo/client/react/components";
import { Header, Loader, Message } from "semantic-ui-react";

import ItemEditForm from "./ItemEditForm";
import { ITEM_EDIT_GET_ITEM } from "../util/graphql/Queries";

interface EditItemProps {
  match: match & EditItemParams;
}

interface EditItemParams {
  params: { itemId: string };
}

const EditItemWrapper: React.FC<EditItemProps> = props => {
  const itemId: number = parseInt(props.match.params.itemId);

  return (
    <div>
      <Header as="h1">Edit Item</Header>
      <Query query={ITEM_EDIT_GET_ITEM} variables={{ itemId }} fetchPolicy="no-cache">
        {({ loading, error, data }: any) => {
          if (loading) {
            return <Loader active inline="centered" content="Just a sec!" />;
          }
          if (error) {
            return <Message error visible header="Can't fetch item" content={error.message} />;
          }
          return <ItemEditForm preloadItemId={itemId} preloadItem={data.item} />;
        }}
      </Query>
    </div>
  );
};

export default EditItemWrapper;
