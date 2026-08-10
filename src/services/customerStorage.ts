import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer } from "../types/customer";

const KEY = "CUSTOMERS";

export const getCustomers = async (): Promise<Customer[]> => {
// await AsyncStorage.removeItem("CUSTOMERS");
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("Get Customers Error", e);
    return [];
  }
};

export const saveCustomers = async (
  customers: Customer[]
) => {
  try {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(customers)
    );
  } catch (e) {
    console.log("Save Customers Error", e);
  }
};

export const addCustomer = async (
  customerName: string,
  siteName: string
) => {

  const name = customerName.trim();
  const site = siteName.trim();

  if (!name) return;

  const customers = await getCustomers();

  const customerIndex = customers.findIndex(
    c =>
      c.customerName.trim().toLowerCase() ===
      name.toLowerCase()
  );

  if (customerIndex >= 0) {

    if (
      site &&
      !customers[customerIndex].sites.some(
        s =>
          s.name.trim().toLowerCase() ===
          site.toLowerCase()
      )
    ) {

      customers[customerIndex].sites.push({

        id: Date.now().toString(),

        name: site,

      });

    }

  } else {

    customers.push({

      id: Date.now().toString(),

      customerName: name,

      sites: site
        ? [
            {
              id: Date.now().toString(),
              name: site,
            },
          ]
        : [],

    });

  }

  await saveCustomers(customers);

};

export const searchCustomers = async (
  keyword: string
): Promise<Customer[]> => {

  const customers = await getCustomers();

  const search = keyword.trim().toLowerCase();

  if (!search) return [];

  return customers.filter(c =>
    c.customerName
      .toLowerCase()
      .includes(search)
  );

};

export const getCustomerByName = async (
  customerName: string
): Promise<Customer | null> => {

  const customers = await getCustomers();

  return (
    customers.find(
      c =>
        c.customerName.trim().toLowerCase() ===
        customerName.trim().toLowerCase()
    ) || null
  );

};