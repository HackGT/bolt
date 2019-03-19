import React, {Component} from "react";
import {Button, Divider, H1, H2} from "@blueprintjs/core";
import LocalLoginForm from "./LocalLoginForm";
import GroundTruthLogin from "./GroundTruthLogin";

export class Login extends Component {
    render() {
        return (
            <div style={{
                maxWidth: 300,
                margin: '0 auto',
                width: '50%'
            }}>
                <H2>Sign in to continue</H2>
                <LocalLoginForm />
                <Divider/>
                <GroundTruthLogin />
            </div>
        );
    }
}