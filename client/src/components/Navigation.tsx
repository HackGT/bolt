import React from "react";
import {Icon, Menu} from 'semantic-ui-react'
import {Link} from "react-router-dom";
import {connect} from "react-redux";

export interface OwnProps {}

interface StateProps {
    a: number
}

type Props = StateProps & OwnProps;

class Navigation extends React.Component<Props, {}> {
    render() {

        return (
            <Menu stackable>
                <Menu.Item header>HackGT Hardware</Menu.Item>
                <Menu.Item name="inventory">
                    <Icon name="home"/><Link to="/">Inventory</Link>
                </Menu.Item>
                <Menu.Item name="admin">
                    <Icon name="file"/><Link to="/admin/csv">Import</Link>
                </Menu.Item>
                <Menu.Item>Hello: {this.props.a}</Menu.Item>
            </Menu>
        )
    }
}

function mapStateToProps(state: {a: number}) {
    console.log("State is", state);
    return {
        a: state.a
    }
}

export default connect(mapStateToProps) (Navigation)
