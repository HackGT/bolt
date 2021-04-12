import React, {Component} from "react";
import {match} from "react-router";
import {Query} from "@apollo/client/react/components";
import ItemEditForm from "./ItemEditForm";
import {Header, Loader, Message} from "semantic-ui-react";
import {ITEM_EDIT_GET_ITEM} from "../util/graphql/Queries";

interface EditItemProps {
    match: match & EditItemParams;
}

interface EditItemParams {
    params: { itemId: string };
}

interface EditItemState {
    item_name: string;
}

class EditItemWrapper extends Component<EditItemProps, EditItemState> {
    constructor(props: EditItemProps) {
        super(props);
        this.state = {
            item_name: ""
        };
    }


    public render() {
        const itemId: number = parseInt(this.props.match.params.itemId, 10);
        return (
            <div>
                <Header as="h1">Edit Item</Header>
                <Query
                    query={ITEM_EDIT_GET_ITEM}
                    variables={
                        {itemId}
                    }
                    fetchPolicy="no-cache"
                >
                    {
                        ({loading, error, data}: any) => {
                            if (loading) {
                                return <Loader active inline="centered" content="Just a sec!"/>;
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
