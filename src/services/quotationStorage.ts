import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quotation } from "../types/quotation";

const KEY = "QUOTATIONS";

export const getQuotations = async () => {
  const data = await AsyncStorage.getItem(KEY);

  return data
  ? (JSON.parse(data) as Quotation[])
  : [];
};

export const saveQuotation = async (
  quotation: Quotation
) => {

  const quotations =
    await getQuotations();

  const exists = quotations.find(
    (q: any) => q.id === quotation.id
  );

  if (exists) {
    return false;
  }

  quotations.unshift(quotation);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(quotations)
  );

  return true;
};

export const deleteQuotation =
async (id:string)=>{

const quotations=
await getQuotations();

const filtered=
quotations.filter(
(item:any)=>item.id!==id
);

await AsyncStorage.setItem(
KEY,
JSON.stringify(filtered)
);

};

export const updateQuotation =
async(updated: Quotation)=>{

const quotations=
await getQuotations();

const list=
quotations.map((q:any)=>

q.id===updated.id
?updated
:q

);

await AsyncStorage.setItem(
KEY,
JSON.stringify(list)
);

};