import React, {ChangeEvent, Component, FormEvent, ReactNode} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {Button, CheckboxProps, Form, Header, Message, Popup} from "semantic-ui-react";
import {User} from "../../actions";
import {FullUser} from "../admin/AdminUsersListTable";
import Cleave from "cleave.js/react";
import {Link, Redirect} from "react-router-dom";
import Mutation from "react-apollo/Mutation";
import gql from "graphql-tag";

type UserProfileProps = {
    signedInUser: User | null;
    preloadUser: FullUser;
    toastManager: any;
};

interface StateProps {
    user: User | null;
}

type Props = UserProfileProps & StateProps;

type UserProfileState = {
    user: FullUser,
};

const UPDATE_USER = gql`
    mutation updateUser($uuid: String!, $updatedUser: UserUpdateInput!) {
        updateUser(uuid:$uuid, updatedUser:$updatedUser) {
            uuid
        }
    }

`;

class UserProfile extends Component<Props, UserProfileState> {
    constructor(props: Props) {
        super(props);
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
    }

    public render() {
        const isAdmin: boolean = !!this.props.signedInUser && this.props.signedInUser.admin;
        const adminHeader = isAdmin ? <Header size="medium">User Administration</Header> : "";
        const haveId = isAdmin ? <Popup inverted={true} trigger={<Form.Checkbox name="haveID"
                                                                                label="Have ID"
                                                                                checked={this.state.user.haveID}
                                                                                onChange={this.handleInputChangeCheckbox}
            />}
                                        content="Whether the hardware desk currently has possession of this user's photo ID as collateral"/>
            : "";

        let userIsAdmin: string | ReactNode = "";

        if (isAdmin) {
            userIsAdmin = <Form.Field>
                <Popup inverted={true} trigger={<Form.Checkbox label="Admin"
                                                               name="admin"
                                                               disabled={isAdmin && !this.adminEditingOtherUser()}
                                                               checked={this.state.user.admin}
                                                               onChange={this.handleInputChangeCheckbox}
                />}
                       content="Whether this user can access administration pages like this one"/>
                {isAdmin && !this.adminEditingOtherUser() ?
                    <Message content="You can't remove your own admin privileges."/> : ""}
            </Form.Field>;
        }

        const adminUuid = isAdmin ?
            <Form.Field width={6}>
                <label>UUID</label>
                <p>{this.state.user.uuid}</p>
            </Form.Field>
            : "";

        const backUrl = isAdmin ? "/admin/users" : "";

        let yourThis = "your profile";
        let pageTitle = "My Profile";
        let aboutYou = "About You";

        if (this.adminEditingOtherUser()) {
            yourThis = "this user";
            pageTitle = `Edit ${this.state.user.name}`;
            aboutYou = `About ${this.state.user.name}`;
        }

        return <div>
            <Header size="huge">{pageTitle}</Header>
            <Mutation mutation={UPDATE_USER}>
                {(submitForm: any, {loading, error, data}: any) => (

                    <Form loading={loading}
                          onChange={this.handleInputChange}
                          error={!this.validateForm()}
                          onSubmit={e => {
                              e.preventDefault();
                              const {toastManager} = this.props;

                              if (!this.state.user.slackUsername.length || !this.validatePhone()) {
                                  return;
                              }

                              const variables: any = {
                                  uuid: this.state.user.uuid,
                                  updatedUser: {
                                      phone: this.state.user.phone.trim(),
                                      slackUsername: this.state.user.slackUsername.trim(),
                                  }
                              };

                              // if the user saving is an admin
                              if (this.props.signedInUser && this.props.signedInUser.admin) {
                                  variables.updatedUser.admin = this.state.user.admin;
                                  variables.updatedUser.haveID = this.state.user.haveID;
                              }

                              const yourProfile = this.adminEditingOtherUser() ? "user" : "your profile";

                              submitForm({
                                  variables
                              }).then(() => {
                                  toastManager.add(`Successfully updated ${yourProfile}`, {
                                      appearance: "success",
                                      autoDismiss: true,
                                      placement: "top-center"
                                  });
                              }).catch((err: Error) => {
                                  let message = `Couldn't update ${yourProfile} because of an error: ${err.message}.  Check your internet connection.  If the problem persists, contact a member of the HackGT Team for assistance.`;

                                  if (err.message.indexOf("Network error") !== -1) {
                                      message = `It appears you are offline.  Please check your internet connection and then try again.`;
                                  }

                                  toastManager.add(message, {
                                      appearance: "error",
                                      autoDismiss: false,
                                      placement: "top-center"
                                  });
                              });
                          }}
                    >
                        {data && !error ? <Redirect to={backUrl}/> : ""}
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
                                 content={`To update ${yourThis}, you must correct the errors in the fields highlighted in red above.`}/>
                        <Button primary
                                disabled={!this.validateForm()}
                                type="submit">Save profile</Button>
                        <Button as={Link} to={backUrl} basic>Cancel</Button>

                    </Form>
                )}
            </Mutation>
        </div>;
    }

    private adminEditingOtherUser() {
        return this.props.signedInUser && this.props.signedInUser.admin && this.props.signedInUser.uuid !== this.state.user.uuid;
    }

    private validatePhone(): boolean {
        return (/^\((\d){3}\) (\d){3}-(\d){4}$/).test(this.state.user.phone);
    }

    private validateForm(): boolean {
        return this.validatePhone() && this.state.user.slackUsername.length > 0;
    }
}

function mapStateToProps(state: AppState) {
    return {
        signedInUser: state.user
    };
}

export default connect(
    mapStateToProps
)(UserProfile);
