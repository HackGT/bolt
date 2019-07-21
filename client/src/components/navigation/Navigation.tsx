import React from "react";
import {Icon, Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {User} from "../../actions";

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

        const loginLink = !user ? (<Menu.Item href="/auth/login">Sign in</Menu.Item>) : null;

        const userProfile = (user) ? (
            <Menu.Item><Icon name="user"/> {user.name}</Menu.Item>
        ) : ("");

        const adminLink = this.isAdmin() ? (
            <Menu.Item as={Link} to="/admin">
                <Icon name="setting"/>Admin
            </Menu.Item>) : null;

        const logoutLink = (user) ? (<Menu.Item href="/auth/logout">Sign out</Menu.Item>) : null;


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
        user: state.user
    };
}

export default connect(mapStateToProps) (Navigation);
