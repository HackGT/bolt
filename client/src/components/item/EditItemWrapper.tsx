import React, {Component} from "react";
import {match} from "react-router";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {GraphQLQuery} from "../../api/api.service";
import ItemEditForm from "./ItemEditForm";
import {Loader, Message} from "semantic-ui-react";

interface EditItemProps {
    match: match & EditItemParams;
}

interface EditItemParams {
    params: { itemId: string };
}

interface EditItemState {
}

const ITEM_QUERY: GraphQLQuery = gql`
    query getItem($itemId: Int!) {
        item(id: $itemId) {
            item_name
            description
            imageUrl
            category
            totalAvailable
            maxRequestQty
            price
            approvalRequired
            returnRequired
            hidden
            owner
        }
    }`;

class EditItemWrapper extends Component<EditItemProps, EditItemState> {
    constructor(props: EditItemProps) {
        super(props);

    }


    public render() {
        const itemId: number = parseInt(this.props.match.params.itemId, 10);
        console.log(itemId);
        return (
            <Query
                query={ITEM_QUERY}
                variables={
                    {itemId}
                }
                fetchPolicy="no-cache"
            >
                {
                    ({loading, error, data}: any) => {
                        if (loading) {
                            return <Loader active={true} content="Just a sec!"/>;
                        }
                        if (error) {
                            return <Message error visible={true}
                                            header="Can't fetch item"
                                            content={error.message}
                            />;
                        }
                        return <ItemEditForm preloadItemId={itemId} preloadItem={data.item}/>;
                    }
                }
            </Query>
        );
    }
}

export default EditItemWrapper;
