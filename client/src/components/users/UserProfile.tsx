import React, {ChangeEvent, Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {Button, Form, Header, Message, Popup} from "semantic-ui-react";
import {User} from "../../actions";
import {FullUser} from "../admin/AdminUsersListTable";

type UserProfileProps = {
    user: User | null;
    preloadUser: FullUser;
};

interface StateProps {
    user: User | null;
}

type Props = UserProfileProps & StateProps;

type UserProfileState = {
    user: FullUser
};

class UserProfile extends Component<Props, UserProfileState> {
    constructor(props: Props) {
        super(props);
        console.log(this.props.preloadUser);
        this.state = {
            user: this.props.preloadUser
        };
    }

    public handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        let value: string | number = target.value;
        const name = target.name;
        const inputType = target.type;

        // Convert number input values to numbers
        if (inputType === "number") {
            value = Number.parseFloat(value);
        }

        // @ts-ignore
        this.setState({
            user: {
                [name]: value
            }
        });
    };

    public render() {
        const isAdmin: boolean = !!this.props.user && this.props.user.admin;
        const adminHeader = isAdmin ? <Header size="medium">User Administration</Header> : "";
        const haveId = isAdmin ? <Popup inverted={true} trigger={<Form.Checkbox name="haveId"
                                                                                label="Have ID"
                                                                                checked={this.state.user.haveID}
            />}
                                        content="Whether the hardware desk currently has possession of this user's photo ID as collateral"/>
            : "";
        const userIsAdmin = isAdmin ? <Popup inverted={true} trigger={<Form.Checkbox label="Admin"
                                                                                     name="admin"
                                                                                     checked={this.state.user.admin}
            />}
                                             content="Whether this user can access administration pages like this one"/>
            : "";

        return (
            <Form loading={false}
                  onChange={this.handleInputChange}
                  error={false}
            >
                <Message error header="Missing required fields"
                         content="To update your profile, you must complete the fields highlighted in red below."/>

                <Header size="large">Contact Information</Header>
                <Form.Input width={6}
                            type="text"
                            label="Slack username"
                            required
                            value={this.state.user.slackUsername}/>
                <Form.Input width={6}
                            type="text"
                            label="Phone number"
                            required
                            value={this.state.user.phone}/>
                <Header size="large">About You</Header>
                <Message>
                    <Message.Content>
                        These details are provided by the <a href="https://login.hack.gt">HackGT Login Service</a>.
                        Please <a href="mailto:hello@hack.gt">contact us</a> if any of these details are inaccurate.
                    </Message.Content>
                </Message>
                <Form.Field width={6}>
                    <label>Full name</label>
                    <p>{this.state.user.name}</p>
                </Form.Field>
                <Form.Field width={6}>
                    <label>Email address</label>
                    <p>{this.state.user.email}</p>
                </Form.Field>

                {adminHeader}
                {haveId}
                {userIsAdmin}

                <Button primary
                        type="submit">Save profile</Button>

            </Form>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(
    mapStateToProps
)(UserProfile);
