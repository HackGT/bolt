import React, { useState } from "react";
import { Accordion, Divider, Header, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import HardwareLocation from "./HardwareLocation";
import { Item, ItemByCat, ItemByLocation } from "../../types/Hardware";
import HardwareCategory from "./HardwareCategory";
import NoItemsFound from "./NoItemsFound";
import { AppState } from "../../state/Store";

function handleClick(e: any, titleProps: any, accordionState: any, setAccordionState: any): void {
  const { index } = titleProps;
  const accordionStateClone = accordionState.slice(0);

  if (accordionStateClone.indexOf(index) > -1) {
    accordionStateClone.splice(accordionStateClone.indexOf(index), 1);
  } else {
    accordionStateClone.push(index);
  }

  setAccordionState(accordionStateClone);
}

function filteredItems(items: Item[], searchQuery: string): Item[] {
  return items.filter((item: Item) => item.name.toLowerCase().includes(searchQuery));
}

function combinedAndFilteredItemsByCategory(categories: any, searchQuery: string): Item[] {
  return filteredItems(
    categories.reduce((acc: any, val: any) => acc.concat(val.items), []),
    searchQuery
  );
}

interface HardwareListProps {
  itemsByLocation: ItemByLocation;
  searchQuery: string;
  requestsEnabled: boolean;
}

const HardwareLocationContents = ({
  itemsByLocation,
  searchQuery,
  requestsEnabled,
}: HardwareListProps) => {
  const [accordionState, setAccordionState] = useState([0]);

  return (
    <div
      style={{
        marginTop: 10,
      }}
    >
      <HardwareLocation
        key={`${itemsByLocation.location.id}-hardware_loc`}
        name={itemsByLocation.location.name}
      />
      <Accordion key={`${itemsByLocation.location.id}-accordion`}>
        {itemsByLocation.categories.map((itemByCat: ItemByCat, index: number) => (
          <>
            {filteredItems(itemByCat.items, searchQuery).length ? (
              <>
                <Accordion.Title
                  key={`${itemsByLocation.location.id}-title`}
                  active={accordionState.includes(index) || searchQuery.length >= 3}
                  index={index}
                  onClick={(e: any, titleProps: any) => {
                    handleClick(e, titleProps, accordionState, setAccordionState);
                  }}
                >
                  <Header size="medium">
                    <Icon name="dropdown" />
                    {itemByCat.category.name}
                  </Header>
                </Accordion.Title>
                <Accordion.Content
                  key={`${itemsByLocation.location.id}-content`}
                  active={accordionState.includes(index) || searchQuery.length >= 3}
                  index={index}
                >
                  <HardwareCategory
                    key={`${itemsByLocation.location.id}-${itemByCat.category.id}`}
                    items={filteredItems(itemByCat.items, searchQuery)}
                    requestsEnabled={requestsEnabled}
                    name={itemByCat.category.name}
                  />
                </Accordion.Content>
              </>
            ) : (
              ""
            )}
          </>
        ))}
        {(!itemsByLocation.categories.length ||
          !combinedAndFilteredItemsByCategory(itemsByLocation.categories, searchQuery).length) && (
          <NoItemsFound key={`${itemsByLocation.location.id}-no_items`} searchQuery={searchQuery} />
        )}
      </Accordion>
      <Divider />
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(HardwareLocationContents);
