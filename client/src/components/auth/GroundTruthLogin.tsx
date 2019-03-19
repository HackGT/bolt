import React, {Component} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {AppToaster} from "../../util/AppToaster";

class GroundTruthLogin extends Component {
    handleClick() {
        AppToaster.show({
            message: "I'm sorry, Dave.  I'm afraid I can't do that.",
            intent: "danger"
        });
    }
    render() {
        return (
            <div>
                <Button onClick={this.handleClick}
                >Sign in with HackGT</Button>
            </div>
        );
    }
}

export default GroundTruthLogin;