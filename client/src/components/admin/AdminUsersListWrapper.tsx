import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../state/Store";
import {Header, Loader, Message} from "semantic-ui-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import AdminUsersListTable from "./AdminUsersListTable";
import {FullUser} from "../../types/User";

export const usersQuery = gql`
    query users {
        users(search: {}) {
            uuid
            name
            email
            phone
            slackUsername
            haveID
            admin
        }
    }
`;

class AdminUsersListWrapper extends Component {
    public render() {

        return <div>
            <Header as="h1">Users</Header>
            <Query
                query={usersQuery}
                fetchPolicy="cache-and-network"
            >
                {
                    ({loading, error, data}: any) => {
                        if (loading) {
                            return <Loader active inline="centered" content="Just a sec!"/>;
                        } else if (error) {
                            return <Message error visible={true}
                                            header="Can't fetch users"
                                            content={`Hmm, an error is preventing us from displaying the list of users.  The error was: ${error.message}`}
                            />;
                        }
                        const {users}: { users: FullUser[] } = data;

                        return <AdminUsersListTable users={users}/>;
                    }
                }
            </Query>
        </div>;
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(
    mapStateToProps
)(AdminUsersListWrapper);
