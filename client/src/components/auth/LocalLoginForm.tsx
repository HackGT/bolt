import React, {Component} from 'react';
import {Button, FormGroup, InputGroup, Intent, Toast, Toaster} from "@blueprintjs/core";
import {AppToaster} from "../../util/AppToaster";

class LocalLoginForm extends Component {
    handleSubmit() {
        AppToaster.show({ message: "How much would could a wood chuck chuck if a wood chuck could chuck wood?", intent: "warning"});
    }

    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup type="email" placeholder={'Email'}/>
                </FormGroup>
                <FormGroup>
                    <InputGroup type="password" placeholder={'Password'}/>
                </FormGroup>
                <Button intent={Intent.PRIMARY} onClick={this.handleSubmit}>Continue</Button>
            </div>
        );
    }
}

export default LocalLoginForm;