import React from "react";
import { Header, Icon } from "semantic-ui-react";

const HardwareLocation = ({ name }: any) => (
  <div>
    <Header size="large">
      <Icon name="building" />
      {name}
    </Header>
    <p>These items are available from {name}. Pick them up and return them there.</p>
  </div>
);

export default HardwareLocation;
