import React, {Component} from "react";
import {connect} from "react-redux";
import CardList from "../CardList";
import SubmittedCard from "./SubmittedCard";
import {Request} from "../../../types/Request";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

interface SubmittedListProps {
    loading: boolean;
    requests: Request[];
    subscribeToUpdatedRequests: any
}

class SubmittedList extends Component<SubmittedListProps> {
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

        return <CardList loading={false} title="Submitted" length={this.props.requests.length}>
            {console.log("rendered")}
            {this.props.requests.map((request: any) => {
                console.log(request.request_id);
                return <SubmittedCard key={request.request_id} request={request}/>;
            })}
        </CardList>;
    }
}

export default connect(
    mapStateToProps
)(SubmittedList);
