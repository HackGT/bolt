import { Box, Heading, Text } from "@chakra-ui/react";
import React from "react";

const HardwareLocation = ({ name }: any) => (
  <Box>
    <Heading size="lg">{name}</Heading>
    <Text mt={4}>These items are available from {name}. Pick them up and return them there.</Text>
  </Box>
);

export default HardwareLocation;
