import React, {Component} from "react";
import {match} from "react-router";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import ItemEditForm from "./ItemEditForm";
import {Header, Loader, Message} from "semantic-ui-react";

interface EditItemProps {
    match: match & EditItemParams;
}

interface EditItemParams {
    params: { itemId: string };
}

interface EditItemState {
    item_name: string;
}

const ITEM_QUERY = gql`
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
        this.state = {
            item_name: ""
        };
    }


    public render() {
        const itemId: number = parseInt(this.props.match.params.itemId, 10);
        console.log(itemId);
        return (
            <div>
                <Header as="h1">Edit item</Header>
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
                            } else if (error) {
                                return <Message error visible={true}
                                                header="Can't fetch item"
                                                content={error.message}
                                />;
                            }
                            return <ItemEditForm preloadItemId={itemId} preloadItem={data.item}/>;

                        }
                    }
                </Query>
            </div>
        );
    }
}

export default EditItemWrapper;
