import React from "react";
import HardwareItem from "./HardwareItem";
import {Header, Icon, Item, Message} from "semantic-ui-react";
import PlaceholderItem from "./PlaceholderItem";
import {RequestedItem} from "../inventory/HardwareItem";
import {AppState} from "../../reducers/reducers";
import {connect} from "react-redux";
import {User} from "../../actions/actions";
import Query from "react-apollo/Query";
import {HwItem} from "../../types/ItemType";
import gql from "graphql-tag";

export interface OwnProps {
    requestsEnabled: boolean;
    handleAddItem: (item: RequestedItem) => void;
    qtyUpdate: RequestedItem | null;
}

interface StateProps {
    user: User|null;
}

type Props = StateProps & OwnProps;

export class HardwareList extends React.Component<Props, { isLoading: boolean }> {

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true
        };
    }


    public render() {

        let noRequestsMessageText = "";
        if (!this.props.requestsEnabled) {
            noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
        } else if (this.props.requestsEnabled && !this.props.user) {
            noRequestsMessageText = "Sign in to request hardware.";
        }

        console.log(this.props.requestsEnabled);
        const noRequestsMessage = !this.props.requestsEnabled || !this.props.user ? (<Message
            title="View-only inventory"
            warning icon>
            <Icon name="warning sign"/>
            {noRequestsMessageText}
        </Message>) : "";

        const query = <Query
            query={gql`
                        query {
                            items {
                                id
                                item_name
                                description
                                imageUrl
                                category
                                totalAvailable
                                maxRequestQty
                                hidden
                                approvalRequired
                                returnRequired
                                owner
                            }
                        }
                    `}>
            {({loading, error, data}: any) => {
                if (error) {
                    console.log("error", error);
                }
                // TODO: come back to this
                if (loading) {
                    return (
                        <Item.Group>
                            <PlaceholderItem/>
                            <PlaceholderItem/>
                            <PlaceholderItem/>
                        </Item.Group>
                    );
                }
                if (error) {
                    return <Message negative>
                        <Message.Header>Error displaying hardware inventory</Message.Header>
                        <p>Try refreshing the page. If that doesn't work, contact a member of the HackGT Team for
                            assistance.</p>
                    </Message>;
                }

                let normalContent = (
                    <Message>
                        <Message.Header>Oops, there's no items!</Message.Header>
                        <p>Well, this is awkward.</p>
                    </Message>
                );

                if (data && data.items) {
                    data.items.sort((a: HwItem, b: HwItem) => {
                        return a.category.toLocaleLowerCase().localeCompare(b.category.toLocaleLowerCase())
                            || a.item_name.toLocaleLowerCase().localeCompare(b.item_name.toLocaleLowerCase());
                    });

                    normalContent = (<Item.Group>
                        {data.items.map((item: HwItem) => (
                            <HardwareItem item_name={item.item_name}
                                          description={item.description}
                                          requestsEnabled={this.props.requestsEnabled && this.props.user}
                                          qtyRemaining={0}
                                          totalAvailable={item.totalAvailable}
                                          maxRequestQty={item.maxRequestQty}
                                          category={item.category}
                                          key={item.id}
                                          id={item.id}
                                          addItem={this.props.handleAddItem} // prop that invokes the handleAddItem method of parent container to update its state
                                          qtyUpdate={this.props.qtyUpdate} // this prop is the object whose request has been cancelled
                                          user={this.props.user}
                            />))}
                    </Item.Group>);
                }
                console.log(data.items);
                return normalContent;
            }}
        </Query>;

        return (
            <div>
                <Header>Inventory</Header>
                {noRequestsMessage}
                {query}
            </div>);
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}


export default connect(mapStateToProps) (HardwareList);
