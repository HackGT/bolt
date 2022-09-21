import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Container, Heading } from "@chakra-ui/react";
import React, { Component } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header } from "semantic-ui-react";

import { AppState } from "../../state/Store";
import ItemEditForm from "./ItemEditForm";

const CreateItemWrapper = () => {
  const navigate = useNavigate();

  return (
    <Container p="8">
      <Button variant="link" size="lg" onClick={() => navigate(-1)}>
        <ArrowBackIcon mr={2} /> Back
      </Button>
      <Heading mt={2}>Create Item</Heading>
      <ItemEditForm />
    </Container>
  );
};

export default CreateItemWrapper;
