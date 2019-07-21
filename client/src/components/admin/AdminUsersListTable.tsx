import React, {Component, ReactNode} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {Button, Icon, Table, TableHeaderCell} from "semantic-ui-react";
import {User} from "../../actions";
import {Mutation} from "react-apollo";
import gql from "graphql-tag";
import {Simulate} from "react-dom/test-utils";
import {usersQuery} from "./AdminUsersListWrapper";
import {compose} from "redux";
import {withToastManager} from "react-toast-notifications";

export interface FullUser extends User {
    email: string;
    phone: string;
    slackUsername: string;
    haveID: boolean;
    admin: boolean;
}

type UsersListProps = {
    users: FullUser[];
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
                <Table.Cell>{this.adminButton(user.uuid, user.admin, changeAdmin)}</Table.Cell>
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

    private adminButton = (uuid: string, admin: boolean, changeAdmin: any, loading: boolean = true) => {
        if (this.props.user && uuid === this.props.user.uuid) {
            return "";
        }

        // flip admin value so we promote/demote this user
        admin = !admin;

        return <Button size="small" basic primary icon loading={this.state.loadingUsers[uuid] || false} labelPosition="left" onClick={e => {
            e.preventDefault();

            const updatedLoadingUsers = this.state.loadingUsers;
            updatedLoadingUsers[uuid] = true;

            this.setState({
                loadingUsers: updatedLoadingUsers
            });

            changeAdmin({
                variables: {uuid, admin}
            }).then(() => {
                let userIndex = 0;
                const oldUsers = this.state.users;
                for (let i = 0; i < oldUsers.length; i++) {
                    if (oldUsers[i].uuid === uuid) {
                        userIndex = i;
                        break;
                    }
                }
                const currentUser = oldUsers[userIndex];
                currentUser.admin = admin;
                oldUsers[userIndex] = currentUser;
                const newLoadingUsers = this.state.loadingUsers;
                newLoadingUsers[uuid] = false;

                this.setState({
                    users: oldUsers,
                    loadingUsers: newLoadingUsers
                });
                loading = false;
            }).catch((er: any) => console.error(er));
        }
        }>
            <Icon name={ admin ? "arrow up" : "arrow down"} />
            { admin ? "Make admin" : "Remove admin"}
        </Button>;
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps)(AdminUsersListTable);
