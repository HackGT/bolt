// @flow
import * as React from 'react';
import {Button, Popup} from "semantic-ui-react";

export function ReturnOptions({error}: any) {
    return (
        <>
            <Popup content={"hello"} trigger={<Button basic color={"red"}>Lost</Button>}/>
            <Button basic color={"red"}>Damaged</Button>
        </>
    );
}
