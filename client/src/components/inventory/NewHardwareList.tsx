import React, {useState} from 'react';
import {useQuery} from "@apollo/react-hooks";
import {ALL_ITEMS} from "../util/graphql/Queries";
import {Button, Grid, Header, Icon, Input} from "semantic-ui-react";
import {ItemByLocation} from "../../types/Hardware";
import HardwareLocationContents from "./HardwareLocationContents";
import {connect} from "react-redux";
import {AppState} from "../../state/Store";
import {User} from "../../types/User";
import {Link} from "react-router-dom";

const NewHardwareList = ({user}: { user: User | null }) => {
    const {data, loading, error} = useQuery(ALL_ITEMS);
    const [searchQuery, setSearchQuery] = useState("");
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error.message}</p>;
    }
    return (
        <div>
            <Header size={"huge"}>Inventory</Header>
            <Grid columns="equal">
                <Grid.Row>
                    <Grid.Column>
                        <Input type="text"
                               label="Search items"
                               onChange={(e: any, {value}: any) => {
                                   if (value.length >= 3) {
                                       setSearchQuery(value.trim().toLowerCase());
                                   } else {
                                       setSearchQuery("");
                                   }
                               }
                               }
                        />
                    </Grid.Column>
                </Grid.Row>
                {user && user.admin ?
                    <Grid.Row><Grid.Column><Button primary icon labelPosition='left' as={Link} to="/admin/items/new">
                        <Icon
                            name='plus circle'/> Create item </Button></Grid.Column></Grid.Row> : ""}
            </Grid>
            {data.allItems.map((itemsByLocation: ItemByLocation) =>
                <HardwareLocationContents key={itemsByLocation.location.location_id}
                                          itemsByLocation={itemsByLocation} searchQuery={searchQuery}/>
            )
            }
        </div>
    );
};

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(mapStateToProps)(NewHardwareList);
