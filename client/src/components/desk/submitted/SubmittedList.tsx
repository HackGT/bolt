import React, {Component} from "react";
import {connect} from "react-redux";
import CardList from "../CardList";
import SubmittedCard from "./SubmittedCard";
import {Query} from "react-apollo";
import {SUBMITTED_REQUESTS} from "../../util/graphql/Queries";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

class SubmittedList extends Component {
    public render() {

        return (
            <Query query={SUBMITTED_REQUESTS}>
                {
                    ({loading, error, data}: any) => {
                        if (loading) {
                            return <CardList loading={true} title="Submitted" length={0}/>;
                        }

                        if (error) {
                            return <p>Error!</p>;
                        }

                        return <CardList loading={loading} title="Submitted" length={data.requests.length}>
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
