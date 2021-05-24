/* eslint-disable no-lonely-if */
import React, { useState } from "react";
import { Button, Card, Dropdown, Icon } from "semantic-ui-react";

import { updateRequestStatus } from "../DeskUtil";
import { DAMAGED, LOST, RETURNED } from "../../../../types/Hardware";

function toDropdownOptions(options: string[]) {
  return options.map(option => ({
    text: `${option.charAt(0).toUpperCase()}${option.slice(1).toLowerCase()}`,
    value: option,
  }));
}

function PhotoIdCheck({
  userName,
  loading,
  updateRequest,
  requests,
  returnRequired,
  haveID,
  error,
  setOpen,
  optional,
  numReturnRequired,
}: any) {
  const [returnType, setReturnType] = useState(RETURNED);

  const returnID = {
    title: (
      <>
        <Icon name="id badge" />
        Return photo ID
      </>
    ),
    content: `Did you return ${userName}'s photo ID?`,
    button: (
      <Button.Group>
        <Button
          loading={loading}
          onClick={event => {
            requests.forEach((request: any) =>
              updateRequestStatus(updateRequest, request.id, returnType)
            );
            setOpen(false);
          }}
        >
          Skip
        </Button>
        <Button
          color="green"
          loading={loading}
          onClick={event => {
            requests.forEach((request: any) =>
              updateRequestStatus(updateRequest, request.id, returnType, false)
            );
            setOpen(false);
          }}
        >
          Yes
        </Button>
      </Button.Group>
    ),
    highlightTitle: true,
  };

  const keepIDButton = (
    <Button
      color="green"
      loading={loading}
      onClick={event => {
        requests.forEach((request: any) =>
          updateRequestStatus(updateRequest, request.id, returnType)
        );
        setOpen(false);
      }}
    >
      {returnType === RETURNED ? "Complete return" : `Mark ${returnType.toLowerCase()}`}
    </Button>
  );

  const dropdownOptions = [RETURNED, LOST, DAMAGED];
  const alreadyReturnedID = {
    title: (
      <span className="hw-positive">
        <Icon name="check circle" />
        All set!
      </span>
    ),
    content: `${userName} should already have their photo ID`,
    button: keepIDButton,
    highlightTitle: false,
  };

  const keepID = {
    title: (
      <span className="hw-negative">
        <Icon name="exclamation triangle" />
        Keep photo ID!
      </span>
    ),
    content: `${userName} has at least one other request that requires return, so keep their photo ID`,
    button: keepIDButton,
    highlightTitle: false,
  };

  let card;

  // Top secret machine learning to decide whether to keep or return photo ID or indicate if we already returned it
  if (!returnRequired) {
    // If this item does not require return
    if (!numReturnRequired) {
      // If this user doesn't have any other items requiring return either
      if (haveID) {
        // If we have their ID
        card = returnID; // return it
      } else {
        // We already returned it (or never had it)
        card = alreadyReturnedID;
      }
    } else {
      // If this user has other items that require return
      if (haveID) {
        // and we have their ID
        card = keepID; // keep it
      } else {
        card = alreadyReturnedID; // we don't have it
      }
    }
  } else {
    // this item requires return
    if (
      numReturnRequired === 0 || // Technically this can be condensed, but this case is set aside for clarity.
      // Specifically, if this item requires return, but this request has been marked lost or damaged,
      // then it is possible that even though this item requires return, there are no remaining items that can be returned
      // (an example: if you have 2 optional requests and 2 requests marked lost)
      // If, in this very very specific case, we still have the user's photo ID, we should return it.
      // See also https://github.com/HackGT/bolt/issues/92
      numReturnRequired === 1 ||
      numReturnRequired === requests.length
    ) {
      // if this is the only item to be returned or every item is being returned
      if (haveID) {
        // and we have their ID
        card = returnID; // return it
      } else {
        card = alreadyReturnedID; // we already gave it back
      }
    } else {
      // there are other items that have to be returned
      if (haveID) {
        // and we have their ID
        card = keepID; // keep their ID
      } else {
        card = alreadyReturnedID; // we already returned their ID
      }
    }
  }

  return (
    <Card style={{ maxWidth: 200 }}>
      <Card.Content className={card.highlightTitle ? "highlight" : ""}>
        <strong>{card.title}</strong>
      </Card.Content>
      <Card.Content>{card.content}</Card.Content>
      {returnRequired && (
        <Card.Content>
          New status:{" "}
          <Dropdown
            upward
            floating
            inline
            value={returnType}
            onChange={(event, { value }: any) => setReturnType(value)}
            options={toDropdownOptions(dropdownOptions)}
          />
        </Card.Content>
      )}
      {error && (
        <Card.Content className="hw-negative">
          <Icon name="warning sign" />
          Unable to change request status: {error.message}
        </Card.Content>
      )}
      {card.button}
    </Card>
  );
}

export default PhotoIdCheck;
