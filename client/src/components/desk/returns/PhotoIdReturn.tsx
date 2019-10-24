import React, {useState} from 'react';
import {Button, Card, Dropdown, Icon} from "semantic-ui-react";
import {updateRequestStatus} from "../DeskUtil";
import {DAMAGED, LOST, RETURNED} from "../../../types/Hardware";

function toDropdownOptions(options: string[]) {
    return options.map(option => {
        return {
            text: `${option.charAt(0).toUpperCase()}${option.slice(1).toLowerCase()}`,
            value: option
        };
    });
}

function PhotoIdCheck({userName, loading, updateRequest, requests, returnRequired, haveID, error, setOpen, optional, numReturnRequired}: any) {
    const [returnType, setReturnType] = useState(RETURNED);

    const returnID = {
        title: <><Icon name="id badge"/>Return photo ID</>,
        content: `Did you return ${userName}'s photo ID?`,
        button: (<Button.Group>
            <Button loading={loading} onClick={event => {
                requests.forEach((request: any) =>
                    updateRequestStatus(updateRequest, request.request_id, returnType)
                );
                setOpen(false);
            }
            }>Skip</Button>
            <Button color="green" loading={loading} onClick={event => {
                requests.forEach((request: any) =>
                    updateRequestStatus(updateRequest, request.request_id, returnType, false)
                );
                setOpen(false);
            }
            }>Yes</Button>
        </Button.Group>),
        highlightTitle: true
    };

    const keepIDButton = <Button color="green" loading={loading} onClick={event => {
        requests.forEach((request: any) =>
            updateRequestStatus(updateRequest, request.request_id, returnType)
        );
        setOpen(false);
    }
    }>{returnType === RETURNED ? "Complete return" : `Mark ${returnType.toLowerCase()}`}</Button>;

    let dropdownOptions = [RETURNED, LOST, DAMAGED];
    const alreadyReturnedID = {
        title: <span className={"hw-positive"}><Icon name="check circle"/>All set!</span>,
        content: `${userName} should already have their photo ID`,
        button: keepIDButton,
        highlightTitle: false
    };

    const keepID = {
        title: <span className={"hw-negative"}><Icon name="exclamation triangle"/>Keep photo ID!</span>,
        content: `${userName} has at least one other request that requires return, so keep their photo ID`,
        button: keepIDButton,
        highlightTitle: false
    };

    let card;

    // Top secret machine learning to decide whether to keep or return photo ID or indicate if we already returned it
    if (!returnRequired) {
        if (!numReturnRequired) {
            if (haveID) {
                card = returnID;
            } else {
                card = alreadyReturnedID;
            }
        } else {
            if (haveID) {
                card = keepID;
            } else {
                card = alreadyReturnedID;
            }
        }
    } else {
        if (numReturnRequired === 1 || numReturnRequired === requests.length) {
            if (haveID) {
                card = returnID;
            } else {
                card = alreadyReturnedID;
            }
        } else {
            if (haveID) {
                card = keepID;
            } else {
                card = alreadyReturnedID;
            }
        }
    }

    return (<Card style={{maxWidth: 200}}>
        <Card.Content className={card.highlightTitle ? "highlight" : ""}>
            <strong>{card.title}</strong>
        </Card.Content>
        <Card.Content>
            {card.content}
        </Card.Content>
        {returnRequired && <Card.Content>
            New status: <Dropdown upward floating
                                  inline
                                  value={returnType}
                                  onChange={(event, {value}: any) => setReturnType(value)}
                                  options={toDropdownOptions(dropdownOptions)}/>
        </Card.Content>}
        {error && <Card.Content className="hw-negative">
            <Icon name="warning sign"/>Unable to change request status: {error.message}
        </Card.Content>}
        {card.button}
    </Card>);

}

export default PhotoIdCheck;
