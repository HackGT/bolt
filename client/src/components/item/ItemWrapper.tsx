import React, {Component} from "react";
import {match, Route, Switch} from "react-router";
import ItemEditForm from "./ItemEditForm";
import CreateItemWrapper from "./CreateItemWrapper";

class ItemWrapper extends Component<{ match: match }> {
    public render() {
        return (
            <div>
                <Switch>
                    <Route exact path={`${this.props.match.url}/new`} component={CreateItemWrapper}/>
                    <Route exact path={`${this.props.match.url}/:itemId`} component={ItemEditForm}/>
                </Switch>
            </div>
        );
    }
}

export default ItemWrapper;
