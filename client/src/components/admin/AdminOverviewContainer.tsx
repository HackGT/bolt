import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../state/Store";
import AdminLinksCard from "./AdminLinksCard";
import {Grid, Header} from "semantic-ui-react";

export type AdminCardLink = {
    name: string;
    to: string;
};

function adminCardLink(name: string, to: string = "#"): AdminCardLink {
    return { name, to };
}
const hardwareDesk: AdminCardLink[] = [
    adminCardLink("Work hardware desk", "/admin/desk"),
    adminCardLink("Item check-in", "/admin/checkin")
];

const manage: AdminCardLink[] = [
    adminCardLink("Users", "/admin/users"),
    adminCardLink("Requests"),
    adminCardLink("Items")
];

const reports: AdminCardLink[] = [
    adminCardLink("Unreturned, lost, and damaged items"),
    adminCardLink("Request statistics"),
    adminCardLink("Popular items"),
];

const baseUrl = (process.env.NODE_ENV === "production") ? "" : "http://localhost:3000";

const utilities: AdminCardLink[] = [
    adminCardLink("GraphiQL", `${baseUrl}/api/graphiql`)
];

const funPhrases: string[] = [
    "Congrats, you made it to the big leagues!",
    "The coolest part of Bolt",
    "Links, links, getcha links here!",
    "Hello, friendly administrator",
    "Use your power wisely",
    "Nice to see you",
    "It's a wonderful day to configure Bolt",
    "Millions of hardware items look up to you",
    "We go together like a nut and a bolt",
    "Did you know: Bolt is held together with 1,482 bolts",
    "A developer somewhere spent multiple minutes adding these random phrases"
];

export function pickRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

class AdminOverviewContainer extends Component {
    public render() {
        return (
            <Grid stackable columns={1}>
                <Grid.Row>
                    <Grid.Column>
                        <Header as="h1">Administration
                            <Header.Subheader>{pickRandomElement(funPhrases)}</Header.Subheader>
                        </Header>
                        <div className="ui centered cards">
                            <AdminLinksCard title="Hardware Desk" links={hardwareDesk}/>
                            <AdminLinksCard title="Manage..." links={manage}/>
                            <AdminLinksCard title="Reports" links={reports}/>
                            <AdminLinksCard title="Utilities" links={utilities}/>
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(
    mapStateToProps
)(AdminOverviewContainer);
