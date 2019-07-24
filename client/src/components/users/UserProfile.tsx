import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";

class UserProfile extends Component {
    public render() {
        return (
            <div>
                Hello World!
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
)(UserProfile);
