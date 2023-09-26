import React, { ChangeEvent, Component, FormEvent, ReactNode, useState } from "react";
import { connect } from "react-redux";
import Cleave from "cleave.js/react";
import { Navigate } from "react-router-dom";
import { withToastManager } from "react-toast-notifications";
import { Mutation } from "@apollo/client/react/components";
import { ErrorScreen, Header, LoadingScreen, Service, apiUrl, useAuth } from "@hex-labs/core";
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Link,
  Center,
} from "@chakra-ui/react";
import useAxios from "axios-hooks";

import { FullUser, User } from "../../types/User";
import { AppState } from "../../state/Store";
import { UPDATE_USER } from "../../graphql/Mutations";

const UserProfile = () => {
  const [submitClicked, setSubmitClicked] = useState(false);
  const { user } = useAuth();
  const [{ data: userData, loading: userLoading, error: userError }, userRefetch] = useAxios({
    method: "GET",
    url: apiUrl(Service.USERS, `/users/${user?.uid}`),
    params: {
      hexathon: process.env.REACT_APP_HEXATHON_ID,
    },
  });

  if (userError) {
    return <ErrorScreen error={userError} />;
  }

  if (!user || userLoading) {
    return <LoadingScreen />;
  }

  // const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //   const { target } = event;
  //   let { value }: { value: any } = target;
  //   const { name } = target;
  //   const inputType = target.type;
  //   // Convert number input values to numbers
  //   if (inputType === "number") {
  //     value = Number.parseFloat(value);
  //   }

  //   // this.setState(prevState => ({
  //   //   user: {
  //   //     ...prevState.user,
  //   //     [name]: value,
  //   //   },
  //   // }));
  // };

  // const handleInputChangeCheckbox = (
  //   event: FormEvent<HTMLInputElement>,
  //   checkboxProps: CheckboxProps
  // ): void => {
  //   if (checkboxProps && checkboxProps.name && typeof checkboxProps.checked !== "undefined") {
  //     const value: boolean = checkboxProps.checked;
  //     const { name } = checkboxProps;

  //     this.setState(prevState => ({
  //       user: {
  //         ...prevState.user,
  //         [name]: value,
  //       },
  //     }));
  //   }
  // };

  // const adminEditingOtherUser = () => {
  //   return (
  //     this.props.signedInUser &&
  //     this.props.signedInUser.admin &&
  //     this.props.signedInUser.uuid !== this.state.user.uuid
  //   );
  // }

  // private finishFormSubmit(submitForm: any, toastManager: any) {
  //   if (!this.validateForm()) {
  //     return;
  //   }

  //   const variables: any = {
  //     uuid: this.state.user.uuid,
  //     updatedUser: {
  //       phone: this.state.user.phone.trim(),
  //     },
  //   };

  //   // if the user saving is an admin
  //   if (this.props.signedInUser && this.props.signedInUser.admin) {
  //     variables.updatedUser.admin = this.state.user.admin;
  //     variables.updatedUser.haveID = this.state.user.haveID;
  //   }

  //   submitForm({
  //     variables,
  //   })
  //     .then(() => {
  //       toastManager.add(`Profile updated`, {
  //         appearance: "success",
  //         autoDismiss: true,
  //         placement: "top-center",
  //       });
  //     })
  //     .catch((err: Error) => {
  //       let message = `Couldn't update profile because of an error: ${err.message}.  Check your internet connection.  If the problem persists, contact a member of the HackGT Team for assistance.`;

  //       if (err.message.indexOf("Network error") !== -1) {
  //         message = `It appears you are offline.  Please check your internet connection and then try again.`;
  //       }

  //       toastManager.add(message, {
  //         appearance: "error",
  //         autoDismiss: false,
  //         placement: "top-center",
  //       });
  //     });
  // }

  // const validatePhone = (): boolean => {
  //   return !submitClicked || /^\((\d){3}\) (\d){3}-(\d){4}$/.test(user.phone);
  // }

  // const validateForm = (): boolean => {
  //   return !submitClicked || this.validatePhone();
  // }

  // const isAdmin: boolean = !!this.props.signedInUser && this.props.signedInUser.admin;
  // const adminHeader = isAdmin ? <Heading size="lg">User Administration</Heading> : "";
  // const haveId = isAdmin ? (
  //   <Popup
  //     inverted
  //     trigger={
  //       <Form.Checkbox
  //         name="haveID"
  //         label="Have ID"
  //         checked={this.state.user.haveID}
  //         onChange={this.handleInputChangeCheckbox}
  //       />
  //     }
  //     content="Whether the hardware desk currently has possession of this user's photo ID as collateral"
  //   />
  // ) : (
  //   ""
  // );

  // let userIsAdmin: string | ReactNode = "";

  // if (isAdmin) {
  //   userIsAdmin = (
  //     <Form.Field>
  //       <Popup
  //         inverted
  //         trigger={
  //           <Form.Checkbox
  //             label="Admin"
  //             name="admin"
  //             disabled={isAdmin && !this.adminEditingOtherUser()}
  //             checked={this.state.user.admin}
  //             onChange={this.handleInputChangeCheckbox}
  //           />
  //         }
  //         content="Whether this user can access administration pages like this one"
  //       />
  //       {isAdmin && !this.adminEditingOtherUser() ? (
  //         <Message content="You can't remove your own admin privileges." />
  //       ) : (
  //         ""
  //       )}
  //     </Form.Field>
  //   );
  // }

  // const adminUuid = isAdmin ? (
  //   <Form.Field width={6}>
  //     <label>UUID</label>
  //     <p>{this.state.user.uuid}</p>
  //   </Form.Field>
  // ) : (
  //   ""
  // );

  // const backUrl = isAdmin ? "/admin/users"
  return (
    <Center>
      <Flex direction="column" py="24px">
        <Heading size="xl">Profile</Heading>
        <Box>
          <Alert status="info" my="4">
            <AlertIcon />
            <Text>
              Please visit the{" "}
              <Link href="https://login.hexlabs.org" isExternal color="blue.600">
                Hexlabs Login Service
              </Link>{" "}
              to edit your information.
            </Text>
          </Alert>
          <Box>
            <Heading as="h6" size="md">
              Phone Number
            </Heading>
            <Text fontSize="lg">{userData.phoneNumber || "Not Found"}</Text>
          </Box>
          <Box my="4">
            <Heading as="h6" size="md">
              Full Name
            </Heading>
            <Text fontSize="lg">{user.displayName}</Text>
          </Box>
          <Box>
            <Heading as="h6" size="md">
              Email
            </Heading>
            <Text fontSize="lg">{user.email}</Text>
          </Box>
        </Box>
      </Flex>
    </Center>
  );
};

export default UserProfile;
