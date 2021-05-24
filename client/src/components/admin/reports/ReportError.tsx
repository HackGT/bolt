import React from "react";
import { Header, Message } from "semantic-ui-react";

interface Props {
  header: string;
  errorMessage: string;
}

export const ReportError: React.FC<Props> = props => (
  <>
    <Header content={props.header} size="huge" />
    <Message negative>
      <Message.Header>Error displaying report</Message.Header>
      <p>Something is preventing us from showing this report: {props.errorMessage}</p>
    </Message>
  </>
);
