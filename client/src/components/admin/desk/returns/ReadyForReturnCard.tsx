import React, { useState } from "react";
import { Button, Card, Header, Icon, Label, Popup } from "semantic-ui-react";
import TimeAgo from "react-timeago";
import { useMutation } from "@apollo/client";

import { Request, UserAndRequests } from "../../../../types/Request";
import ItemAndQuantity from "../ItemAndQuantity";
import { DAMAGED, FULFILLED, LOST, READY_FOR_PICKUP } from "../../../../types/Hardware";
import { UPDATE_REQUEST } from "../../../../graphql/Mutations";
import { updateRequestStatus } from "../DeskUtil";
import PhotoIdReturn from "./PhotoIdReturn";

interface ReadyForReturnCardProps {
  card: UserAndRequests;
}

function returnRequiredFulfilledRequests(requests: Request[]): Request[] {
  return requests.filter(request => request.item.returnRequired && request.status === FULFILLED);
}

function numReturnRequired(requests: Request[]): number {
  return returnRequiredFulfilledRequests(requests).length;
}

function WarningLabel({ text }: { text: string }) {
  return (
    <Label>
      <span className="hw-negative">
        <Icon name="exclamation triangle" />
        {text}
      </span>
    </Label>
  );
}

function ControlledPopup(props: any) {
  const [isOpen, setOpen] = useState(false);

  return (
    <Popup
      position="bottom right"
      on="click"
      open={isOpen}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      trigger={props.children}
      content={
        <PhotoIdReturn
          userName={props.user.name}
          loading={props.loading}
          error={props.error}
          updateRequest={props.updateRequest}
          returnRequired={props.returnRequired}
          haveID={props.user.haveID}
          requests={props.requests}
          numReturnRequired={props.numReturnRequired}
          setOpen={setOpen}
        />
      }
    />
  );
}

function ReadyForReturnCard({ card }: ReadyForReturnCardProps) {
  const [updateRequest, { loading, error }] = useMutation(UPDATE_REQUEST);

  card.requests.sort(
    (a: Request, b: Request) =>
      // @ts-ignore
      a.item.returnRequired - b.item.returnRequired || a.id - b.id
  );
  const requiredRequests = returnRequiredFulfilledRequests(card.requests);
  return (
    <Card className="hw-card">
      <Card.Content>
        <Header size="medium">{card.user.name}</Header>
      </Card.Content>
      {card.requests.map(request => (
        <Card.Content key={request.id} description>
          <strong>
            <ItemAndQuantity quantity={request.quantity} itemName={request.item.name} />
          </strong>
          &nbsp;
          <span style={{ color: "gray" }}>#{request.id}</span>
          <div style={{ display: "inline", float: "right" }}>
            {request.status === LOST && <WarningLabel text="LOST" />}
            {request.status === DAMAGED && <WarningLabel text="DAMAGED" />}
            {request.status === FULFILLED && !request.item.returnRequired && (
              <Popup
                inverted
                position="top center"
                trigger={
                  <Label>
                    <span className="hw-positive">Optional</span>
                  </Label>
                }
                content={`${card.user.name} is not required to return this item`}
              />
            )}
            &nbsp;
            <ControlledPopup
              loading={loading}
              user={card.user}
              error={error}
              updateRequest={updateRequest}
              returnRequired={request.item.returnRequired}
              numReturnRequired={numReturnRequired(card.requests)}
              requests={[request]}
            >
              <Button icon basic loading={loading} size="tiny">
                <Icon name="gavel" />
              </Button>
            </ControlledPopup>
          </div>
          <Card.Content>
            <Icon name="map marker alternate" />
            {request.item.location.id}
          </Card.Content>
        </Card.Content>
      ))}

      <Card.Content>
        <Icon name="clock outline" /> <TimeAgo date={card.requests[0].updatedAt} />
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
                      updateRequestStatus(updateRequest, request.id, READY_FOR_PICKUP)
                    )
                  }
                >
                  <Icon className="hw-negative" name="arrow left" />
                </Button>
              }
              content="Return all to Ready for Pickup"
            />
            <ControlledPopup
              loading={loading}
              user={card.user}
              error={error}
              updateRequest={updateRequest}
              requests={requiredRequests}
              returnRequired={numReturnRequired(requiredRequests) >= 1}
              numReturnRequired={numReturnRequired(requiredRequests)}
            >
              {numReturnRequired(requiredRequests) >= 1 && (
                <Button icon loading={loading} labelPosition="right" color="green">
                  <Icon name="checkmark" />
                  All required
                </Button>
              )}
            </ControlledPopup>
          </Button.Group>
        </div>
      </Card.Content>
    </Card>
  );
}

export default ReadyForReturnCard;
