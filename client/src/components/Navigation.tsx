import React from "react";
import {Menu} from 'semantic-ui-react'

export class Navigation extends React.Component {
    render() {

        return (
            <Menu>
                <Menu.Item header>HackGT Hardware Checkout</Menu.Item>
                <Menu.Item
                    name='inventory'
                    icon="home"
                />
            </Menu>
        )
    }
}
