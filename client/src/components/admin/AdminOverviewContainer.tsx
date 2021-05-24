import React, { useState } from "react";
import { connect } from "react-redux";
import { Grid, Header } from "semantic-ui-react";
import { randomItemString } from "stuff-with-good-eyesight";

import { AppState } from "../../state/Store";
import AdminLinksCard from "./AdminLinksCard";

export type AdminCardLink = {
  name: string;
  to: string;
  external: boolean;
};

function adminCardLink(name: string, to = "#", external = false): AdminCardLink {
  return { name, to, external };
}
const hardwareDesk: AdminCardLink[] = [adminCardLink("Work hardware desk", "/admin/desk")];

const manage: AdminCardLink[] = [
  adminCardLink("Users", "/admin/users"),
  adminCardLink("Request settings", "/admin/settings"),
];

const reports: AdminCardLink[] = [
  adminCardLink("Detailed item statistics", "/admin/reports/statistics"),
  adminCardLink("Item demand", "/admin/reports/demand"),
];

const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

const utilities: AdminCardLink[] = [
  adminCardLink("Import items", "/admin/csv"),
  adminCardLink("GraphiQL", `${baseUrl}/api/graphiql`, true),
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
  "Thank you for calling the Ellie Morton Water Bottle Company, how may I help you?",
  "Did you know: Bolt is held together with 1,482 bolts",
  "A developer somewhere spent multiple minutes adding these random phrases",
  "Did you know: a robot personally prepares this page for you each time you view it",
  "Releasing a new version of Bolt just to update these messages would be a real power move",
  `"${randomItemString()}" -James Lu`,
];

export function pickRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function AdminOverviewContainer() {
  const randomPhrase = useState(pickRandomElement(funPhrases));
  return (
    <Grid stackable columns={1}>
      <Grid.Row>
        <Grid.Column>
          <Header as="h1">
            Administration
            <Header.Subheader>{randomPhrase}</Header.Subheader>
          </Header>
          <div className="ui centered cards">
            <AdminLinksCard title="Hardware Desk" links={hardwareDesk} />
            <AdminLinksCard title="Manage..." links={manage} />
            <AdminLinksCard title="Reports" links={reports} notice="NEW" />
            <AdminLinksCard title="Utilities" links={utilities} />
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(AdminOverviewContainer);
