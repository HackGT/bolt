import React from "react";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  chakra,
} from "@chakra-ui/react";
import axios from "axios";
import { apiUrl, Service } from "@hex-labs/core";

export type FormCategory = {
  name: string;
};

const CreateCategoryForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormCategory>();

  const navigate = useNavigate();

  async function onSubmit(values: any) {
    await axios.post(apiUrl(Service.HARDWARE, "/categories"), values);
    navigate("/");
  }

  return (
    <Flex as="form" gap={4} flexDir="column" onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={Boolean(errors.name)}>
        <FormLabel htmlFor="itemName">
          Category name <chakra.span color="red.400">*</chakra.span>
        </FormLabel>
        <Input
          id="name"
          placeholder="Raspberry Pi"
          {...register("name", { required: "Please provide a category name!" })}
        />
        <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
      </FormControl>
      <Button colorScheme="twitter" type="submit" isLoading={isSubmitting}>
        Create category
      </Button>
    </Flex>
  );
};

export default CreateCategoryForm;
