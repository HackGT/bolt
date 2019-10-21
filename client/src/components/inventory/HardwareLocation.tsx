import React from 'react';
import {Header, Icon} from "semantic-ui-react";

const HardwareLocation = ({location_name}: any) => {
    return (
        <div>
            <Header size={"large"}><Icon name={"building"}/>{location_name}</Header>
            <p>These items are available from {location_name}. Pick them up and return them
                there.</p>
        </div>
    );
};

export default HardwareLocation;
