import React from 'react';
import {Button, Card, Icon} from "semantic-ui-react";
import {updateRequestStatus} from "../DeskUtil";
import {FULFILLED} from "../../../types/Hardware";

function generateCard({title, content, button, error}: any) {
    return <Card style={{maxWidth: 200}}>
        <Card.Content>
            <strong>{title}</strong>
        </Card.Content>
        <Card.Content>
            {content}
        </Card.Content>
        {error ? <Card.Content className="hw-negative">
            <Icon name="warning sign"/>Unable to change request status: {error.message}
        </Card.Content> : ""}
        {button}
    </Card>;
}

function PhotoIdCheck({userName, loading, updateRequest, requests, returnRequired, haveID, error}: any) {
    const idRequired = generateCard({
        title: <><Icon name="id badge"/>Photo ID required</>,
        content: `Did you collect ${userName}'s photo ID?`,
        button: <Button.Group>
            <Button loading={loading} onClick={event =>
                requests.forEach((request: any) =>
                    updateRequestStatus(updateRequest, request.request_id, FULFILLED)
                )
            }>Skip</Button>
            <Button color="green" loading={loading} onClick={event =>
                requests.forEach((request: any) =>
                    updateRequestStatus(updateRequest, request.request_id, FULFILLED, true)
                )
            }>Yes</Button>
        </Button.Group>,
        error
    });

    const noIdRequiredButton = <Button color="green" loading={loading} onClick={event =>
        requests.forEach((request: any) =>
            updateRequestStatus(updateRequest, request.request_id, FULFILLED)
        )
    }>Complete pickup</Button>;

    const idAlreadyCollected = generateCard({
        title: <><Icon name="check circle"/>All set!</>,
        content: `You already have ${userName}'s photo ID`,
        button: noIdRequiredButton,
        error
    });

    const idNotRequired = generateCard({
        title: <><Icon name="check circle"/>All set!</>,
        content: `${requests.length === 1 ? "This item doesn't" : "None of these items"} require return, so no photo ID is required for pickup`,
        button: noIdRequiredButton,
        error
    });

    if (!returnRequired) {
        return idNotRequired;
    }

    if (returnRequired && !haveID) {
        return idRequired;
    }

    return idAlreadyCollected; // returnRequired && haveID
}

export default PhotoIdCheck;
