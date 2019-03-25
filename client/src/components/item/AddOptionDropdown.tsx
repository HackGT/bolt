import React, {Component} from 'react';
import {Dropdown} from "semantic-ui-react";

interface AddOptionDropdownProps {
    name: string,
    required: boolean,
    placeholder: string,
    options: Option[]
}

export interface Option {
    text: string,
    value: string
}

interface AddOptionDropdownState {
    options: Option[],
    currentValue: string
}

class AddOptionDropdown extends Component<AddOptionDropdownProps, AddOptionDropdownState> {
    constructor(props: AddOptionDropdownProps) {
        super(props);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            options: this.props.options,
            currentValue: ""
        };
    }

    handleAddition = (e: any, {value}: any) => {
        this.setState({
            options: [{text: value, value}, ...this.state.options],
        })
    };

    handleChange = (e: any, {value}: any) => this.setState({currentValue: value});
    // onAddItem(e: React.KeyboardEvent<HTMLElement>, dropdown: DropdownProps): void {
    //     const value: string = dropdown.
    //     this.setState({
    //         options: [{ text: value, value: value }, ...this.state.options],
    //     });
    // }

    render() {
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