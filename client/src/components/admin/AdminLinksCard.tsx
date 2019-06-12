import React from "react";
import {connect} from "react-redux";
import {Card, List} from "semantic-ui-react";
import {AppState} from "../../reducers/reducers";
import {Link} from "react-router-dom";

export type AdminCardLink = {
    name: string;
    to: string;
};

export interface OwnProps {
    title: string;
    links: AdminCardLink[];
}

interface StateProps {
}

type Props = StateProps & OwnProps;

interface State {

}

class AdminLinksCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const content = (
            <List>
                {this.props.links.map(value => (
                    <List.Item key={value.name}>
                        <Link to={value.to}>{value.name}</Link>
                    </List.Item>))}
            </List>);
        return (
            <Card header={this.props.title} description={content}/>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(
    mapStateToProps
)(AdminLinksCard);
