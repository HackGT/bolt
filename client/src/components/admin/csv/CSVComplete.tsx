import React from "react";
import { Button, Center, Container, Flex, Heading } from "@chakra-ui/react";

const UploadComplete = () => (
  <Container maxW="container.lg">
    <Flex maxW="fit-content" mx="auto" flexDir="column" h="50vh" justifyContent="center" gap={4}>
      <Heading>Upload Successful!</Heading>
      <Button
        colorScheme="twitter"
        onClick={() => {
          window.location.href = window.location.origin;
        }}
      >
        Return Home
      </Button>
    </Flex>
  </Container>
);

export default UploadComplete;
