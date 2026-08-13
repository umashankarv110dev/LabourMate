import { calculateGrandTotal } from "../src/utils/calculation";

export const quotationTemplate = (
  quotation: any,
  logoBase64: string,
  signBase64: string,
  stampBase64: string = ""
) => {
  const company = quotation?.company ?? {};

  // =====================================================
  // COMPANY DATA
  // =====================================================

  const companyName =
    company.name ||
    company.companyName ||
    "Company Name";

  const ownerName =
    company.owner_name ||
    "";

  const phone =
    company.phone ||
    company.mobile ||
    "";

  const email =
    company.email ||
    "";

  const address =
    company.address ||
    "";

  const gstNumber =
    company.gst_number ||
    company.gstNumber ||
    "";

  // =====================================================
  // ITEMS
  // =====================================================

  const items = Array.isArray(quotation?.items)
    ? quotation.items
    : [];

  const rows = items
    .map((item: any, index: number) => {
      const total =
        item.showSize &&
        item.showQty &&
        item.showRate
          ? Number(item.size || 0) *
            Number(item.qty || 0) *
            Number(item.rate || 0)
          : Number(item.total || 0);

      return `
        <tr>
          <td class="sr">${index + 1}</td>

          <td class="description">
            ${item.description || "-"}
          </td>

          <td>
            ${
              item.showSize
                ? item.size || "-"
                : "-"
            }
          </td>

          <td>
            ${
              item.showQty
                ? item.qty || "-"
                : "-"
            }
          </td>

          <td class="money">
            ${
              item.showRate
                ? `₹ ${Number(item.rate || 0).toFixed(2)}`
                : "-"
            }
          </td>

          <td class="money total-cell">
            ₹ ${total.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal =
    calculateGrandTotal(items);

  // =====================================================
  // HTML
  // =====================================================

  return `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 28px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #1F2937;
  background: #FFFFFF;
}

.page {
  width: 100%;
}

/* =====================================================
   COMPANY HEADER
   ===================================================== */

.header {
  width: 100%;
  border-bottom: 3px solid #1565C0;
  padding-bottom: 18px;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
}

.header-table td {
  border: none;
  padding: 0;
  vertical-align: top;
}

.logo-column {
  width: 18%;
}

.company-column {
  width: 57%;
  padding-left: 15px !important;
}

.document-column {
  width: 25%;
  text-align: right;
}

.logo {
  width: 82px;
  height: 82px;
  object-fit: contain;
}

.company-name {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  color: #1565C0;
  letter-spacing: 0.3px;
}

.owner {
  margin-top: 4px;
  font-size: 11px;
  color: #6B7280;
}

.company-details {
  margin-top: 7px;
  line-height: 1.6;
  color: #4B5563;
}

.gst {
  margin-top: 6px;
  font-weight: bold;
  color: #1565C0;
}

.document-label {
  font-size: 11px;
  font-weight: bold;
  color: #6B7280;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.document-title {
  margin-top: 3px;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.document-number {
  margin-top: 8px;
  font-size: 11px;
  color: #4B5563;
}

.document-date {
  margin-top: 3px;
  font-size: 11px;
  color: #4B5563;
}

/* =====================================================
   META
   ===================================================== */

.meta {
  margin-top: 18px;
}

.meta-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.meta-box {
  width: 50%;
  padding: 13px 15px;
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
}

.meta-box:first-child {
  border-radius: 8px 0 0 8px;
}

.meta-box:last-child {
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.meta-label {
  font-size: 9px;
  font-weight: bold;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.meta-value {
  margin-top: 4px;
  font-size: 13px;
  font-weight: bold;
  color: #111827;
}

/* =====================================================
   BILL TO
   ===================================================== */

.bill-to {
  margin-top: 20px;
  padding: 15px;
  border-left: 4px solid #1565C0;
  background: #F8FAFC;
  border-radius: 0 8px 8px 0;
}

.bill-title {
  font-size: 9px;
  font-weight: bold;
  color: #1565C0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.customer-name {
  margin-top: 5px;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.site-name {
  margin-top: 3px;
  color: #6B7280;
}

/* =====================================================
   QUOTATION TITLE
   ===================================================== */

.quotation-title {
  margin: 24px 0 15px;
  text-align: center;
}

.quotation-title span {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  background: #EFF6FF;
  color: #1565C0;
  font-size: 16px;
  font-weight: 800;
}

/* =====================================================
   ITEMS TABLE
   ===================================================== */

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.items-table th {
  padding: 10px 7px;
  background: #1565C0;
  color: #FFFFFF;
  border: none;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.items-table th:first-child {
  border-radius: 7px 0 0 0;
}

.items-table th:last-child {
  border-radius: 0 7px 0 0;
}

.items-table td {
  padding: 10px 7px;
  border-bottom: 1px solid #E5E7EB;
  text-align: center;
  vertical-align: middle;
  color: #374151;
}

.items-table tr:nth-child(even) td {
  background: #F9FAFB;
}

.items-table .sr {
  width: 7%;
  color: #6B7280;
}

.items-table .description {
  width: 39%;
  text-align: left;
  font-weight: 600;
  color: #111827;
}

.items-table .money {
  white-space: nowrap;
}

.items-table .total-cell {
  font-weight: bold;
  color: #111827;
}

/* =====================================================
   TOTAL
   ===================================================== */

.total-wrapper {
  margin-top: 15px;
  width: 100%;
}

.total-table {
  width: 42%;
  margin-left: auto;
  border-collapse: collapse;
}

.total-table td {
  padding: 7px 10px;
  border: none;
}

.total-label {
  text-align: right;
  color: #6B7280;
}

.grand-total-label {
  text-align: right;
  font-weight: bold;
  color: #111827;
}

.grand-total {
  text-align: right;
  padding: 11px 10px !important;
  background: #1565C0;
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 800;
  border-radius: 7px;
}

/* =====================================================
   NOTES
   ===================================================== */

.notes {
  margin-top: 22px;
  padding: 14px 16px;
  background: #FFFBEB;
  border-left: 4px solid #F59E0B;
  border-radius: 0 8px 8px 0;
}

.notes-title {
  font-size: 10px;
  font-weight: bold;
  color: #92400E;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.notes-content {
  margin-top: 6px;
  line-height: 1.6;
  color: #4B5563;
}

/* =====================================================
   APPROVAL
   ===================================================== */

.approval {
  margin-top: 55px;
  width: 100%;
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
}

.approval-table td {
  border: none;
  vertical-align: bottom;
}

.signature-column {
  width: 55%;
  text-align: right;
}

.stamp-column {
  width: 45%;
  text-align: right;
}

.signature-image {
  width: 145px;
  height: 75px;
  object-fit: contain;
}

.stamp-image {
  width: 85px;
  height: 85px;
  object-fit: contain;
}

.signature-line {
  width: 180px;
  margin-left: auto;
  border-top: 1px solid #9CA3AF;
  margin-top: 4px;
}

.signature-label {
  margin-top: 6px;
  font-size: 10px;
  font-weight: bold;
  color: #374151;
}

/* =====================================================
   FOOTER
   ===================================================== */

.footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
  text-align: center;
  font-size: 9px;
  color: #9CA3AF;
}

</style>

</head>


<body>

<div class="page">


<!-- =====================================================
     COMPANY HEADER
     ===================================================== -->

<div class="header">

<table class="header-table">

<tr>

<!-- LOGO -->

<td class="logo-column">

${
  logoBase64
    ? `
      <img
        src="data:image/png;base64,${logoBase64}"
        class="logo"
      />
    `
    : ""
}

</td>


<!-- COMPANY -->

<td class="company-column">

<div class="company-name">
  ${companyName}
</div>

${
  ownerName
    ? `
      <div class="owner">
        Proprietor / Owner: ${ownerName}
      </div>
    `
    : ""
}

<div class="company-details">

${
  address
    ? `
      ${address}
      <br>
    `
    : ""
}

${
  phone
    ? `
      Mobile: ${phone}
      ${email ? " | " : ""}
    `
    : ""
}

${
  email
    ? `
      Email: ${email}
    `
    : ""
}

${
  gstNumber
    ? `
      <div class="gst">
        GSTIN: ${gstNumber}
      </div>
    `
    : ""
}

</div>

</td>


<!-- DOCUMENT -->

<td class="document-column">

<div class="document-label">
  Business Document
</div>

<div class="document-title">
  QUOTATION
</div>

<div class="document-number">
  <b>No:</b>
  ${quotation.quotationNo || "-"}
</div>

<div class="document-date">
  <b>Date:</b>
  ${quotation.date || "-"}
</div>

</td>

</tr>

</table>

</div>


<!-- =====================================================
     CUSTOMER / META
     ===================================================== -->

<div class="meta">

<table class="meta-table">

<tr>

<td class="meta-box">

<div class="meta-label">
  Quotation Number
</div>

<div class="meta-value">
  ${quotation.quotationNo || "-"}
</div>

</td>


<td class="meta-box">

<div class="meta-label">
  Quotation Date
</div>

<div class="meta-value">
  ${quotation.date || "-"}
</div>

</td>

</tr>

</table>

</div>


<!-- =====================================================
     BILL TO
     ===================================================== -->

<div class="bill-to">

<div class="bill-title">
  Prepared For
</div>

<div class="customer-name">
  ${quotation.customerName || "-"}
</div>

${
  quotation.siteName
    ? `
      <div class="site-name">
        Project / Site: ${quotation.siteName}
      </div>
    `
    : ""
}

</div>


<!-- =====================================================
     TITLE
     ===================================================== -->

<div class="quotation-title">

<span>
  ${quotation.quotationTitle || "Quotation"}
</span>

</div>


<!-- =====================================================
     ITEMS
     ===================================================== -->

<table class="items-table">

<thead>

<tr>

<th>Sr.</th>

<th>Description</th>

<th>Size</th>

<th>Qty</th>

<th>Rate</th>

<th>Total</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>


<!-- =====================================================
     TOTAL
     ===================================================== -->

<div class="total-wrapper">

<table class="total-table">

<tr>

<td class="total-label">
  Total Amount
</td>

<td class="grand-total-label">
  ₹ ${Number(grandTotal || 0).toFixed(2)}
</td>

</tr>

<tr>

<td colspan="2" class="grand-total">
  Grand Total&nbsp;&nbsp; ₹ ${Number(
    grandTotal || 0
  ).toFixed(2)}
</td>

</tr>

</table>

</div>


<!-- =====================================================
     NOTES
     ===================================================== -->

${
  quotation.notes
    ? `
      <div class="notes">

        <div class="notes-title">
          Notes & Terms
        </div>

        <div class="notes-content">
          ${String(
            quotation.notes
          ).replace(
            /\n/g,
            "<br>"
          )}
        </div>

      </div>
    `
    : ""
}


<!-- =====================================================
     SIGNATURE / STAMP
     ===================================================== -->

<div class="approval">

<table class="approval-table">

<tr>

<td class="signature-column">

${
  signBase64
    ? `
      <img
        src="data:image/png;base64,${signBase64}"
        class="signature-image"
      />
    `
    : ""
}

<div class="signature-line"></div>

<div class="signature-label">
  Authorized Signature
</div>

</td>


<td class="stamp-column">

${
  stampBase64
    ? `
      <img
        src="data:image/png;base64,${stampBase64}"
        class="stamp-image"
      />
    `
    : ""
}

</td>

</tr>

</table>

</div>


<!-- =====================================================
     FOOTER
     ===================================================== -->

<div class="footer">

Thank you for your business.

</div>


</div>

</body>

</html>
  `;
};