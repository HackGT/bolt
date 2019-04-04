import React from "react";
import {Container, Header} from 'semantic-ui-react';
import { withToastManager } from "react-toast-notifications";
import {withRouter} from "react-router-dom";
import { connect } from 'react-redux'
import {bindActionCreators, compose} from "redux";
import { fetchRequestsAndUsers } from '../../actions/';

interface CheckinContainerProps {
    toastManager: any,
    fetchRequestsAndUsers: any
}

interface CheckinContainerState {
    loading: boolean
}

class CheckinContainer extends React.Component<CheckinContainerProps, CheckinContainerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentWillMount() { // Refresh store
        const { fetchRequestsAndUsers } = this.props;
        this.setState({
            loading: true
        });
        fetchRequestsAndUsers();
    }

    componentDidUpdate() {
        const { loading } = this.state;
        if (loading) {
            this.setState({loading: false});    
        }
    }

    /* 
     * Plan: Two views, a search for users, and a search for requests (filtered by name)
     * User search is kind of optional, but brings up a face if necessary (Another milestone) 
    **/
    render() {
        const { loading } = this.state;

        const loadingState = (
            <Container>
                Loading
            </Container>
        );

        const loadedState = (
            <Container>
                Loaded
            </Container>
        );

        return (
            <div id="checkin-wrapper">
                <Header>
                    Item Checkin Return
                </Header>
                {loading ? loadingState : loadedState}
            </div>
        );
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
