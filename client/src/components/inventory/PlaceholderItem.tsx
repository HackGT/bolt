import React from "react";
import {Placeholder} from "semantic-ui-react";

function PlaceholderItem() {
    return (
        <Placeholder>
            <Placeholder.Header image>
                <Placeholder.Line/>
                <Placeholder.Line/>
            </Placeholder.Header>
            <Placeholder.Paragraph>
                <Placeholder.Line/>
                <Placeholder.Line/>
                <Placeholder.Line/>
                <Placeholder.Line/>
            </Placeholder.Paragraph>
        </Placeholder>
    );
}

export default PlaceholderItem;
