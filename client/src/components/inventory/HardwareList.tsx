import React from "react";
import HardwareItem from "./HardwareItem";
import {
    Button,
    Header,
    Icon,
    Item,
    Message,
    Accordion,
    Menu,
    Input,
    Grid, Table, Dropdown
} from "semantic-ui-react";
import PlaceholderItem from "./PlaceholderItem";
import {connect} from "react-redux";
import {HwItem, ItemByCat, RequestedItem} from "../../types/Hardware";
import {Link} from "react-router-dom";
import {FullUser, User} from "../../types/User";
import {AppState} from "../../state/Store";
import {Query} from "@apollo/react-components";
import {ALL_CATEGORIES, ALL_ITEMS} from "../util/graphql/Queries";

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
            activeIndices: [1],
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
        let res = item.item_name.toLowerCase().indexOf(query) !== -1
            || item.category.toLowerCase().indexOf(query) !== -1;
        return res;
    }


    public render() {
        let noRequestsMessageText = "";
        if (!this.props.requestsEnabled) {
            noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
        } else if (this.props.requestsEnabled && !this.props.user) {
            noRequestsMessageText = "Sign in to request hardware.";
        }

        const addItemLink = (this.props.user && this.props.user.admin ?
            <Button primary icon labelPosition='left'> <Icon
                name='plus circle'/> Create Item </Button> : "")

        const noRequestsMessage = !this.props.requestsEnabled || !this.props.user ? (
            <Message
                title="View-only inventory"
                warning icon>
                <Icon name="warning sign"/>
                {noRequestsMessageText}
            </Message>) : "";

        const filterButton = <Query
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
                    return <Message negative>
                        <Message.Header>Error displaying hardware
                            inventory</Message.Header>
                        <p>Try refreshing the page. If that doesn't work,
                            contact a member of the HackGT Team for
                            assistance.</p>
                    </Message>;
                }

                let filterButton = (
                    <Dropdown
                        text='Filter'
                        icon='filter'
                        floating
                        labeled
                        button
                        className='icon'
                    >
                        <Dropdown.Menu>
                            <Dropdown.Header icon='tags'
                                             content='Filter by category'/>
                            <Dropdown.Divider/>
                        </Dropdown.Menu>
                    </Dropdown>);

                if (data && data.allItems.length > 0) {
                    filterButton = (
                        <Dropdown
                            text='Filter'
                            icon='filter'
                            floating
                            labeled
                            button
                            className='icon'
                        >
                            <Dropdown.Menu>
                                <Dropdown.Header icon='tags'
                                                 content='Filter by category'/>
                                <Dropdown.Menu scrolling>
                                    {data.allItems.map((cat: ItemByCat) => (
                                        <Dropdown.Item
                                            key={cat.category.category_id}
                                            text={cat.category.category_name}
                                            value={cat.category.category_name} {...cat} />
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown.Menu>
                        </Dropdown>)
                }
                return (filterButton);
            }}
        </Query>;

        const query = <Query
            query={ALL_ITEMS}>
            {({loading, error, data}: any) => {
                if (error) {
                    console.error(error);
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
                        <Message.Header>Error displaying hardware
                            inventory</Message.Header>
                        <p>Try refreshing the page. If that doesn't work,
                            contact a member of the HackGT Team for
                            assistance.</p>
                    </Message>;
                }

                let normalContent = (
                    <Message>
                        <Message.Header>Oops, there's no items!</Message.Header>
                        <p>Well, this is awkward.</p>
                        {this.props.user && this.props.user.admin ?
                            <Button as={Link} to="/admin/items/new">Create your
                                first item</Button> : ""}
                    </Message>
                );

                if (data && data.allItems.length > 0) {
                    data.allItems.sort((a: ItemByCat, b: ItemByCat) => {
                        return a.category.category_name.toLocaleLowerCase().localeCompare(b.category.category_name.toLocaleLowerCase())
                    });
                    data.allItems.map((cat: ItemByCat) =>
                        cat.items.sort((a: HwItem, b: HwItem) => {
                            return b.qtyInStock - a.qtyInStock;
                        })
                    );

                    var items = [];

                    for (var i = 0; i < data.allItems.length; i++) {
                        items.push(data.allItems[i].items);
                    }

                    items = [].concat.apply([], items);
                    if (items.filter((searchInput => this.containsSearchQuery(searchInput))).length == 0) {
                        normalContent = (
                            <Message>
                                <Message.Header>No items found</Message.Header>
                            </Message>
                        );
                        return normalContent;
                    }

                    normalContent = (
                        <Accordion>
                            {data.allItems.map((cat: ItemByCat) => (
                                <div key={cat.category.category_id}>
                                    <Accordion.Title
                                        active={this.state.activeIndices.includes(cat.category.category_id)}
                                        index={cat.category.category_id}
                                        onClick={this.handleClick.bind(this)}>
                                        <Header as='h2' dividing>
                                            <Icon name='dropdown'/>
                                            {cat.category.category_name}
                                        </Header>
                                    </Accordion.Title>
                                    <Accordion.Content
                                        active={this.state.activeIndices.includes(cat.category.category_id)}>
                                        <Item.Group>
                                            {cat.items.filter((searchInput => this.containsSearchQuery(searchInput))).map((it: HwItem) => {
                                                return (<HardwareItem
                                                    item_name={it.item_name}
                                                    description={it.description}
                                                    imageURL={it.imageUrl}
                                                    requestsEnabled={this.props.requestsEnabled && this.props.user}
                                                    totalAvailable={it.totalAvailable}
                                                    maxRequestQty={it.maxRequestQty}
                                                    qtyUnreserved={it.qtyUnreserved}
                                                    category={it.category}
                                                    key={it.id}
                                                    id={it.id}
                                                    addItem={this.props.handleAddItem} // prop that invokes the handleAddItem method of parent container to update its state
                                                    qtyUpdate={this.props.qtyUpdate} // this prop is the object whose request has been cancelled
                                                    user={this.props.user}
                                                />);
                                            })
                                            }
                                        </Item.Group>
                                    </Accordion.Content>
                                </div>

                            ))}
                        </Accordion>);
                }
                return (normalContent);
            }}
        </Query>;

        const searchBar = this.props.user ? (
            <Input type="text"
                   label="Search items"
                   name="searchQuery"
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
            />) : "";

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
                    <Grid.Column width={10}>
                        {searchBar}
                    </Grid.Column>
                    <Grid.Column>
                        {filterButton}
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
