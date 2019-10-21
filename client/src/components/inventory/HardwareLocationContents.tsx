import React, {useState} from 'react';
import HardwareLocation from "./HardwareLocation";
import {Accordion, Divider, Header, Icon} from "semantic-ui-react";
import {ItemByCat, ItemByLocation} from "../../types/Hardware";
import HardwareCategory from "./HardwareCategory";

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

const HardwareLocationContents = ({itemsByLocation}: { itemsByLocation: ItemByLocation }) => {
    const [accordionState, setAccordionState] = useState([0]);

    return (
        <div style={{
            marginTop: 10
        }}>
            <HardwareLocation location_name={itemsByLocation.location.location_name}/>
            <Accordion>
                {itemsByLocation.categories.map((itemByCat: ItemByCat, index: number) => <>
                    <Accordion.Title active={accordionState.includes(index)}
                                     index={index}
                                     onClick={(e: any, titleProps: any) => {
                                         handleClick(e, titleProps, accordionState, setAccordionState);
                                     }}
                    >
                        <Header size={"medium"}>
                            <Icon name='dropdown'/>
                            {itemByCat.category.category_name}
                        </Header>
                    </Accordion.Title>
                    <Accordion.Content active={accordionState.includes(index)} index={index}>
                        <HardwareCategory key={itemByCat.category.category_id}
                                          items={itemByCat.items}
                                          name={itemByCat.category.category_name}/>
                    </Accordion.Content>
                </>)}
            </Accordion>
            <Divider/>
        </div>
    );
};

export default HardwareLocationContents;
