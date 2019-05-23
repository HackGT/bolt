import React from "react";
import {Container, Dimmer, Header, Input, Loader, Segment, Divider} from 'semantic-ui-react';
import { withToastManager } from "react-toast-notifications";
import {withRouter} from "react-router-dom";
import { connect } from 'react-redux'
import {bindActionCreators, compose} from "redux";
import { fetchRequestsAndUsers } from '../../actions/';
import AdminRequests from "./AdminRequests";

interface CheckinContainerProps {
    toastManager: any,
    fetchRequestsAndUsers: any
}

interface CheckinContainerState {
    loading: boolean,
    search: string
}

class CheckinContainer extends React.Component<CheckinContainerProps, CheckinContainerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: false,
            search: ""
        };
    }

    componentWillMount() {
        const { fetchRequestsAndUsers } = this.props;
        this.setState({
            loading: true
        });
        fetchRequestsAndUsers();
    }

    componentDidUpdate() {
        const { loading } = this.state; // TODO: error handling
        if (loading) {
            this.setState({loading: false});    
        }
    }

    updateFilter = (e: any) => {
        this.setState({
            search: e.target.value.trim()
        });
    }
    /* 
     * TODO: User's profile pulls up on the side
    **/
    render() {
        const { loading, search } = this.state;

        const RequestsWrapper = (
            <Container>
                <Segment attached>
                    <Input 
                        value={search} onChange={this.updateFilter}
                        placeholder="Name..."
                        label="Filter by Requester"
                    />
                </Segment>
                <Segment attached>
                    <Dimmer active={loading} inverted>
                        <Loader inverted>Checking it Twice...</Loader>
                    </Dimmer>
                    { loading ? <div style={styles.empty}></div> : <AdminRequests filter={search} /> }
                </Segment>
            </Container>
        );

        return (
            <Container id="checkin-wrapper">
                <Segment>
                    <Header>
                        Item Checkin Return
                    </Header>
                </Segment>
                { RequestsWrapper }
            </Container>
        );
    }
}

const styles = {
    empty: {
        height: '200px',
    }
}

const mapStateToProps = (state: any) => {
    const { requests, users } = state;
    return { requests, users };
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    fetchRequestsAndUsers
}, dispatch)
  
export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps), withToastManager)(CheckinContainer);
