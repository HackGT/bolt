import React from "react";

import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import CreateCategoryForm from "./CreateCategoryForm";

const CreateCategoryWrapper = () => {
  const navigate = useNavigate();

  return (
    <Container p="8">
      <Button variant="link" size="lg" onClick={() => navigate(-1)}>
        <ArrowBackIcon mr={2} /> Back
      </Button>
      <Heading mt={2}>Create Category</Heading>
      <CreateCategoryForm />
    </Container>
  );
};

export default CreateCategoryWrapper;
