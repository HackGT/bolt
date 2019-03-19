import React from "react";
import {Alignment, Button, Navbar} from "@blueprintjs/core";

export class Navigation extends React.Component {
    render() {
        return (<Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>HackGT Hardware Checkout</Navbar.Heading>
                <Navbar.Divider/>
                <Button className="bp3-minimal" icon="home" text="Inventory"/>

            </Navbar.Group>
        </Navbar>)
    }
}
