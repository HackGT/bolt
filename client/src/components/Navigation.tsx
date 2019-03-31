import React from "react";
import {Icon, Menu} from 'semantic-ui-react'
import {Link} from "react-router-dom";

export class Navigation extends React.Component {
    render() {

        return (
            <Menu stackable>
                <Menu.Item header>HackGT Hardware</Menu.Item>
                <Menu.Item name="inventory">
                    <Icon name="home"/><Link to="/">Inventory</Link>
                </Menu.Item>
                <Menu.Item name="admin">
                    <Icon name="file"/><Link to="/admin/csv">Import</Link>
                </Menu.Item>
            </Menu>
        )
    }
}
