import React from "react";
import { Button, Card, Container, Label, Icon, Segment, Divider } from "semantic-ui-react";
import { withToastManager } from "react-toast-notifications";
import { connect } from "react-redux";
import {bindActionCreators, compose} from "redux";
import { User, updateRequestStatus } from "../../actions/";
import { RequestedItem, ItemStatus } from "../inventory/HardwareItem";
import { StatusToString, StatusToColor } from "../../enums";

interface RequestsListsPassedProps {
    filter: string;
}

type RequestsListProps = {
    requests: RequestedItem[],
    users: User[],
} & RequestsListsPassedProps;

class AdminRequestsPanel extends React.Component<RequestsListProps> {
    // Not pure due to react-ts issues
    constructor(props: any) {
        super(props);
    }

    public render() {
        const { filter, requests, users } = this.props;

        const nameRegex = new RegExp(filter, "i");
        const filteredNames = users.filter(user => nameRegex.test(user.name)).map(user => user.uuid);
        const filteredRequests = requests.filter(request =>
            filteredNames.includes(request.user) && request.status !== ItemStatus.RETURNED);
        const usernames: {[key: string]: string} = {
            "1a": "Joel"
        }; // this should be a part of redux, or something, not doing until api is clear
        const noReqString = requests.length === 0 ? "All done here!" : "No requests for this filter!";
        const noReq = (
            <Container style={styles.empty} textAlign="center">
                <Icon size="huge" color="green" name="check"/> {noReqString}
            </Container>
        );
        // Slight performance concerns here
        return (
            <Container id="checkin-requests-list" style={styles.listContainer}>
                {filteredRequests.length === 0 ? noReq :
                    filteredRequests.map(req => (
                        <AdminRequestWrapped key={req.id} request={req} requester={usernames[req.user]}/>)
                )}
            </Container>
        );
    }
}


interface RequestPassedProps {
    request: RequestedItem;
    requester: string;
}

type RequestProps = {
    updateRequestStatus: any,
    toastManager: any
} & RequestPassedProps;

interface RequestState {
    loading: boolean;
}

class AdminRequest extends React.Component<RequestProps, RequestState> {
    constructor(props: RequestProps) {
        super(props);
        this.state = {
            loading: false
        };
    }

    public updateStatusFactory = (status: ItemStatus) => {
        const { request, updateRequestStatus, toastManager } = this.props;
        return () => {
            this.setState({
                loading: true
            });
            updateRequestStatus(request.id, status)
            .then(() => {
                this.setState({
                    loading: false
                }); // TODO: update shouldComponentUpdate in CheckinContainer as optimization
                toastManager.add(`Request marked ${StatusToString(status)}`, {
                    appearance: "success",
                    autoDismiss: true,
                    placement: "top-center"
                });
            })
            .catch((err: string) => {
                toastManager.add("Something went wrong", {
                    appearance: "error",
                    autoDismiss: true,
                    placement: "top-center"
                });
                console.error(err);
            });
        };
    }

    public render() {
        const { request: item, requester } = this.props;
        return (
            <Card fluid style={styles.request}>
                <Card.Content>
                    <Card.Header>{item.name} </Card.Header>
                    <Card.Meta>
                        Quantity: <Label circular color="blue">{item.qtyRequested}</Label>,
                        Requested by: {requester}
                    </Card.Meta>
                    <Card.Description>
                        Status:  <Label basic color={StatusToColor(item.status)}>{StatusToString(item.status)}</Label>
                        <Divider />
                        Actions: <br/>
                        <Button.Group>
                            <Button style={styles.button} color={StatusToColor(ItemStatus.RETURNED)} onClick={this.updateStatusFactory(ItemStatus.RETURNED)}>
                                Returned
                            </Button>
                            <Button.Or />
                            <Button basic style={styles.button} color={StatusToColor(ItemStatus.LOST)} onClick={this.updateStatusFactory(ItemStatus.LOST)}>
                                Lost
                            </Button>
                            <Button.Or />
                            <Button basic style={styles.button} color={StatusToColor(ItemStatus.DAMAGED)} onClick={this.updateStatusFactory(ItemStatus.DAMAGED)}>
                                Damaged
                            </Button>
                        </Button.Group>
                    </Card.Description>
                </Card.Content>
            </Card>
        );
    }
}

const styles = {
    button: {
        minWidth: "100px",
        maxWidth: "120px"
    },
    buttonSegment: {
        padding: "10px"
    },
    empty: {
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    listContainer: {
        display: "flex",
        flexWrap: "wrap"
    },
    request: {
        maxWidth: "350px"
    }
};

const mapStateToListProps = (state: any, ownProps: RequestsListsPassedProps) => {
    const { requests, users } = state;
    return { requests, users };
};

const mapStateToRequestProps = (state: any, ownProps: RequestPassedProps) => ({});
const mapDispatchToRequestProps = (dispatch: any) => bindActionCreators({
    updateRequestStatus
}, dispatch);

const AdminRequestWrapped = compose(connect(mapStateToRequestProps, mapDispatchToRequestProps), withToastManager)(AdminRequest);
export default connect(mapStateToListProps)(AdminRequestsPanel);
