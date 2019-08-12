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

class SubmittedList extends Component {
    public render() {
        return (
            <CardList title="Submitted">
                <SubmittedCard/>
                <SubmittedCard/>
                <SubmittedCard/>
            </CardList>
        );
    }
}

export default connect(
    mapStateToProps
)(SubmittedList);
