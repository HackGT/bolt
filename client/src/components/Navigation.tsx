import React from "react";
import {Icon, Menu} from 'semantic-ui-react'
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../reducers/reducers";
import {User} from "../actions/actions";

export interface OwnProps {}

interface StateProps {
    a: number
    user: User|null
}

type Props = StateProps & OwnProps;

class Navigation extends React.Component<Props, {}> {
    render() {
        const loginLink = (!this.props.user) ? (<Menu.Item><a href="/auth/login">Sign in</a></Menu.Item>) : '';

        const userProfile = (this.props.user) ? (
            <Menu.Item><Icon name="user"/> {this.props.user.name}</Menu.Item>
        ) : ('');

        const logoutLink = (this.props.user) ? (
            <Menu.Item><a href="/auth/logout">Sign out</a></Menu.Item>
        ) : ('');

        const importLink = this.props.user && this.props.user.isAdmin ? (<Menu.Item name="admin">
            <Icon name="file"/><Link to="/admin/csv">Import</Link>
        </Menu.Item>) : '';

        return (
            <Menu stackable>
                <Menu.Item header>HackGT Hardware</Menu.Item>
                <Menu.Item name="inventory">
                    <Icon name="home"/><Link to="/">Inventory</Link>
                </Menu.Item>
                {importLink}
                {loginLink}
                {userProfile}
                {logoutLink}
            </Menu>

        )
    }
}

function mapStateToProps(state: AppState) {
    console.log("State is", state);
    return {
        a: state.a,
        user: state.user
    }
}

export default connect(mapStateToProps) (Navigation)
