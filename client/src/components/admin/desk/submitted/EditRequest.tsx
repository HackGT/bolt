import {
  Box,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";

import { User } from "../../../../types/User";

const EditRequest = () => {
  const itemQuery = useQuery(["items"], () => axios.get(apiUrl(Service.HARDWARE, "items")));
  const [userList, setUserList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [hidden, setHidden] = useState(true);

  const { data, isLoading } = useQuery<AxiosResponse<any>>([`users_${userSearch}`], () =>
    axios.get(apiUrl(Service.USERS, `/users?search=${userSearch}`))
  );

  useEffect(() => {
    if (!data?.data.profiles) {
      return;
    }
    setUserList(data?.data.profiles);
  }, [userSearch, data]);

  if (itemQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxW="container.md">
      <Heading>Edit Request</Heading>
      <FormControl>
        <Box>
          <Input
            type="text"
            value={userSearch}
            onChange={e => {
              setUserSearch(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const selectedUser = userList[0];
                setUserSearch(
                  `${selectedUser.name.first}${
                    selectedUser.name.middle ? ` ${selectedUser.name.middle}` : ""
                  } ${selectedUser.name.last} [${selectedUser.email}]`
                );
              }
            }}
            onFocus={() => setHidden(false)}
            onBlur={() => setHidden(true)}
          />
          {hidden || (
            <VStack
              position="absolute"
              bgColor="white"
              zIndex={100}
              border={userList.length > 0 ? 1 : 0}
              borderStyle="solid"
              borderColor="#E2E8F0"
              top={12}
              borderRadius={4}
              w="full"
              shadow="lg"
              overflowY="scroll"
              maxH="240px"
            >
              {userList.map(profile => (
                <Box _hover={{ bgColor: "#e2e8f0" }} w="full" p={2}>{`${profile.name.first}${
                  profile.name.middle ? ` ${profile.name.middle}` : ""
                } ${profile.name.last} [${profile.email}]`}</Box>
              ))}
            </VStack>
          )}
        </Box>
      </FormControl>
    </Container>
  );
};

export default EditRequest;
