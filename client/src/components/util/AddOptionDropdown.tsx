import React, {Component} from "react";
import {Dropdown, DropdownProps} from "semantic-ui-react";

interface AddOptionDropdownProps {
    name: string;
    required: boolean;
    placeholder: string;
    options: Option[];
    loading?: boolean;
    disabled?: boolean;
    error?: boolean;
    value?: string;
    onChange: (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, inputName: string) => void;
}

export interface Option {
    text: string;
    value: string;
}

interface AddOptionDropdownState {
    options: Option[];
    currentValue?: string;
}

class AddOptionDropdown extends Component<AddOptionDropdownProps, AddOptionDropdownState> {
    constructor(props: AddOptionDropdownProps) {
        super(props);

        this.state = {
            options: this.props.options,
            currentValue: this.props.value || ""
        };
    }

    public handleAddition = (e: any, {value}: any) => {
        this.setState({
            options: [{text: value, value}, ...this.state.options],
        });
    }

    public handleChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        this.setState({
            currentValue: (data.value as string)
        });
        this.props.onChange(event, data, this.props.name);
    }

    public render() {
        return (
            <Dropdown width={4}
                      type="text"
                      name={this.props.name}
                      allowAdditions
                      onAddItem={this.handleAddition}
                      error={this.props.error}
                      onChange={this.handleChange}
                      selection
                      search
                      loading={this.props.loading}
                      required={this.props.required}
                      options={this.state.options}
                      disabled={this.props.disabled}
                      placeholder={this.props.placeholder}
                      value={this.state.currentValue}
            />
        );
    }
}

export default AddOptionDropdown;