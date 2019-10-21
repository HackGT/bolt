import React from 'react';
import {useQuery} from "@apollo/react-hooks";
import {ALL_ITEMS} from "../util/graphql/Queries";
import {Header} from "semantic-ui-react";
import {ItemByLocation} from "../../types/Hardware";
import HardwareLocationContents from "./HardwareLocationContents";

const NewHardwareList = () => {
    const {data, loading, error} = useQuery(ALL_ITEMS);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error.message}</p>;
    }
    return (
        <div>
            <Header size={"huge"}>Inventory</Header>
            {data.allItems.map((itemsByLocation: ItemByLocation) =>
                <HardwareLocationContents itemsByLocation={itemsByLocation}/>
            )
            }
        </div>
    );
};

export default NewHardwareList;
