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
        const { user } = this.props;

        const homeLink = (<Link to="/">
            <Menu.Item name="inventory">
                <Icon name="home"/>Inventory
            </Menu.Item>
        </Link>);

        const loginLink = !user ? (<a href="/auth/login"><Menu.Item>Sign in</Menu.Item></a>) : null;

        const userProfile = (user) ? (
            <Menu.Item><Icon name="user"/> {user.name}</Menu.Item>
        ) : ('');

        const logoutLink = (user) ? (<a href="/auth/logout">
            <Menu.Item>Sign out</Menu.Item>
        </a>) : null;

        const importLink = user && user.isAdmin ? (<Link to="/admin/csv">
            <Menu.Item>
                <Icon name="file"/>Import
            </Menu.Item>
        </Link>) : null;

        const checkinLink = user && user.isAdmin ? (<Link to="/admin/checkin">
            <Menu.Item>
                <Icon name="clipboard" />
                Checkin
            </Menu.Item>
        </Link>): null;

        return (
            <Menu stackable>
                <Menu.Item header>HackGT Hardware</Menu.Item>
                {homeLink}
                {importLink}
                {checkinLink}
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
