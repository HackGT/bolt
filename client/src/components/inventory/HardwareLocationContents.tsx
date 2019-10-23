import React, {useState} from 'react';
import HardwareLocation from "./HardwareLocation";
import {Accordion, Divider, Header, Icon} from "semantic-ui-react";
import {HwItem, ItemByCat, ItemByLocation} from "../../types/Hardware";
import HardwareCategory from "./HardwareCategory";
import NoItemsFound from "./NoItemsFound";
import {AppState} from "../../state/Store";
import {connect} from "react-redux";

function handleClick(e: any, titleProps: any, accordionState: any, setAccordionState: any): void {
    const {index} = titleProps;
    const accordionStateClone = accordionState.slice(0);

    if (accordionStateClone.indexOf(index) > -1) {
        accordionStateClone.splice(accordionStateClone.indexOf(index), 1);
    } else {
        accordionStateClone.push(index);
    }

    setAccordionState(accordionStateClone);

}

function filteredItems(items: HwItem[], searchQuery: string): HwItem[] {
    return items.filter((item: HwItem) => item.item_name.toLowerCase().includes(searchQuery));
}

function combinedAndFilteredItemsByCategory(categories: any, searchQuery: string): HwItem[] {
    return filteredItems(categories.reduce((acc: any, val: any) => acc.concat(val.items), []), searchQuery);
}

interface HardwareListProps {
    itemsByLocation: ItemByLocation,
    searchQuery: string,
    requestsEnabled: boolean
}

const HardwareLocationContents = ({itemsByLocation, searchQuery, requestsEnabled}: HardwareListProps) => {
    const [accordionState, setAccordionState] = useState([0]);

    return (
        <div style={{
            marginTop: 10
        }}>
            <HardwareLocation location_name={itemsByLocation.location.location_name}/>
            <Accordion>
                {console.log("ibl", itemsByLocation)}
                {itemsByLocation.categories.map((itemByCat: ItemByCat, index: number) => <>
                    {console.log("location:", itemsByLocation.location.location_name, filteredItems(itemByCat.items, searchQuery))}
                    {filteredItems(itemByCat.items, searchQuery).length ? <>
                        <Accordion.Title key={`${index}-title`}
                                         active={accordionState.includes(index) || searchQuery.length >= 3}
                                         index={index}
                                         onClick={(e: any, titleProps: any) => {
                                             handleClick(e, titleProps, accordionState, setAccordionState);
                                         }}>
                            <Header size={"medium"}>
                                <Icon name='dropdown'/>
                                {itemByCat.category.category_name}
                            </Header>
                        </Accordion.Title>
                        <Accordion.Content key={`${index}-content`}
                                           active={accordionState.includes(index) || searchQuery.length >= 3}
                                           index={index}>
                            <HardwareCategory key={itemByCat.category.category_id}
                                              items={filteredItems(itemByCat.items, searchQuery)}
                                              requestsEnabled={requestsEnabled}
                                              name={itemByCat.category.category_name}/>
                        </Accordion.Content></> : ""}
                </>)}
                {(!itemsByLocation.categories.length
                    || !combinedAndFilteredItemsByCategory(itemsByLocation.categories, searchQuery).length) &&
                <NoItemsFound searchQuery={searchQuery}/>}
            </Accordion>
            <Divider/>
        </div>
    );
};

function mapStateToProps(state: AppState) {
    return {
        user: state.account
    };
}

export default connect(mapStateToProps)(HardwareLocationContents);
