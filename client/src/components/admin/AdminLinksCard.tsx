import React from "react";
import {connect} from "react-redux";
import {Card, List} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {AppState} from "../../state/Store";
import {AdminCardLink} from "./AdminOverviewContainer";

export interface OwnProps {
    title: string;
    links: AdminCardLink[];
}

interface StateProps {
}

type Props = StateProps & OwnProps;

interface State {

}

function AdminLinksCard(props: Props) {
    const content = (
        <List>
            {props.links.map(value => (
                <List.Item key={value.name}>
                    <a href={value.to}>{value.name}</a>
                </List.Item>))}
        </List>);
    return (
        <Card header={props.title} description={content}/>
    );
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(
    mapStateToProps
)(AdminLinksCard);
