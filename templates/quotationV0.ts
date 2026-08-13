import { calculateGrandTotal } from "../src/utils/calculation";

export const quotationTemplate = (
  quotation: any,
  logoBase64: string,
  signBase64: string,
  stampBase64: string = ""
) => {
  const company = quotation?.company ?? {};

  // =====================================================
  // SAFE VALUES
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

  const items = Array.isArray(
    quotation?.items
  )
    ? quotation.items
    : [];

  const rows = items
    .map(
      (item: any, index: number) => {
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

            <td>${index + 1}</td>

            <td style="text-align:left;">
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

            <td>
              ${
                item.showRate
                  ? item.rate || "-"
                  : "-"
              }
            </td>

            <td>
              ₹ ${total.toFixed(2)}
            </td>

          </tr>
        `;
      }
    )
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
    <html>

      <head>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            font-size: 13px;
            color: #222;
          }

          .company {
            text-align: center;
          }

          .company img {
            width: 90px;
          }

          .company h2 {
            margin: 5px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th,
          td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }

          th {
            background: #1565C0;
            color: white;
          }

          .total {
            margin-top: 20px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }

          .notes {
            margin-top: 25px;
            font-size: 15px;
            line-height: 1.5;
          }

          .signature {
            margin-top: 50px;
            text-align: right;
          }

          .signature img {
            width: 150px;
            height: 80px;
            object-fit: contain;
          }

          .stamp {
            margin-top: 10px;
          }

          .stamp img {
            width: 90px;
            height: 90px;
            object-fit: contain;
          }

          .company-details {
            line-height: 1.5;
          }

          .gst {
            margin-top: 5px;
            font-weight: bold;
          }

        </style>

      </head>

      <body>

        <!-- ================================================= -->
        <!-- COMPANY HEADER -->
        <!-- ================================================= -->

        <table
          style="
            width:100%;
            border:none;
            border-collapse:collapse;
            margin-top:0;
          "
        >

          <tr>

            <!-- LOGO -->

            <td
              style="
                width:20%;
                border:none;
                text-align:left;
                vertical-align:top;
              "
            >

              ${
                logoBase64
                  ? `
                    <img
                      src="data:image/png;base64,${logoBase64}"
                      style="
                        width:90px;
                        height:90px;
                        object-fit:contain;
                      "
                    />
                  `
                  : ""
              }

            </td>


            <!-- COMPANY DETAILS -->

            <td
              style="
                width:60%;
                border:none;
                text-align:center;
              "
            >

              <h2
                style="
                  margin:0;
                  color:#D71920;
                  font-size:30px;
                  font-weight:700;
                  letter-spacing:1px;
                "
              >
                ${companyName}
              </h2>

              ${
                ownerName
                  ? `
                    <div
                      style="
                        margin-top:4px;
                        font-weight:bold;
                      "
                    >
                      ${ownerName}
                    </div>
                  `
                  : ""
              }

              ${
                address
                  ? `
                    <div class="company-details">
                      ${address}
                    </div>
                  `
                  : ""
              }

              ${
                email
                  ? `
                    <div>
                      ${email}
                    </div>
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

            </td>


            <!-- MOBILE -->

            <td
              style="
                width:20%;
                border:none;
                text-align:right;
                vertical-align:top;
              "
            >

              ${
                phone
                  ? `
                    <b>Mobile:</b>
                    <br>
                    ${phone}
                  `
                  : ""
              }

            </td>

          </tr>

        </table>


        <hr>


        <!-- ================================================= -->
        <!-- QUOTATION INFORMATION -->
        <!-- ================================================= -->

        <table
          style="
            width:100%;
            border-collapse:collapse;
            margin-top:10px;
          "
        >

          <tr>

            <td
              style="
                text-align:left;
                border:none;
              "
            >
              <b>Quotation No :</b>
              ${quotation.quotationNo || "-"}
            </td>

            <td
              style="
                text-align:right;
                border:none;
              "
            >
              <b>Date :</b>
              ${quotation.date || "-"}
            </td>

          </tr>

        </table>


        <br>


        <!-- ================================================= -->
        <!-- CUSTOMER -->
        <!-- ================================================= -->

        <b>
          &nbsp;&nbsp;To,
        </b>

        <br>

        &nbsp;&nbsp;&nbsp;&nbsp;

        <span
          style="
            font-size:16px;
            font-weight:bold;
          "
        >
          ${quotation.customerName || "-"}
        </span>

        <br>

        &nbsp;&nbsp;&nbsp;&nbsp;

        <span
          style="
            font-size:14px;
          "
        >
          ${quotation.siteName || ""}
        </span>


        <!-- ================================================= -->
        <!-- TITLE -->
        <!-- ================================================= -->

        <h2 align="center">
          <u>
            ${quotation.quotationTitle || "Quotation"}
          </u>
        </h2>


        <!-- ================================================= -->
        <!-- ITEMS -->
        <!-- ================================================= -->

        <table>

          <tr>

            <th>Sr</th>

            <th>Description</th>

            <th>Size</th>

            <th>Qty</th>

            <th>Rate</th>

            <th>Total</th>

          </tr>

          ${rows}

        </table>


        <!-- ================================================= -->
        <!-- GRAND TOTAL -->
        <!-- ================================================= -->

        <div class="total">

          Grand Total :
          ₹ ${Number(grandTotal || 0).toFixed(2)}

        </div>


        <!-- ================================================= -->
        <!-- NOTES -->
        <!-- ================================================= -->

        ${
          quotation.notes
            ? `
              <div class="notes">

                <b>
                  <u>Notes</u>
                </b>

                <br>

                &nbsp;&nbsp;

                ${String(
                  quotation.notes
                ).replace(
                  /\n/g,
                  "<br>&nbsp;&nbsp;"
                )}

              </div>
            `
            : ""
        }


        <!-- ================================================= -->
        <!-- SIGNATURE + STAMP -->
        <!-- ================================================= -->

        <div class="signature">

          ${
            signBase64
              ? `
                <img
                  src="data:image/png;base64,${signBase64}"
                  style="
                    width:150px;
                    height:80px;
                    object-fit:contain;
                  "
                />

                <br>
              `
              : ""
          }


          ${
            stampBase64
              ? `
                <div class="stamp">

                  <img
                    src="data:image/png;base64,${stampBase64}"
                    style="
                      width:90px;
                      height:90px;
                      object-fit:contain;
                    "
                  />

                </div>
              `
              : ""
          }


          <br>

          _________________________

          <br>

          <span
            style="
              font-size:16px;
              font-weight:bold;
            "
          >
            Authorized Signature
          </span>

        </div>


      </body>

    </html>
  `;
};