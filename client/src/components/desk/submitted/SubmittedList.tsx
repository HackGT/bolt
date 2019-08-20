import React, {Component} from "react";
import {connect} from "react-redux";
import CardList from "../CardList";
import SubmittedCard from "./SubmittedCard";
import {Query} from "react-apollo";
import gql from "graphql-tag";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

class SubmittedList extends Component {
    public render() {
        return (
            <Query query={gql`
                query {
                  requests(search:{status: SUBMITTED}) {
                    request_id
                    user {
                        name
                    }
                    item {
                        item_name
                        qtyUnreserved
                        qtyInStock
                    }
                    status
                    quantity
                    createdAt
                  }
              }
            `}>
                {
                    ({loading, error, data}: any) => {
                        if (loading) {
                            return <p>Loading...</p>;
                        }

                        if (error) {
                            return <p>Error!</p>;
                        }

                        return <CardList title="Submitted" length={data.requests.length}>
                            {data.requests.map((request: any) => <SubmittedCard request={request}/>)}
                        </CardList>;
                    }
                }
            </Query>
        );
    }
}

export default connect(
    mapStateToProps
)(SubmittedList);
