export type HwItem = {
    id: number;
    item_name: string;
    description: string;
    imageUrl: string;
    category: string;
    totalAvailable: number;
    maxRequestQty: number;
    price: number;
    hidden: boolean;
    returnRequired: boolean;
    approvalRequired: boolean;
    owner: string;
    qtyUnreserved: number;
    qtyInstock: number;
};

// export interface Item {
//     id: number;
//     item_name: string;
//     description: string;
//     imageUrl: string;
//     category: string;
//     totalAvailable: number;
//     maxRequestQty: number;
//     hidden: boolean;
//     returnRequired: boolean;
//     approvalRequired: boolean;
//     qtyUnreserved: number;
// }

// export interface AdminItem extends Item {
//     price: number;
//     owner: string;
// }
