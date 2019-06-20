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

        const loginLink = !user ? (<a href="/auth/login"><Menu.Item>Sign in</Menu.Item></a>) : null;

        const userProfile = (user) ? (
            <Menu.Item><Icon name="user"/> {user.name}</Menu.Item>
        ) : ("");

        const adminLink = this.isAdmin() ? (<Link to="/admin">
            <Menu.Item>
                <Icon name="setting"/>Admin
            </Menu.Item>
        </Link>) : null;

        const logoutLink = (user) ? (<a href="/auth/logout">
            <Menu.Item>Sign out</Menu.Item>
        </a>) : null;


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
