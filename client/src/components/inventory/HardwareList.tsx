import React from "react";
import HardwareItem from "./HardwareItem";
import {Accordion, Button, Grid, Header, Icon, Input, Item, Message, Segment} from "semantic-ui-react";
import PlaceholderItem from "./PlaceholderItem";
import {connect} from "react-redux";
import {HwItem, ItemByCat, ItemByLocation, RequestedItem} from "../../types/Hardware";
import {Link} from "react-router-dom";
import {User} from "../../types/User";
import {AppState} from "../../state/Store";
import {Query} from "@apollo/react-components";
import {ALL_ITEMS} from "../util/graphql/Queries";

export interface OwnProps {
    requestsEnabled: boolean;
    handleAddItem: (item: RequestedItem) => void;
    qtyUpdate: RequestedItem | null;
}

interface StateProps {
    user: User | null;
}

type ItemsListState = {
    isLoading: boolean;
    activeIndices: number[];
    searchQuery: string;
    categories: string[];
};

type Props = StateProps & OwnProps;

export class HardwareList extends React.Component<Props, ItemsListState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            activeIndices: [0],
            searchQuery: "",
            categories: []
        };
    }

    handleClick(e: any, titleProps: any): void {
        const {index} = titleProps;
        const {activeIndices} = this.state;
        const newIndex = activeIndices;
        const currentIndexPosition = activeIndices.indexOf(index);
        if (currentIndexPosition > -1) {
            newIndex.splice(currentIndexPosition, 1);
        } else {
            newIndex.push(index);
        }

        this.setState({activeIndices: newIndex});
    };

    private containsSearchQuery(item: HwItem) {
        const query: string = this.state.searchQuery;
        return item.item_name.toLowerCase().includes(query)
            || item.description.toLowerCase().includes(query);
    }


    public render() {
        let noRequestsMessageText = "";
        if (!this.props.requestsEnabled) {
            noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
        } else if (this.props.requestsEnabled && !this.props.user) {
            noRequestsMessageText = "Sign in to request hardware.";
        }

        const addItemLink = (this.props.user && this.props.user.admin ?
            <Button primary icon labelPosition='left' as={Link} to="/admin/items/new"> <Icon
                name='plus circle'/> Create item </Button> : "");

        const noRequestsMessage = !this.props.requestsEnabled || !this.props.user ? (
            <Message
                title="View-only inventory"
                warning icon>
                <Icon name="warning sign"/>
                {noRequestsMessageText}
            </Message>) : "";

        const query = <Query
            query={ALL_ITEMS}>
            {({loading, error, data}: any) => {
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
                    console.error(error);
                    return <Message negative>
                        <Message.Header>Error displaying hardware
                            inventory</Message.Header>
                        <p>Try refreshing the page. If that doesn't work,
                            contact a member of the HackGT Team for
                            assistance.</p>
                    </Message>;
                }

                let normalContent = (
                    <Message>
                        <Message.Header>Oops, there are no items!</Message.Header>
                        <p>Well, this is awkward.</p>
                        {this.props.user && this.props.user.admin &&
                        <Button as={Link} to="/admin/items/new">Create your
                            first item</Button>}
                    </Message>
                );

                if (data && data.allItems.length > 0) {
                    console.log(data);
                    data.allItems.sort((a: ItemByLocation, b: ItemByLocation) => {
                        return a.location.location_name.toLocaleLowerCase().localeCompare(b.location.location_name.toLocaleLowerCase());
                    });

                    // Get a list of all items (across categories) to search through
                    const searchableItems = data.allItems.reduce((accumulator: any[], value: any) => accumulator.concat(value.items), []);

                    if (searchableItems.filter(((searchInput: HwItem) => this.containsSearchQuery(searchInput))).length === 0) {
                        return <Segment placeholder textAlign="center">
                            <Header icon>
                                <Icon name="frown outline"/>
                                No matching items were found
                            </Header>
                            If you're trying to find something specific, you can ask a staff member at the HackGT
                            hardware desk staff for help!
                        </Segment>;
                    }

                    normalContent = (
                        <Accordion>
                            {data.allItems.map((cat: ItemByCat, index: number) => {
                                const filtered = cat.items.filter(searchInput => this.containsSearchQuery(searchInput));

                                console.log(filtered);
                                // @ts-ignore
                                filtered.sort((a: any, b: any) => (b.qtyUnreserved > 0) - (a.qtyUnreserved > 0)
                                    || b.item_name - a.item_name
                                );
                                console.log(filtered);

                                    if (!filtered.length) {
                                        return "";
                                    }

                                    return (<div key={cat.category.category_id}>
                                        <Accordion.Title
                                            active={this.state.activeIndices.includes(index) || this.state.searchQuery.length >= 3}
                                            index={index}
                                            onClick={this.handleClick.bind(this)}>
                                            <Header as='h2' dividing>
                                                <Icon name='dropdown'/>
                                                {cat.category.category_name}
                                            </Header>
                                        </Accordion.Title>
                                        <Accordion.Content
                                            active={this.state.activeIndices.includes(index) || this.state.searchQuery.length >= 3}>
                                            <Item.Group>
                                                {filtered.map((it: HwItem) => <HardwareItem
                                                    item={it}
                                                    requestsEnabled={this.props.requestsEnabled && this.props.user}
                                                    key={it.id}
                                                    user={this.props.user}
                                                />)}
                                            </Item.Group>
                                        </Accordion.Content>
                                    </div>);

                                }
                            )
                            }
                        </Accordion>);
                }
                return normalContent;
            }}
        </Query>;

        const searchBar = this.props.user &&
            (<Input type="text"
                    label="Search items"
                    onChange={(e, {value}) => {
                        if (value.length >= 3) {
                            this.setState({
                                searchQuery: value.trim().toLowerCase()
                            });
                        } else {
                            this.setState({searchQuery: ""});
                        }
                    }
                    }
            />);

        return (
            <div>
                <Grid columns='equal' padded>
                    <Grid.Column>
                        <Header as="h1">Inventory</Header>
                    </Grid.Column>
                    <Grid.Column>
                        {addItemLink}
                    </Grid.Column>
                </Grid>
                <Grid columns='equal' padded>
                    <Grid.Column width={11}>
                        {searchBar}
                    </Grid.Column>
                </Grid>
                {noRequestsMessage}
                {query}
            </div>);
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(mapStateToProps)(HardwareList);
