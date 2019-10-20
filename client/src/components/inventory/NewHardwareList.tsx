import React from 'react';
import {useQuery} from "@apollo/react-hooks";
import {ALL_ITEMS} from "../util/graphql/Queries";
import {Header, Icon} from "semantic-ui-react";
import {ItemByCat} from "../../types/Hardware";
import HardwareCategory from "./HardwareCategory";

const NewHardwareList = () => {
    const {data, loading, error} = useQuery(ALL_ITEMS);
    console.log(data);

    if (loading) {
        return <p>Loading...</p>;
    }
    return (
        <div>
            <Header size={"huge"}>Inventory</Header>
            {data.allItems.map((elem: any) =>
                <>
                    <Header><Icon name={"building"}/>{elem.location.location_name}</Header>
                    <p>These items are available from {elem.location.location_name}. Pick them up and return them
                        there.</p>
                    {elem.categories.map((itemByCat: ItemByCat) => <HardwareCategory
                        name={itemByCat.category.category_name}/>)}
                </>
            )
            }
        </div>
    );
};

export default NewHardwareList;
