import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import AdminLinksCard, {AdminCardLink} from "./AdminLinksCard";
import {Grid, Header} from "semantic-ui-react";

const hardwareDesk: AdminCardLink[] = [
    {
        name: "Work hardware desk",
        to: "#"
    },
    {
        name: "Item check-in",
        to: "/admin/checkin"
    },
    {
        name: "Manage items",
        to: "#"
    },
];

const items: AdminCardLink[] = [
    {
        name: "View all items",
        to: "#"
    },
    {
        name: "Create new item",
        to: "#"
    },
    {
        name: "Import items",
        to: "#"
    },
    {
        name: "Export items",
        to: "#"
    }
];

const reports: AdminCardLink[] = [
    {
        name: "Unreturned items",
        to: "#"
    },
    {
        name: "Popular items",
        to: "#"
    },
    {
        name: "Lost/Damaged items",
        to: "#"
    },
    {
        name: "Request statistics",
        to: "#"
    },
];

class AdminOverviewContainer extends Component {
    public render() {
        return (
            <Grid stackable columns={1}>
                <Grid.Row>
                    <Grid.Column>
                        <Header as="h1">Administration
                            <Header.Subheader>The coolest part of Bolt</Header.Subheader>
                        </Header>
                        <div className="ui centered cards">
                            <AdminLinksCard title="Hardware Desk" links={hardwareDesk}/>
                            <AdminLinksCard title="Items" links={items}/>
                            <AdminLinksCard title="Reports" links={reports}/>
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
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
)(AdminOverviewContainer);
