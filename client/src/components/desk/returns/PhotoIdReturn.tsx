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

function generateCard({title, content, button, error, returnRequired, returnType, setReturnType, optional}: any) {
    let dropdownOptions = [RETURNED, LOST, DAMAGED];
    console.log(returnRequired, optional);
    if (optional) {
        dropdownOptions = [RETURNED];
    }

    return (<Card style={{maxWidth: 200}}>
        <Card.Content>
            <strong>{title}</strong>
        </Card.Content>
        <Card.Content>
            {content}
        </Card.Content>
        <Card.Content>
            New status: <Dropdown upward floating
                                  inline
                                  disabled={optional}
                                  value={returnType}
                                  onChange={(event, {value}) => setReturnType(value)}
                                  options={toDropdownOptions(dropdownOptions)}/>
        </Card.Content>
        {error ? <Card.Content className="hw-negative">
            <Icon name="warning sign"/>Unable to change request status: {error.message}
        </Card.Content> : ""}
        {button}
    </Card>);
}

function PhotoIdCheck({userName, loading, updateRequest, requests, returnRequired, haveID, error, setOpen, optional}: any) {
    const [returnType, setReturnType] = useState(RETURNED);

    const returnId = {
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
        error,
        setReturnType,
        returnType,
        returnRequired,
        optional
    };

    const noIdReturnButton = <Button color="green" loading={loading} onClick={event => {
        requests.forEach((request: any) =>
            updateRequestStatus(updateRequest, request.request_id, returnType)
        );
        setOpen(false);
    }
    }>{returnType === RETURNED ? "Complete return" : `Mark ${returnType.toLowerCase()}`}</Button>;

    const idAlreadyReturned = {
        title: <span className={"hw-positive"}><Icon name="check circle"/>All set!</span>,
        content: `${userName} should already have their photo ID`,
        button: noIdReturnButton,
        error,
        setReturnType,
        returnType,
        returnRequired,
        optional
    };

    const cantReturnId = {
        title: <span className={"hw-negative"}><Icon name="exclamation triangle"/>Keep photo ID!</span>,
        content: `${userName} has at least one other request that requires return, so keep their photo ID`,
        button: noIdReturnButton,
        error,
        setReturnType,
        returnType,
        returnRequired,
        optional
    };

    if (returnRequired) {
        return generateCard(cantReturnId);
    }

    if (!returnRequired && haveID) {
        return generateCard(returnId);
    }

    return generateCard(idAlreadyReturned); // !returnRequired && !haveID
}

export default PhotoIdCheck;
