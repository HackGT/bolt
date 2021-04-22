import React from "react";
import { Button, Card, Header, Icon, Popup } from "semantic-ui-react";
import TimeAgo from "react-timeago";
import { useMutation } from "@apollo/client";

import { Request, UserAndRequests } from "../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import { APPROVED } from "../../../types/Hardware";
import { UPDATE_REQUEST } from "../../util/graphql/Mutations";
import { updateRequestStatus } from "../DeskUtil";
import PhotoIdCheck from "./PhotoIdCheck";

interface ReadyForPickupCardProps {
  card: UserAndRequests;
}

function returnRequired(requests: Request[]): boolean {
  return requests.some(request => request.item.returnRequired);
}

function ReadyForPickupCard({ card }: ReadyForPickupCardProps) {
  const [updateRequest, { loading, error }] = useMutation(UPDATE_REQUEST);

  // @ts-ignore
  card.requests.sort((a: Request, b: Request) => new Date(a.updatedAt) - new Date(b.updatedAt));

  return (
    <Card className="hw-card">
      <Card.Content>
        <Header size="medium">{card.user.name}</Header>
      </Card.Content>
      {!card.user.haveID && returnRequired(card.requests) ? (
        <Card.Content className="highlight">
          <Icon name="id badge" /> Photo ID required
        </Card.Content>
      ) : (
        ""
      )}
      {card.requests.map(request => (
        <Card.Content key={request.id}>
          <strong>
            <ItemAndQuantity quantity={request.quantity} itemName={request.item.name} />
          </strong>
          &nbsp;
          <span style={{ color: "gray" }}>#{request.id}</span>
          <div style={{ display: "inline", float: "right" }}>
            <Popup
              inverted
              position="top center"
              trigger={
                <Button
                  icon
                  basic
                  loading={loading}
                  size="tiny"
                  onClick={event => updateRequestStatus(updateRequest, request.id, APPROVED)}
                >
                  <Icon className="hw-negative" name="arrow left" />
                </Button>
              }
              content="Return to Preparing"
            />
            <Popup
              position="bottom right"
              on="click"
              trigger={
                <Button icon basic loading={loading} size="tiny">
                  <Icon className="hw-positive" name="checkmark" />
                </Button>
              }
              content={
                <PhotoIdCheck
                  userName={card.user.name}
                  loading={loading}
                  error={error}
                  updateRequest={updateRequest}
                  returnRequired={returnRequired([request])}
                  haveID={card.user.haveID}
                  requests={[request]}
                />
              }
            />
          </div>
        </Card.Content>
      ))}

      <Card.Content>
        <Icon name="clock outline" /> <TimeAgo date={card.requests[0].updatedAt} />
      </Card.Content>
      <Card.Content>
        <Icon name="slack hash" />
        {card.user.slackUsername}
      </Card.Content>
      {error ? (
        <Card.Content className="hw-negative">
          <Icon name="warning sign" />
          Unable to change request status: {error.message}
        </Card.Content>
      ) : (
        ""
      )}
      <Card.Content extra>
        <div className="ui two buttons right aligned">
          <Button.Group floated="right">
            <Popup
              inverted
              trigger={
                <Button
                  icon
                  loading={loading}
                  onClick={event =>
                    card.requests.forEach(request =>
                      updateRequestStatus(updateRequest, request.id, APPROVED)
                    )
                  }
                >
                  <Icon className="hw-negative" name="arrow left" />
                </Button>
              }
              content="Return all to Ready to Prepare"
            />
            <Popup
              on="click"
              position="bottom center"
              trigger={
                <Button icon loading={loading} labelPosition="right" color="green">
                  <Icon name="checkmark" />
                  Fulfilled
                </Button>
              }
              content={
                <PhotoIdCheck
                  userName={card.user.name}
                  loading={loading}
                  error={error}
                  updateRequest={updateRequest}
                  returnRequired={returnRequired(card.requests)}
                  haveID={card.user.haveID}
                  requests={card.requests}
                />
              }
            />
          </Button.Group>
        </div>
      </Card.Content>
    </Card>
  );
}

export default ReadyForPickupCard;
