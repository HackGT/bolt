import React from "react";
import {Button, Container, Dimmer, Header, Loader, Segment, Step} from "semantic-ui-react";
import UploadStep from "./CSVUpload";
import ReviewStep from "./CSVReview";
import {ItemComplete} from "../item/ItemEditForm";
import {withToastManager} from "react-toast-notifications";
import {Redirect, withRouter} from "react-router-dom";
import {compose} from "redux";
import {Mutation} from "@apollo/react-components";
import {CREATE_ITEM} from "../util/graphql/Mutations";

interface CSVWizardProps {
    toastManager: any;
}

interface CSVWizardState {
    wizardStep: number;
    inventory: ItemComplete[];
    isStepComplete: boolean;
    isSubmitting: boolean;
    isComplete: boolean;
    itemsSubmitted: number;
    totalItems: number;
}

interface StepInterface {
    key: string;
    icon: string;
    title: string;
    description?: string;
    stepDiv?: React.ReactElement;
    active?: boolean;
    disabled?: boolean;

    [key: string]: any;
}

class CSVWizard extends React.Component<CSVWizardProps, CSVWizardState> {
    constructor(props: any) {
        super(props);
        this.state = {
            wizardStep: 0,
            inventory: [],
            isStepComplete: false,
            isSubmitting: false,
            isComplete: false,
            itemsSubmitted: 0,
            totalItems: 0
        };
    }

    public nextStep = () => {
        const { wizardStep } = this.state;
        this.setState({
            wizardStep: wizardStep + 1,
                        isStepComplete: false });
    }

    public setStepFactory = (newStep: number) => { // Careful, make sure isStepComplete set intentionally
        return () => {
            if (newStep === 0) {
                this.setState({wizardStep: newStep});
            }
        };
    }

    public setInventory = (inventory: ItemComplete[]) => {
        console.log(inventory);
        this.setState({inventory, isStepComplete: true});
    }

    public uploadInventory = (createItem: any) => {
        const totalItems = this.state.inventory.length;
        this.setState({
            isSubmitting: true,
            totalItems
        });

        Promise.all(this.state.inventory.map((item) => {

            return createItem({
                variables: {
                    newItem: item
                }
            }).then(() => {
                const numSubmitted = this.state.itemsSubmitted;
                this.setState({
                    itemsSubmitted: numSubmitted + 1
                });
            }).catch((err: Error) => {
                console.error(err);
            });
        })).then(() => this.onInventorySubmitted())
            .catch((error) => {
                const {toastManager} = this.props;
                this.setState({isComplete: true, isSubmitting: false});
                toastManager.add(`Error submitted one or more items: ${error.message}`, {
                    appearance: "error",
                    autoDismiss: false,
                    placement: "top-center"
                });
            });


    }

    public onInventorySubmitted = () => {
        const { toastManager } = this.props;
        this.setState({isComplete: true, isSubmitting: false});
        toastManager.add("Import successful!  You may need to refresh the page to see the new items", {
            appearance: "success",
            autoDismiss: true,
            placement: "top-center"
        });
    }

    public render() {
        const { wizardStep, inventory, isStepComplete, isSubmitting, isComplete } = this.state;

        if (isComplete) {
            return <Redirect to="/"/>;
        }

        const nextButton = (
            <Button disabled={!isStepComplete}
                    onClick={this.nextStep}
                    floated="right"
                    primary
                    >
                Next Step
            </Button>
        );

        const submitButton = (
            <Mutation mutation={CREATE_ITEM}>
                {
                    (createItem: any, {loading, error, data}: any) => (
                        <Button
                            onClick={() => this.uploadInventory(createItem)}
                            floated="right"
                            color="green"
                            disabled={this.state.isSubmitting}
                        >
                            Submit
                        </Button>
                    )
                }

            </Mutation>
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
                key: "upload",
                icon: "upload",
                onClick: this.setStepFactory(0),
                title: "Upload",
                stepDiv: <UploadStep setInventory={this.setInventory}/>
            },
            {
                key: "confirm",
                icon: "pencil",
                title: "Review Upload",
                stepDiv: <ReviewStep inventory={inventory} />
            },
        ];

        // Select appropriate step div to show
        const activeStepContent = stepsSrc[wizardStep].stepDiv || defaultStep;
        
        // Set appropriate state in step component and strip stepDiv for proper props
        const steps: StepInterface[] = stepsSrc.map((step, i) => {
            if (i === wizardStep) {
                step.active = true;
            }
            if (i > wizardStep) {
                step.disabled = true;
            }
            delete step.stepDiv;
            return step;
        });

        return (
            <div id="csv-upload-wrapper">
                <Dimmer active={isSubmitting}>
                    <Loader indeterminate
                            content={`${this.state.itemsSubmitted} of ${this.state.totalItems} imported`}/>
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

export default compose(withRouter, withToastManager)(CSVWizard);
