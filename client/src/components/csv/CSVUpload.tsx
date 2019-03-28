import React from "react";
import { Button, Container, Header, Label } from 'semantic-ui-react';
import { withToastManager } from "react-toast-notifications";
import { ItemComplete } from "../item/ItemEdit";

const templateHeader = [
    "Name", "Description", "Quantity in stock", 
    "Quantity allowed per request", "Image link",
    "Category", "Item value", "Owner", "Return required",
    "Approval required", "Hidden", "Serial numbers (comma-separated)"
]; 

interface UploadProps {
    setInventory: (inventory: ItemComplete[]) => any,
    toastManager: any
}

interface UploadState {
    logs: string[]
}

class UploadStep extends React.Component<UploadProps, UploadState> {
    constructor(props: UploadProps) {
        super(props);
        this.state = {
            logs: ["Waiting for upload"]
        };
    }

    addLog = (msg: string) => {
        const { logs } = this.state;
        logs.push(msg);
        this.setState({ logs });
    }

    onCSVSelect = (e: any) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        var reader = new FileReader();

        const { toastManager, setInventory } = this.props;
            
        reader.addEventListener('load', (e: any) => {
            
            const csvdata: string = e.target.result;
            const lines = csvdata.split("\n");
            // Only request the first line to cleanse headers
            const header = lines[0].split(',');

            // Hardcoded header assumption
            if (header.length != templateHeader.length) {
                toastManager.add('Improper CSV formatting', {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: "top-center"
                });
                return;
            }
            for (let i = 0; i < templateHeader.length; i++) {
                if (templateHeader[i] != header[i].trim()) {
                    toastManager.add(`Improper CSV formatting, unexpected field ${header[i]}`, {
                        appearance: 'error',
                        autoDismiss: true,
                        placement: "top-center"
                    });
                    return;
                }
            }

            const items: ItemComplete[] = [];
            this.addLog("Starting CSV parse");
            for(let i = 0; i < lines.length; i++) {
                const fields = lines[i].split(",");
                // Do some mapping wizardry here
                if (fields.length != templateHeader.length) {
                    this.addLog(`Error: Line ${i+1} malformated.`);
                    this.addLog(lines[i]);
                }
            }

            setInventory(items);
        });
        
        reader.readAsBinaryString(file);
    }

    render() {
        const { logs } = this.state;
        return (
            <Container>
                <Header as='h3' dividing>
                    Upload a CSV
                </Header>
                <Container style={styles.wrapper}>
                    <div style={styles.buttonWrapper}>
                        <Label
                            as="label"
                            basic
                            htmlFor="upload"
                        >
                            <Button
                                icon="upload"
                                label={{
                                    basic: true,
                                    content: 'Select file'
                                }}
                                labelPosition="right"
                            />
                            <input
                                hidden
                                id="upload"
                                type="file"
                                accept='text/csv'
                                onChange={this.onCSVSelect}
                            />
                        </Label>
                        <p> 
                            Note: CSVs MUST have first line header as follows <a href="https://docs.google.com/spreadsheets/d/1Ey0z9ACVmaf7GEcVLvxjuFTdidjXnrbGsTdb2fwYxGs/">here</a>
                        </p>
                    </div>
                    <div style={styles.filePreview}>
                        <Container>
                            <Header as='h4'>
                                Feed
                            </Header>
                            {logs.map(log => {<p>{log}</p>})}
                        </Container>
                    </div> 
                </Container>
            </Container>
        );
    }
};

const styles = {
    buttonWrapper: {
        flex: 'none',
        width: '15em'
    },
    filePreview: {
        marginLeft: '1em',
    },
    wrapper: {
        display: 'flex',
    }
}

export default withToastManager(UploadStep);