import React from "react";
import {Button, Container, Dimmer, Header, Loader, Segment, Step} from 'semantic-ui-react';
import UploadStep from './CSVUpload';
import ReviewStep from './CSVReview';
import { ItemComplete } from "../item/ItemEdit";
import { withToastManager } from "react-toast-notifications";
import { Redirect } from "react-router-dom";

interface CSVWizardProps {
    toastManager: any
}

interface CSVWizardState {
    wizardStep: number,
    inventory: ItemComplete[], 
    isStepComplete: boolean,
    isSubmitting: boolean,
    isComplete: boolean
}

interface StepInterface {
    [key: string]: any,
    key: string,
    icon: string,
    title: string,
    description?: string,
    stepDiv?: React.ReactElement,
    active?: boolean,
    disabled?: boolean
}

class CSVWizard extends React.Component<CSVWizardProps, CSVWizardState> {
    constructor(props: any) {
        super(props);
        this.state = {
            wizardStep: 0,
            inventory: [],
            isStepComplete: false,
            isSubmitting: false,
            isComplete: false
        };
    }

    nextStep = () => {
        const { wizardStep } = this.state; 
        this.setState({ wizardStep: wizardStep+1,
                        isStepComplete: false });
    }

    setInventory = (inventory: ItemComplete[]) => {
        this.setState({inventory, isStepComplete: true});
    }

    uploadInventory = () => {
        this.setState({isSubmitting: true});
        window.alert("Unimplemented");
        window.setTimeout(this.onInventorySubmitted, 2000);
    }

    onInventorySubmitted = () => {
        const { toastManager } = this.props;
        this.setState({isSubmitting: false});
        toastManager.add('CSV Submitted! Redirecting', {
            appearance: 'success',
            autoDismiss: true,
            placement: "top-center"
        });
        window.setTimeout(() => {
            this.setState({isComplete: true});
        }, 2000); // Redirect, since you should be done with the wizard
    }

    render() {
        const { wizardStep, inventory, isStepComplete, isSubmitting, isComplete } = this.state;

        if (isComplete) return <Redirect to='/' />;

        const nextButton = (
            <Button disabled={!isStepComplete} 
                    onClick={this.nextStep}
                    floated='right'
                    primary
                    >
                Next Step
            </Button>
        );

        const submitButton = (
            <Button 
                    onClick={this.uploadInventory}
                    floated='right'
                    color='green'
                    disabled={this.state.isSubmitting}
                    >
                Submit
            </Button>
        );

        const defaultStep = (
            <Container textAlign="center">
                <Header>
                    That's weird. Refresh?
                </Header>
            </Container>
        );

        const stepsSrc: StepInterface[] = [
            {
                key: 'upload',
                icon: 'upload',
                title: 'Upload',
                stepDiv: <UploadStep setInventory={this.setInventory}/>
            },
            { 
                key: 'confirm', 
                icon: 'pencil', 
                title: 'Review Upload',
                stepDiv: <ReviewStep inventory={inventory} />
            },
        ]

        // Select appropriate step div to show
        const activeStepContent = stepsSrc[wizardStep].stepDiv || defaultStep;
        
        // Set appropriate state in step component and strip stepDiv for proper props
        const steps: StepInterface[] = stepsSrc.map((step, i) => {
            if (i == wizardStep) step.active = true;
            if (i > wizardStep) step.disabled = true;
            delete step.stepDiv;
            return step; 
        })

        return (
            <div id="csv-upload-wrapper">
                <Dimmer active={isSubmitting}>
                    <Loader />
                </Dimmer>
                <Container>
                    <Step.Group items={steps} />
                    {wizardStep === stepsSrc.length - 1 ? submitButton : nextButton}
                </Container>
                <Segment>
                    {activeStepContent}
                </Segment>
            </div>
        );
    }
}

export default withToastManager(CSVWizard);