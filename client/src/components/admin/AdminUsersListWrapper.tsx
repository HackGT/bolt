import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../state/Store";
import {Header, Loader, Message} from "semantic-ui-react";
import {Query} from "@apollo/client/react/components";
import AdminUsersListTable from "./AdminUsersListTable";
import {FullUser} from "../../types/User";
import {ALL_USERS} from "../util/graphql/Queries";


class AdminUsersListWrapper extends Component {
    public render() {

        return <div>
            <Header as="h1">Users</Header>
            <Query
                query={ALL_USERS}
                fetchPolicy="cache-and-network"
            >
                {
                    ({loading, error, data}: any) => {
                        if (loading) {
                            return <Loader active inline="centered" content="Just a sec!"/>;
                        }
                        if (error) {
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
