import React, {Component} from 'react';
import {match, Route} from "react-router";
import ItemEdit from "./ItemEdit";

class ItemWrapper extends Component<{ match: match }> {
    render() {
        return (
            <div>
                <Route path={`${this.props.match.url}/:itemId`} component={ItemEdit}/>
            </div>
        );
    }
}

export default ItemWrapper;