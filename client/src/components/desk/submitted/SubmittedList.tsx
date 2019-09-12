import React, {Component} from "react";
import {connect} from "react-redux";
import CardList from "../CardList";
import SubmittedCard from "./SubmittedCard";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

class SubmittedList extends Component<{ data: any, subscribeToUpdatedRequests: any }> {
    componentDidMount(): void {
        this.props.subscribeToUpdatedRequests();
    }

    render() {

        // if (loading) {
        //     return <CardList loading={true} title="Submitted" length={0}/>;
        //
        // }
        //
        // if (error) {
        //     return <p>Error!</p>;
        // }

        return <CardList loading={false} title="Submitted" length={this.props.data.requests.length}>
            {console.log("rendered")}
            {this.props.data.requests.map((request: any) => <SubmittedCard key={request.request_id}
                                                                           request={request}/>)}
        </CardList>;
    }
}

export default connect(
    mapStateToProps
)(SubmittedList);
