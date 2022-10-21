import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Container, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";

import { Item } from "../../../types/Hardware";
import UploadComplete from "./CSVComplete";
import ReviewSetup from "./CSVReview";
import UploadStep from "./CSVUpload";

const CSVWizard = () => {
  const [inventory, setInventory] = useState<Item[]>([]);
  const [step, setStep] = useState<number>(0);

  return (
    <Container maxW="container.lg">
      <Heading>Import Items</Heading>
      <Flex flexDir="row" justifyContent="center" alignItems="center" mt="12px" mb="20px">
        <Center
          rounded="full"
          width="32px"
          height="32px"
          bgColor="blue.300"
          position="relative"
          boxSizing="border-box"
          onClick={() => setStep(0)}
        >
          <Center
            bgColor={step === 0 ? "white" : "transparent"}
            width="26px"
            height="26px"
            rounded="full"
          >
            <CheckIcon color="white" />
          </Center>
          <Text
            position="absolute"
            top={9}
            transform="translateX(-50%)"
            left="50%"
            fontWeight="semibold"
          >
            Upload
          </Text>
        </Center>
        <Box h={1} w="300px" bgColor={step === 0 ? "gray.200" : "blue.300"} />
        <Center
          rounded="full"
          width="32px"
          height="32px"
          bgColor={step === 0 ? "gray.200" : "blue.300"}
          position="relative"
          boxSizing="border-box"
          onClick={() => setStep(1)}
        >
          <Center
            bgColor={step === 1 || step === 0 ? "white" : "transparent"}
            width="26px"
            height="26px"
            rounded="full"
          >
            <CheckIcon color="white" />
          </Center>
          <Text
            position="absolute"
            top={9}
            transform="translateX(-50%)"
            left="50%"
            fontWeight="semibold"
          >
            Review
          </Text>
        </Center>
      </Flex>
      {step === 0 && <UploadStep step={step} setInventory={setInventory} setStep={setStep} />}
      {step === 1 && <ReviewSetup setStep={setStep} inventory={inventory} />}
      {step === 2 && <UploadComplete />}
    </Container>
  );
};

export default CSVWizard;
