import React from "react";
import {connect} from "react-redux";
import {Card, Header, Label, List} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {AppState} from "../../state/Store";
import {AdminCardLink} from "./AdminOverviewContainer";

export interface OwnProps {
    title: string;
    links: AdminCardLink[];
    notice?: string;
}

interface StateProps {
}

type Props = StateProps & OwnProps;

function AdminLinksCard(props: Props) {
    const content = (
        <List>
            {props.links.map(value => (
                <List.Item key={value.name}>
                    {value.external ? <a href={value.to}>{value.name}</a>
                        : <Link to={value.to}>{value.name}</Link>}
                </List.Item>))}
        </List>);
    return (
        <Card>
            <Card.Content>
                <Header>{props.title} {props.notice ? <Label color={"blue"}>{props.notice}</Label> : ""}</Header>
                {content}
            </Card.Content>
        </Card>
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
