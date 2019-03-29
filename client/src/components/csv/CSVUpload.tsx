import React from "react";
import { Button, Container, Header, Label } from 'semantic-ui-react';
import { withToastManager } from "react-toast-notifications";
import { ItemComplete } from "../item/ItemEdit";

const templateHeader = [
    "Name", "Description", "Quantity in stock", 
    "Quantity allowed per request", "Image link",
    "Category", "Item value", "Owner", "Return required",
    "Approval required", "Hidden", "Serial numbers (comma-separated)"
]; // Unused, recording for posterity

const typePass = (field: string) => field 
const typeNumber = (field: string) => { const val = parseFloat(field); return isNaN(val) ? 0 : val }
const typeBool = (field: string) => field==='1' ? true : false

// Default indices - kw are uniquely identifiable partial phrases
const fieldInfo: {[field: string]: {index: number, typer: (field: string) => any, kw: string[]}} = {
    "name": {index: 0, typer: typePass, kw:["name"]},
    "description": {index: 1, typer: typePass, kw:["desc"]},
    "totalQty": {index: 2, typer: typeNumber, kw:["total"]},
    "maxReqQty": {index: 3, typer: typeNumber, kw:["max"]},
    "imageUrl": {index: 4, typer: typePass, kw:["image", "img", "url"]},
    "category": {index: 5, typer: typePass, kw:["cat"]},
    "price": {index: 6, typer: typeNumber, kw:["price", "cost"]},
    "owner": {index: 7, typer: typePass, kw:["owner"]},
    "returnRequired": {index: 8, typer: typeBool, kw:["ret"]},
    "requireApproval": {index: 9, typer: typeBool, kw:["approv"]},
    "hidden": {index: 10, typer: typeBool, kw:["hid"]},
    // "serial": [11, typePass] // Not implemented
};

const kwToName: {[kw: string]: string} = {};
Object.keys(fieldInfo).forEach((field) => {
    const info = fieldInfo[field];
    info.kw.forEach(key => {
        kwToName[key] = field
    });
})

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
            const header = lines[0].split(',').map(field => field.toLowerCase());

            // Hardcoded header assumption
            if (header.length != templateHeader.length) {
                toastManager.add('Improper CSV formatting, header too long', {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: "top-center"
                });
                return;
            }

            // Mutate non-default indices based on headers here
            header.forEach((heading, i) => {
                Object.keys(kwToName).some(kw => {
                    if (!heading.includes(kw)) return false;
                    fieldInfo[kwToName[kw]].index = i;
                    return true;
                });
            })
            
            const items: ItemComplete[] = [];
            this.addLog("Starting CSV parse");
            for(let i = 1; i < lines.length; i++) {
                const fields = lines[i].split(",");
                // hack: If we encounter an empty name, end parsing immediately
                if (fields[0] === "") break;

                // TODO: Verify serial number length matches quantity
                // Merge all overflow items into serial numbers
                // const serialNumbers = fields.slice(11);
                
                // const quantity = fields[fieldInfo["totalQty"].index];
                // if (quantity != serialNumbers.length) {
                //     this.addLog(`Error: Line ${i+1} malformed.`);
                //     this.addLog(lines[i]);
                // }

                const newItem: {[field: string]: any} = {id: -1};
                // For each field, find the appropriate column index, take that field, type, and store
                Object.keys(fieldInfo).forEach((key: string) => {
                    const { index, typer } = fieldInfo[key];
                    const rawField: string = fields[index];
                    newItem[key] = typer(rawField);
                });
                this.addLog(`${newItem.name} added: Quantity ${newItem.totalQty}`);
                items.push(newItem as ItemComplete);
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
                        <p style={styles.notice}> 
                            Note: CSVs MUST start with a header line as follows <a href="https://docs.google.com/spreadsheets/d/1Ey0z9ACVmaf7GEcVLvxjuFTdidjXnrbGsTdb2fwYxGs/">here</a>
                        </p>
                    </div>
                    <div style={styles.logWrapper}>
                        <Container>
                            <Header as='h4'>
                                Feed
                            </Header>
                            {logs.map((log, i) => (<p key={i}>{log}</p>))}
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
    logWrapper: {
        borderLeft: '2px solid black',
        marginLeft: '1em',
        paddingLeft: '1em'
    },
    notice: {
        marginTop: '1em'
    },
    wrapper: {
        display: 'flex',
    }
}

export default withToastManager(UploadStep);