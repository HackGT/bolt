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
};
