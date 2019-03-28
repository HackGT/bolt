import React from "react";
import {Button, Container, Divider, Grid, Header, Segment, Step} from 'semantic-ui-react';
import UploadStep from './CSVUpload';
import { ItemComplete } from "../item/ItemEdit";

interface CSVWizardState {
    wizardStep: number,
    isStepComplete: boolean,
    inventory: ItemComplete[], 
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

class CSVWizard extends React.Component<{}, CSVWizardState> {
    constructor(props: any) {
        super(props);
        this.state = {
            wizardStep: 0,
            isStepComplete: false,
            inventory: []
        };
    }

    nextStep = () => {
        const { wizardStep } = this.state; 
        this.setState({ wizardStep: wizardStep+1 });
    }

    setStepStatus = (isStepComplete: boolean) => {
        this.setState({isStepComplete});
    }

    setInventory = (inventory: ItemComplete[]) => {
        this.setState({inventory})
    }

    render() {
        const { wizardStep, isStepComplete } = this.state;

        const nextButton = (
            <Button disabled={!isStepComplete} 
                    onClick={this.nextStep}
                    floated='right'
                    primary
                    >
                Next Step
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
              key: 'format',
              icon: 'pencil',
              title: 'Format Upload',
            },
            { key: 'confirm', 
              icon: 'info', 
              title: 'Confirm Upload',
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
                <Container>
                    <Step.Group items={steps} />
                    {nextButton}
                </Container>
                <Segment>
                    {activeStepContent}
                </Segment>
            </div>
        );
    }
}

export default CSVWizard;