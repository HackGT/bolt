import React from "react";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { LoadingScreen, useAuth } from "@hex-labs/core";
import { Navigate } from "react-router-dom";

import HardwareHeader from "./HardwareHeader";

const LandingPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="home" />;
  }

  return (
    <Flex h="100vh" flexDir="column">
      <HardwareHeader />
      <Flex h="full" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
        <Heading
          size="4xl"
          fontWeight="extrabold"
          bgGradient="linear(to-r, #796BEC, #54A6F8)"
          bgClip="text"
        >
          Here to checkout hardware?
        </Heading>
        <Button
          rounded="full"
          bgColor="white"
          border="2px"
          fontSize="20px"
          fontWeight="semibold"
          py={6}
          px={8}
          borderColor="black"
          _hover={{
            background: "black",
            color: "white",
          }}
        >
          Get Started
        </Button>
      </Flex>
    </Flex>
  );
};

export default LandingPage;
