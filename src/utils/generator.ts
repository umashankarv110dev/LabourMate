export const generateQuotationNo = () => {

  const date = new Date();

  const yyyy = date.getFullYear();

  const mm = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const dd = String(
    date.getDate()
  ).padStart(2, "0");

  return `QT-${yyyy}${mm}${dd}-${Date.now()
    .toString()
    .slice(-3)}`;

};

export const generateBillNo = () => {

  const date = new Date();

  const yyyy = date.getFullYear();

  const mm = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const dd = String(
    date.getDate()
  ).padStart(2, "0");

  return `BL-${yyyy}${mm}${dd}-${Date.now()
    .toString()
    .slice(-3)}`;

};