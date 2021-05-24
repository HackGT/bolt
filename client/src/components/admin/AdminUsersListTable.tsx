import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Icon, Input, Table, TableHeaderCell } from "semantic-ui-react";
import { Mutation } from "@apollo/client/react/components";
import { Link } from "react-router-dom";
import { withToastManager } from "react-toast-notifications";

import { AppState } from "../../state/Store";
import { FullUser, User } from "../../types/User";
import { ALL_USERS } from "../../graphql/Queries";
import { UPDATE_USER } from "../../graphql/Mutations";

type UsersListProps = {
  users: FullUser[];
  toastManager: any;
};

interface StateProps {
  user: User | null;
}

type UsersListState = {
  users: FullUser[];
  loadingUsers: {
    [key: string]: boolean;
  };
  searchQuery: string;
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
      loadingUsers: {},
      searchQuery: "",
    };
  }

  private getUserIndex(uuid: string) {
    return this.state.users.findIndex(user => user.uuid === uuid);
  }

  private modifyUserAdminInState = (uuid: string, admin: boolean) => {
    const userIndex = this.getUserIndex(uuid);
    const { users } = this.state;

    users[userIndex] = {
      ...users[userIndex],
      admin,
    };

    this.setState({
      users,
    });
  };

  private modifyLoadingUsers = (uuid: string, loading: boolean) => {
    this.setState(prevState => {
      const updatedLoadingUsers = prevState.loadingUsers;
      updatedLoadingUsers[uuid] = loading;

      return {
        loadingUsers: updatedLoadingUsers,
      };
    });
  };

  private adminButton = (user: FullUser, changeAdmin: any, loading = true) => {
    const { name, uuid, admin } = user;

    if (this.props.user && uuid === this.props.user.uuid) {
      return "";
    }
    // flip admin value so we promote/demote this user
    const newAdminValue = !admin;
    return (
      <Button
        size="small"
        basic
        primary
        icon
        compact
        loading={this.state.loadingUsers[uuid] || false}
        labelPosition="left"
        onClick={e => {
          e.preventDefault();
          this.modifyLoadingUsers(uuid, true);
          const { toastManager } = this.props;

          changeAdmin({
            variables: { uuid, updatedUser: { admin: newAdminValue } },
          })
            .then(({ data }: any) => {
              if (data.updateUser) {
                const addOrRemove = newAdminValue ? "now" : "no longer";
                toastManager.add(`${name} is ${addOrRemove} an admin`, {
                  appearance: "success",
                  autoDismiss: true,
                  placement: "top-center",
                });
                this.modifyUserAdminInState(uuid, newAdminValue);
              } else {
                toastManager.add(
                  `The admin status for ${name} was not changed because the server didn't find any users to update or your account no longer has admin permissions.  Refresh the page and try again.`,
                  {
                    appearance: "warning",
                    autoDismiss: false,
                    placement: "top-center",
                  }
                );
              }
              this.modifyLoadingUsers(uuid, false);
            })
            .catch((err: any) => {
              toastManager.add(
                `Couldn't change admin status for ${name} because of an error: ${err.message}`,
                {
                  appearance: "error",
                  autoDismiss: false,
                  placement: "top-center",
                }
              );
              this.modifyLoadingUsers(uuid, false);
            });
        }}
      >
        <Icon name={newAdminValue ? "arrow up" : "arrow down"} />
        {newAdminValue ? "Make admin" : "Remove admin"}
      </Button>
    );
  };

  private containsSearchQuery(user: FullUser) {
    const query: string = this.state.searchQuery;
    return (
      user.name.toLowerCase().indexOf(query) !== -1 ||
      user.email.toLowerCase().indexOf(query) !== -1 ||
      user.phone.indexOf(query) !== -1 ||
      user.slackUsername.indexOf(query) !== -1 ||
      user.uuid.indexOf(query) !== -1
    );
  }

  public render = () => {
    const tableColNames = [
      "Name",
      "Email",
      "Phone",
      "Slack Username",
      "Have ID",
      "Admin",
      "Actions",
    ];
    const tableCols = tableColNames.map(col => (
      <TableHeaderCell key={col} textAlign="center">
        {col}
      </TableHeaderCell>
    ));

    let tableRows = (changeAdmin: any) =>
      this.state.users
        .filter(user => this.containsSearchQuery(user))
        .map(user => (
          <Table.Row key={user.uuid}>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </Table.Cell>
            <Table.Cell>{user.phone}</Table.Cell>
            <Table.Cell>{user.slackUsername}</Table.Cell>
            <Table.Cell>{AdminUsersListTable.checkOrX(user.haveID)}</Table.Cell>
            <Table.Cell>{AdminUsersListTable.checkOrX(user.admin)}</Table.Cell>
            <Table.Cell>
              {this.adminButton(user, changeAdmin)}{" "}
              <Button as={Link} primary basic compact size="tiny" to={`/user/${user.uuid}`}>
                Edit
              </Button>
            </Table.Cell>
          </Table.Row>
        ));

    if (!tableRows(null).length) {
      tableRows = (changeAdmin: any) => [
        <Table.Row>
          <Table.Cell colspan={7}>No users found</Table.Cell>
        </Table.Row>,
      ];
    }

    return (
      <Mutation mutation={UPDATE_USER} refetchQueries={[{ query: ALL_USERS }]} awaitRefetchQueries>
        {(changeAdmin: any, { loading, data }: any) => (
          <div>
            <Input
              type="text"
              label="Search users"
              name="searchQuery"
              onChange={(e, { value }) => {
                // @ts-ignore
                this.setState({
                  searchQuery: value.trim().toLowerCase(),
                });
              }}
            />
            <Table compact celled textAlign="center">
              <Table.Header>
                <Table.Row>{tableCols}</Table.Row>
              </Table.Header>
              <Table.Body>{tableRows(changeAdmin)}</Table.Body>
            </Table>
          </div>
        )}
      </Mutation>
    );
  };
}

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

// Using compose here doesn't work.  Note the structure of this: withToastManager( connect()(component) )
export default withToastManager(connect(mapStateToProps)(AdminUsersListTable));
