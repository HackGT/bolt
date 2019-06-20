import React, {Component} from "react";
import {match, Switch} from "react-router";
import ItemEditForm from "./ItemEditForm";
import CreateItemWrapper from "./CreateItemWrapper";
import PrivateRoute from "../util/PrivateRoute";

class ItemWrapper extends Component<{ match: match }> {
    public render() {
        return (
            <div>
                <Switch>
                    <PrivateRoute exact path={`${this.props.match.url}/new`} component={CreateItemWrapper}/>
                    <PrivateRoute exact path={`${this.props.match.url}/:itemId`} component={ItemEditForm}/>
                </Switch>
            </div>
        );
    }
}

export default ItemWrapper;
