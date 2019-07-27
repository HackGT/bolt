import React, {ChangeEvent, Component, FormEvent} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {Button, CheckboxProps, Form, Header, Message, Popup} from "semantic-ui-react";
import {User} from "../../actions";
import {FullUser} from "../admin/AdminUsersListTable";
import Cleave from "cleave.js/react";
import {Link} from "react-router-dom";

type UserProfileProps = {
    user: User | null;
    preloadUser: FullUser;
};

interface StateProps {
    user: User | null;
}

type Props = UserProfileProps & StateProps;

type UserProfileState = {
    user: FullUser,
};

class UserProfile extends Component<Props, UserProfileState> {
    constructor(props: Props) {
        super(props);
        console.log(this.props.preloadUser);
        this.state = {
            user: this.props.preloadUser,
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
                ...this.state.user,
                [name]: value
            }
        });
    }

    public handleInputChangeCheckbox = (event: FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps): void => {
        if (checkboxProps && checkboxProps.name && typeof checkboxProps.checked !== "undefined") {
            const value: boolean = checkboxProps.checked;
            const name: string = checkboxProps.name;

            // @ts-ignore
            this.setState({
                user: {
                    ...this.state.user,
                    [name]: value
                }
            });
        }
    };

    public render() {
        const isAdmin: boolean = !!this.props.user && this.props.user.admin;
        const adminHeader = isAdmin ? <Header size="medium">User Administration</Header> : "";
        const haveId = isAdmin ? <Popup inverted={true} trigger={<Form.Checkbox name="haveID"
                                                                                label="Have ID"
                                                                                checked={this.state.user.haveID}
                                                                                onChange={this.handleInputChangeCheckbox}
            />}
                                        content="Whether the hardware desk currently has possession of this user's photo ID as collateral"/>
            : "";
        const userIsAdmin = isAdmin ? <Popup inverted={true} trigger={<Form.Checkbox label="Admin"
                                                                                     name="admin"
                                                                                     checked={this.state.user.admin}
                                                                                     onChange={this.handleInputChangeCheckbox}
            />}
                                             content="Whether this user can access administration pages like this one"/>
            : "";

        const adminUuid = isAdmin ?
            <Form.Field width={6}>
                <label>UUID</label>
                <p>{this.state.user.uuid}</p>
            </Form.Field>
            : "";

        let yourThis = "your";
        let pageTitle = "My Profile";
        let aboutYou = "About You";

        if (this.props.user && this.props.user.admin && this.props.user.uuid !== this.state.user.uuid) {
            yourThis = "this";
            pageTitle = `Edit ${this.state.user.name}`;
            aboutYou = `About ${this.state.user.name}`;
        }

        return <div>
            <Header size="huge">{pageTitle}</Header>
            <Form loading={false}
                  onChange={this.handleInputChange}
                  error={!this.validateForm()}
            >
                <Header size="large">Contact Information</Header>
                <Form.Field width={6}
                            error={!this.state.user.slackUsername.length}
                            required
                >
                    <label>Slack username</label>
                    <Form.Input type="text"
                                value={this.state.user.slackUsername}
                                name="slackUsername"
                                error={!this.state.user.slackUsername.length ? "This field is required" : null}
                                required/>
                </Form.Field>
                <Form.Field width={6} required error={!this.validatePhone()}>
                    <label>Phone number</label>
                    <Cleave
                        name="phone"
                        options={{
                            delimiters: ["(", ") ", "-"],
                            blocks: [0, 3, 3, 4],
                        }}
                        value={this.state.user.phone}/>
                    {this.validatePhone() ? "" :
                        <Message negative>Enter a valid US phone number without the country code</Message>}
                </Form.Field>
                <Header size="large">{aboutYou}</Header>
                <Message>
                    <Message.Content>
                        These details are provided by the <a href="https://login.hack.gt">HackGT Login
                        Service</a>. {isAdmin
                        ? "You may be able to change them there."
                        : <span>Please <a href="mailto:hello@hack.gt">contact us</a> if any of these details are inaccurate.</span>}
                    </Message.Content>
                </Message>
                {adminUuid}
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
                <Message error
                         content={`To update ${yourThis} profile, you must correct the errors in the fields highlighted in red above.`}/>
                <Button primary
                        disabled={!this.validateForm()}
                        type="submit">Save profile</Button>
                <Button as={Link} to={isAdmin ? "/admin/users" : ""} basic>Cancel</Button>

            </Form>
        </div>;
    }

    private validatePhone(): boolean {
        console.log("phone", this.state.user.phone);
        return (/^\((\d){3}\) (\d){3}-(\d){4}$/).test(this.state.user.phone);
    }

    private validateForm(): boolean {
        return this.validatePhone() && this.state.user.slackUsername.length > 0;
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
