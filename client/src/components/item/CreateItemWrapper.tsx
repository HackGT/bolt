import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../state/Store";
import ItemEditForm from "./ItemEditForm";
import {match} from "react-router";
import {Header} from "semantic-ui-react";

interface CreateItemProps {
    match: match & CreateItemParams;
}

interface CreateItemParams {
    params: { itemId: string };
}

interface CreateItemState {
}

class CreateItemWrapper extends Component<CreateItemProps, CreateItemState> {
    constructor(props: CreateItemProps) {
        super(props);
        this.state = {};

    }

    public render() {
        return (
            <div>
                <Header as="h1">Create item</Header>
                <ItemEditForm createItem={true}/>
            </div>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(
    mapStateToProps
)(CreateItemWrapper);
