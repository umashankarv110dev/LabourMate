import { Item } from "../types/item";

export const calculateItemTotal = (
  item: Item
) => {

  if (
    item.showSize &&
    item.showQty &&
    item.showRate
  ) {

    return (
      Number(item.size || 0) *
      Number(item.qty || 0) *
      Number(item.rate || 0)
    );

  }

  return Number(item.total || 0);

};

export const calculateGrandTotal = (
  items: Item[]
) => {

  return items.reduce((sum,item)=>{

    return sum + calculateItemTotal(item);

  },0);

};