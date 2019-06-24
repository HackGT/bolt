import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import ItemEditForm from "./ItemEditForm";
import {match} from "react-router";

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
                <h1>Create item</h1>
                <ItemEditForm createItem={true}/>
            </div>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(
    mapStateToProps
)(CreateItemWrapper);
