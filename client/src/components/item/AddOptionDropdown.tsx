import React, {Component} from "react";
import {Dropdown, DropdownProps} from "semantic-ui-react";

interface AddOptionDropdownProps {
    name: string;
    required: boolean;
    placeholder: string;
    options: Option[];
    onChange: (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, inputName: string) => void;
}

export interface Option {
    text: string;
    value: string;
}

interface AddOptionDropdownState {
    options: Option[];
    currentValue?: any;
}

class AddOptionDropdown extends Component<AddOptionDropdownProps, AddOptionDropdownState> {
    constructor(props: AddOptionDropdownProps) {
        super(props);
        this.state = {
            options: this.props.options,
            currentValue: ""
        };
    }

    public handleAddition = (e: any, {value}: any) => {
        this.setState({
            options: [{text: value, value}, ...this.state.options],
        });
    }

    public handleChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        console.log(event, data.value);
        this.setState({
            currentValue: data.value
        });
        this.props.onChange(event, data, this.props.name);
    };
    // onAddItem(e: React.KeyboardEvent<HTMLElement>, dropdown: DropdownProps): void {
    //     const value: string = dropdown.
    //     this.setState({
    //         options: [{ text: value, value: value }, ...this.state.options],
    //     });
    // }

    public render() {
        return (
            <Dropdown width={4}
                      type="text"
                      name={this.props.name}
                      allowAdditions
                      onAddItem={this.handleAddition}
                      onChange={this.handleChange}
                      selection
                      search
                      required={this.props.required}
                      options={this.state.options}
                      placeholder={this.props.placeholder}
                      value={this.state.currentValue}
            />
        );
    }
}

export default AddOptionDropdown;
