import React, { Component } from "react";
import { Container, Header, Segment } from "semantic-ui-react";

import CardList from "../CardList";
import SubmittedCard from "./SubmittedCard";
import { Request } from "../../../types/Request";
import { requestSearch } from "../DeskUtil";

interface SubmittedListProps {
  loading: boolean;
  requests: Request[];
  subscribeToUpdatedRequests: any;
  hidden?: boolean;
}

class SubmittedList extends Component<SubmittedListProps> {
  componentDidMount(): void {
    this.props.subscribeToUpdatedRequests();
  }

  render() {
    if (this.props.hidden) {
      // This is used to hide the submitted list but still call subscribeToUpdatedRequests
      return "";
    }

    const empty = (
      <Segment placeholder>
        <Container textAlign="center">
          <Header>Nothing to approve. Take a break!</Header>
        </Container>
      </Segment>
    );

    return (
      <CardList
        title="Submitted"
        length={this.props.requests.length}
        filter={requestSearch}
        cards={this.props.requests}
        render={(request: any) => <SubmittedCard key={request.request_id} request={request} />}
        empty={empty}
      />
    );
  }
}

export default SubmittedList;
