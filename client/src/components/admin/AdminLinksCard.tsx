import React from "react";
import { connect } from "react-redux";
import { Card, Header, Label, List } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Badge, Box, Heading } from "@chakra-ui/react";

import { AppState } from "../../state/Store";
import { AdminCardLink } from "./AdminHub";

interface Props {
  title: string;
  links: AdminCardLink[];
  notice?: string;
}

const AdminLinksCard: React.FC<Props> = props => {
  const content = (
    <List>
      {props.links.map(value => (
        <List.Item key={value.name}>
          {value.external ? (
            <a href={value.to}>{value.name}</a>
          ) : (
            <Link to={value.to}>{value.name}</Link>
          )}
        </List.Item>
      ))}
    </List>
  );
  return (
    <Box w="full" p={5} shadow="md" borderWidth="1px" rounded="md">
      <Heading as="h5" size="lg">
        {props.title} {props.notice ? <Badge colorScheme="blue">{props.notice}</Badge> : ""}
      </Heading>
      {content}
    </Box>
  );
};

export default AdminLinksCard;
