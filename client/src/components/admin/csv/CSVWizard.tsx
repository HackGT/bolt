// import React from "react";
// import { Button, Container, Dimmer, Header, Loader, Segment, Step } from "semantic-ui-react";
// import { withToastManager } from "react-toast-notifications";
// import { Navigate } from "react-router-dom";
// import { Mutation } from "@apollo/client/react/components";
// import { Heading } from "@chakra-ui/react";
// import { useSteps } from "chakra-ui-steps";

import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Container, Flex, Heading, Text } from "@chakra-ui/react";

// import UploadStep from "./CSVUpload";
// import ReviewStep from "./CSVReview";
// import { CREATE_ITEM } from "../../../graphql/Mutations";
// import { Item } from "../../../types/Hardware";

// interface CSVWizardProps {
//   toastManager: any;
// }

// interface CSVWizardState {
//   wizardStep: number;
//   inventory: Item[];
//   isStepComplete: boolean;
//   isSubmitting: boolean;
//   isComplete: boolean;
//   itemsCreated: number;
//   totalItems: number;
// }

// interface StepInterface {
//   key: string;
//   icon: string;
//   title: string;
//   description?: string;
//   stepDiv?: React.ReactElement;
//   active?: boolean;
//   disabled?: boolean;

//   [key: string]: any;
// }

// class CSVWizard extends React.Component<CSVWizardProps, CSVWizardState> {
//   constructor(props: any) {
//     super(props);
//     this.state = {
//       wizardStep: 0,
//       inventory: [],
//       isStepComplete: false,
//       isSubmitting: false,
//       isComplete: false,
//       itemsCreated: 0,
//       totalItems: 0,
//     };
//   }

//   public nextStep = () => {
//     const { wizardStep } = this.state;
//     this.setState({
//       wizardStep: wizardStep + 1,
//       isStepComplete: false,
//     });
//   };

//   public setStepFactory =
//     (
//       newStep: number // Careful, make sure isStepComplete set intentionally
//     ) =>
//     () => {
//       if (newStep === 0) {
//         this.setState({ wizardStep: newStep });
//       }
//     };

//   public setInventory = (inventory: Item[]) => {
//     this.setState({ inventory, isStepComplete: true });
//   };

//   public uploadInventory = (createItem: any) => {
//     this.setState(prevState => ({
//       isSubmitting: true,
//       totalItems: prevState.inventory.length,
//     }));

//     Promise.all(
//       this.state.inventory.map(item =>
//         createItem({
//           variables: {
//             newItem: item,
//           },
//         })
//           .then(() => {
//             this.setState(prevState => ({
//               itemsCreated: prevState.itemsCreated + 1,
//             }));
//           })
//           .catch((err: Error) => {
//             console.error(err);
//           })
//       )
//     )
//       .then(() => this.onInventorySubmitted())
//       .catch(error => {
//         const { toastManager } = this.props;
//         this.setState({ isComplete: true, isSubmitting: false });
//         toastManager.add(`Error submitted one or more items: ${error.message}`, {
//           appearance: "error",
//           autoDismiss: false,
//           placement: "top-center",
//         });
//       });
//   };

//   public onInventorySubmitted = () => {
//     const { toastManager } = this.props;
//     this.setState({ isComplete: true, isSubmitting: false });
//     toastManager.add("Import successful!  You may need to refresh the page to see the new items", {
//       appearance: "success",
//       autoDismiss: true,
//       placement: "top-center",
//     });
//   };

//   public render() {
//     const { wizardStep, inventory, isStepComplete, isSubmitting, isComplete } = this.state;

//     if (isComplete) {
//       return <Navigate to="/" replace />;
//     }

//     const nextButton = (
//       <Button disabled={!isStepComplete} onClick={this.nextStep} floated="right" primary>
//         Next Step
//       </Button>
//     );

//     const submitButton = (
//       <Mutation mutation={CREATE_ITEM}>
//         {(createItem: any, { loading, error, data }: any) => (
//           <Button
//             onClick={() => this.uploadInventory(createItem)}
//             floated="right"
//             color="green"
//             disabled={this.state.isSubmitting}
//           >
//             Submit
//           </Button>
//         )}
//       </Mutation>
//     );

//     const defaultStep = (
//       <Container textAlign="center">
//         <Header>That's weird. Refresh?</Header>
//       </Container>
//     );

//     const stepsSrc: StepInterface[] = [
//       {
//         key: "upload",
//         icon: "upload",
//         onClick: this.setStepFactory(0),
//         title: "Upload",
//         stepDiv: <UploadStep setInventory={this.setInventory} />,
//       },
//       {
//         key: "confirm",
//         icon: "pencil",
//         title: "Review Upload",
//         stepDiv: <ReviewStep inventory={inventory} />,
//       },
//     ];

//     // Select appropriate step div to show
//     const activeStepContent = stepsSrc[wizardStep].stepDiv || defaultStep;

//     // Set appropriate state in step component and strip stepDiv for proper props
//     /* eslint-disable no-param-reassign */
//     const steps: StepInterface[] = stepsSrc.map((step, i) => {
//       if (i === wizardStep) {
//         step.active = true;
//       }
//       if (i > wizardStep) {
//         step.disabled = true;
//       }
//       delete step.stepDiv;
//       return step;
//     });

//     return (
//       <div id="csv-upload-wrapper">
//         <Dimmer active={isSubmitting}>
//           <Loader
//             content={`${this.state.itemsCreated} of ${this.state.totalItems} items imported`}
//           />
//         </Dimmer>
//         <Container>
//           <Heading size="xl">Import Items</Heading>
//           <Step.Group items={steps} />
//           {wizardStep === stepsSrc.length - 1 ? submitButton : nextButton}
//         </Container>
//         <Segment>{activeStepContent}</Segment>
//       </div>
//     );
//   }
// }

// export default withToastManager(CSVWizard);
import React, { useState } from "react";

import { Item } from "../../../types/Hardware";
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
    </Container>
  );
};

export default CSVWizard;
