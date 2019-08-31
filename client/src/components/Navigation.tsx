import React from "react";
import {Icon, Menu, Popup} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {User} from "../types/User";
import {AppState} from "../state/Store";

export interface OwnProps {}

interface StateProps {
    user: User|null;
}

type Props = StateProps & OwnProps;

class Navigation extends React.Component<Props, {}> {
    public render() {
        const { user } = this.props;

        const homeLink = (<Link to="/">
            <Menu.Item name="inventory">
                <Icon name="home"/>Inventory
            </Menu.Item>
        </Link>);

        const loginLink = !user && <Menu.Item href="/auth/login">Sign in</Menu.Item>;

        const userProfile = user &&
            <Popup inverted={true}
                   trigger={<Menu.Item as={Link} to="/user/me"><Icon name="user"/> {user.name}</Menu.Item>}
                   content="Edit your profile"/>;

        const adminLink = this.isAdmin() &&
            <Menu.Item as={Link} to="/admin">
                <Icon name="setting"/>Admin
            </Menu.Item>;

        const logoutLink = user && <Menu.Item href="/auth/logout">Sign out</Menu.Item>;

        return (
            <Menu stackable>
                <Menu.Item header>HackGT Hardware</Menu.Item>
                {homeLink}
                {adminLink}
                {loginLink}
                <Menu.Menu position="right">
                    {userProfile}
                    {logoutLink}
                </Menu.Menu>
            </Menu>

        );
    }

    private isAdmin = () => {
        const {user} = this.props;
        return user && user.admin;
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(mapStateToProps) (Navigation);
