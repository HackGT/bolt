import React from "react";
import {Button, Container, Header, Label} from "semantic-ui-react";
import {withToastManager} from "react-toast-notifications";
import {ItemComplete} from "../item/ItemEditForm";
import {unformat} from "accounting";

const templateHeader = [
    "Name", "Description", "Quantity in stock", 
    "Quantity allowed per request", "Image link",
    "Category", "Item value", "Owner", "Return required",
    "Approval required", "Hidden", "Serial numbers (comma-separated)"
]; // Unused, recording for posterity

const typeString = (field: string | null) => field ? field.trim() : "";
const typeNumber = (field: string) => {
    const val = parseFloat(field);
    return isNaN(val) ? 0 : val;
};
const typeMoney = (field: string) => unformat(field);
const typeBool = (field: string) => field === "1";

// Default indices - kw are uniquely identifiable partial phrases
const fieldInfo: {[field: string]: {index: number, typer: (field: string) => any, kw: string[]}} = {
    item_name: {index: 0, typer: typeString, kw: ["name"]},
    description: {index: 1, typer: typeString, kw: ["desc"]},
    totalAvailable: {index: 2, typer: typeNumber, kw: ["total"]},
    maxRequestQty: {index: 3, typer: typeNumber, kw: ["max"]},
    imageUrl: {index: 4, typer: typeString, kw: ["image", "img", "url"]},
    category: {index: 5, typer: typeString, kw: ["category"]},
    price: {index: 6, typer: typeMoney, kw: ["price", "cost", "value"]},
    owner: {index: 7, typer: typeString, kw: ["owner", "who"]},
    returnRequired: {index: 8, typer: typeBool, kw: ["ret"]},
    approvalRequired: {index: 9, typer: typeBool, kw: ["approv"]},
    hidden: {index: 10, typer: typeBool, kw: ["hid"]},
    location: {index: 11, typer: typeString, kw: ["location"]}
    // "serial": [11, typeString] // Not implemented
};

const kwToName: {[kw: string]: string} = {};
Object.keys(fieldInfo).forEach((field) => {
    const info = fieldInfo[field];
    info.kw.forEach(key => {
        kwToName[key] = field;
    });
});

interface UploadProps {
    setInventory: (inventory: ItemComplete[]) => any;
    toastManager: any;
}

interface UploadState {
    logs: string[];
}

class UploadStep extends React.Component<UploadProps, UploadState> {
    constructor(props: UploadProps) {
        super(props);
        this.state = {
            logs: ["Waiting for upload"]
        };
    }

    public addLog = (msg: string) => {
        const { logs } = this.state;
        logs.push(msg);
        this.setState({ logs });
    }

    public onCSVSelect = (e: any) => {
        if (!e.target.files || !e.target.files[0]) {
            return;
        }
        const file = e.target.files[0];
        const reader = new FileReader();

        const { toastManager, setInventory } = this.props;

        reader.addEventListener("load", (e: any) => {
            
            const csvdata: string = e.target.result;
            const lines = csvdata.split("\n");
            // Only request the first line to cleanse headers
            const header = lines[0].split("\t").map(field => field.toLowerCase());

            // Hardcoded header assumption
            if (header.length != templateHeader.length) {
                toastManager.add("Improper CSV formatting, header too long", {
                    appearance: "error",
                    autoDismiss: true,
                    placement: "top-center"
                });
                return;
            }

            // Mutate non-default indices based on headers here
            header.forEach((heading, i) => {
                Object.keys(kwToName).some(kw => {
                    if (!heading.includes(kw)) {
                        return false;
                    }
                    fieldInfo[kwToName[kw]].index = i;
                    return true;
                });
            });
            
            const items: ItemComplete[] = [];
            this.addLog("Starting CSV parse");
            for (let i = 1; i < lines.length; i++) {
                const fields = lines[i].split("\t");
                // hack: If we encounter an empty name, end parsing immediately
                if (fields[0] === "") {
                    break;
                }

                // TODO: Verify serial number length matches quantity
                // Merge all overflow items into serial numbers
                // const serialNumbers = fields.slice(11);

                // const quantity = fields[fieldInfo["totalAvailable"].index];
                // if (quantity != serialNumbers.length) {
                //     this.addLog(`Error: Line ${i+1} malformed.`);
                //     this.addLog(lines[i]);
                // }

                const newItem: { [field: string]: any } = {};
                // For each field, find the appropriate column index, take that field, type, and store
                Object.keys(fieldInfo).forEach((key: string) => {
                    const { index, typer } = fieldInfo[key];
                    const rawField: string = fields[index];
                    newItem[key] = typer(rawField);
                });
                this.addLog(`${newItem.item_name} added: Quantity ${newItem.totalAvailable}`);
                items.push(newItem as ItemComplete);
            }
            console.log(items);
            setInventory(items);
        });
        
        reader.readAsBinaryString(file);
    }

    public render() {
        const { logs } = this.state;
        return (
            <Container>
                <Header as="h3" dividing>
                    Upload a TSV
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
                                    content: "Select file"
                                }}
                                labelPosition="right"
                            />
                            <input
                                hidden
                                id="upload"
                                type="file"
                                accept="text/csv"
                                onChange={this.onCSVSelect}
                            />
                        </Label>
                        <p style={styles.notice}>
                            Please save your file as a <strong>TSV</strong>, which is like a CSV but with tabs. This
                            will allow you to have commas in your data fields.
                            Note: TSVs MUST start with a header line as follows <a
                            href="https://docs.google.com/spreadsheets/d/1Ey0z9ACVmaf7GEcVLvxjuFTdidjXnrbGsTdb2fwYxGs/">here</a>.
                            Formatting errors will not be picked up (yet)! Verify your entries!
                        </p>
                    </div>
                    <div style={styles.logWrapper}>
                        <Container>
                            <Header as="h4">
                                Feed
                            </Header>
                            {logs.map((log, i) => (<p key={i}>{log}</p>))}
                        </Container>
                    </div> 
                </Container>
            </Container>
        );
    }
}

const styles = {
    buttonWrapper: {
        flex: "none",
        width: "15em"
    },
    logWrapper: {
        borderLeft: "2px solid black",
        marginLeft: "1em",
        paddingLeft: "1em"
    },
    notice: {
        marginTop: "1em"
    },
    wrapper: {
        display: "flex",
    }
};

export default withToastManager(UploadStep);
