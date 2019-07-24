import React, {Component, ReactNode} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {Button, Icon, Table, TableHeaderCell} from "semantic-ui-react";
import {User} from "../../actions";
import {Mutation} from "react-apollo";
import gql from "graphql-tag";
import {usersQuery} from "./AdminUsersListWrapper";
import {compose} from "redux";
import {withToastManager} from "react-toast-notifications";
import PrivateRoute from "../util/PrivateRoute";
import {Link} from "react-router-dom";

export interface FullUser extends User {
    email: string;
    phone: string;
    slackUsername: string;
    haveID: boolean;
    admin: boolean;
}

type UsersListProps = {
    users: FullUser[];
    toastManager: any;
};

interface StateProps {
    user: User|null;
}

type UsersListState = {
    users: FullUser[];
    loadingUsers: {
        [key: string]: boolean
    };
};

type Props = UsersListProps & StateProps;

class AdminUsersListTable extends Component<Props, UsersListState> {
    private static checkOrX(value: boolean) {
        if (value) {
            return <Icon color="green" name="checkmark" size="large" />;
        }
        
        return <Icon color="red" name="close" size="large" />;
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            users: props.users,
            loadingUsers: {}
        };
    }

    public render = () => {
        const tableColNames: string[] = ["Name", "Email", "Phone", "Slack Username", "Have ID", "Admin", "Actions"];
        const tableCols = tableColNames.map(col => (
            <TableHeaderCell key={col} textAlign="center">{col}</TableHeaderCell>
        ));

        const tableRows = (changeAdmin: any) => this.state.users.map(user => (
            <Table.Row key={user.uuid}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell><a href={`mailto:${user.email}`}>{user.email}</a></Table.Cell>
                <Table.Cell>{user.phone}</Table.Cell>
                <Table.Cell>{user.slackUsername}</Table.Cell>
                <Table.Cell>{AdminUsersListTable.checkOrX(user.haveID)}</Table.Cell>
                <Table.Cell>{AdminUsersListTable.checkOrX(user.admin)}</Table.Cell>
                <Table.Cell>{this.adminButton(user, changeAdmin)} <Button as={Link} primary basic compact size="tiny" to={`/user/${user.uuid}`}>Edit</Button></Table.Cell>
            </Table.Row>
        ));

        const changeUserAdmin = gql`
            mutation changeAdmin($uuid: String!, $admin:Boolean!) {
                changeUserAdmin(uuid: $uuid, admin: $admin)
            }
        `;

        return (
            <Mutation mutation={changeUserAdmin}
                      refetchQueries={[{ query: usersQuery }]}
                      awaitRefetchQueries={true}
            >
                { (changeAdmin: any, { loading, data }: any) => (
                    <Table compact celled textAlign="center">
                        <Table.Header>
                            <Table.Row>
                                {tableCols}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {tableRows(changeAdmin)}
                        </Table.Body>
                    </Table>
                )}
            </Mutation>);
    }

    private getUserIndex(uuid: string) {
        const users = this.state.users;
        for (let i = 0; i < users.length; i++) {
            if (users[i].uuid === uuid) {
                return i;
            }
        }
        return -1;
    }

    private modifyUserAdminInState = (uuid: string, admin: boolean) => {
        const userIndex = this.getUserIndex(uuid);
        const usersCopy = this.state.users;

        const currentUser = usersCopy[userIndex];

        currentUser.admin = admin;

        usersCopy[userIndex] = currentUser;

        this.setState({
            users: usersCopy,
        });
    }

    private modifyLoadingUsers = (uuid: string, loading: boolean) => {
        const updatedLoadingUsers = this.state.loadingUsers;
        updatedLoadingUsers[uuid] = loading;

        this.setState({
            loadingUsers: updatedLoadingUsers
        });
    }

    private adminButton = (user: FullUser, changeAdmin: any, loading: boolean = true) => {
        const { name, uuid, admin } = user;

        if (this.props.user && uuid === this.props.user.uuid) {
            return "";
        }
        // flip admin value so we promote/demote this user
        const newAdminValue = !admin;
        return <Button size="small" basic primary icon compact
                       loading={this.state.loadingUsers[uuid] || false}
                       labelPosition="left"
                       onClick={e => {
                            e.preventDefault();
                            this.modifyLoadingUsers(uuid, true);
                            const {toastManager} = this.props;

                            changeAdmin({
                                variables: {uuid, admin: newAdminValue}
                            }).then(({ data }: any) => {
                                console.log(data.changeUserAdmin);
                                if (data.changeUserAdmin) {
                                    const addOrRemove = newAdminValue ? "now" : "no longer";
                                    toastManager.add(`${name} is ${addOrRemove} an admin`, {
                                        appearance: "success",
                                        autoDismiss: true,
                                        placement: "top-center"
                                    });
                                    this.modifyUserAdminInState(uuid, newAdminValue);
                                } else {
                                    toastManager.add(`The admin status for ${name} was not changed because the server didn't find any users to update or your account no longer has admin permissions.  Refresh the page and try again.`, {
                                        appearance: "warning",
                                        autoDismiss: false,
                                        placement: "top-center"
                                    });
                                }
                                this.modifyLoadingUsers(uuid, false);
                            }).catch((err: any) => {
                                console.error(err);
                                toastManager.add(`Couldn't change admin status for ${name} because of an error: ${err.message}`, {
                                    appearance: "error",
                                    autoDismiss: false,
                                    placement: "top-center"
                                });
                                this.modifyLoadingUsers(uuid, false);
                            });
                        }
        }>
            <Icon name={ newAdminValue ? "arrow up" : "arrow down"} />
            { newAdminValue ? "Make admin" : "Remove admin"}
        </Button>;
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps)(AdminUsersListTable);
