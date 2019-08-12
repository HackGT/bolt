import React, {Component} from "react";
import {connect} from "react-redux";
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "./CardList";
import SubmittedList from "./submitted/SubmittedList";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

class DeskContainer extends Component {
    public render() {
        return (
            <div>
                <Header size="huge">Hardware Desk</Header>
                <Grid stackable>
                    <Grid.Row columns={3}>
                        <SubmittedList/>
                        <CardList title="Ready to Prepare">
                            <Segment placeholder>
                                <Container textAlign="center">
                                    <Header>
                                        Nothing to prepare. Take a break!
                                    </Header>
                                </Container>
                            </Segment>
                        </CardList>
                        <CardList title="Ready for Pickup">
                            <Segment placeholder>
                                <Container textAlign="center">
                                    <Header>
                                        No requests awaiting pickup. Take a break!
                                    </Header>
                                </Container>
                            </Segment>
                        </CardList>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default connect(mapStateToProps)(DeskContainer);
