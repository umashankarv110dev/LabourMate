import { calculateGrandTotal } from "../src/utils/calculation";

export const quotationTemplate = (
  quotation: any,
  logoBase64: string,
  signBase64: string
) => {

  const rows = quotation.items
    .map(
      (item: any, index: number) => {

        const total =
          item.showSize &&
          item.showQty &&
          item.showRate
            ? Number(item.size) *
              Number(item.qty) *
              Number(item.rate)
            : Number(item.total);

        return `
        <tr>

        <td>${index + 1}</td>

        <td style="text-align: left;">${item.description}</td>

        <!-- <td>${item.unit}</td> -->

        <td>${
          item.showSize
            ? item.size
            : "-"
        }</td>

        <td>${
          item.showQty
            ? item.qty
            : "-"
        }</td>

        <td>${
          item.showRate
            ? item.rate
            : "-"
        }</td>

        <td>${total}</td>

        </tr>
        `;
      }
    )
    .join("");

  const grandTotal =
    calculateGrandTotal(
      quotation.items
    );

  return `
    <html>
      <head>
        <style>
          body{
            font-family:Arial;
            padding:30px;
            font-size:13px;
          }

          .company{
            text-align:center;
          }

          .company img{
            width:90px;
          }

          .company h2{
            margin:5px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }

          th,td{
            border:1px solid black;
            padding:8px;
            text-align:center;
          }

          th{
            background:#1565C0;
            color:white;
          }

          .total{
            margin-top:20px;
            text-align:right;
            font-size:18px;
            font-weight:bold;
          }

          .notes{
            margin-top:25px;
            font-size:18px;
          }

          .signature{
            margin-top:60px;
            text-align:right;
          }

        </style>

      </head>
      <body>
        <table style="width:100%; border:none; border-collapse:collapse;">
          <tr>
            <!-- Logo -->
            <td style="width:20%; border:none; text-align:left; vertical-align:top;">
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

            <!-- Company Details -->
            <td style="width:60%; border:none; text-align:center;">
              <h2 style="
                margin:0;
                color:#D71920;
                font-size:30px;
                font-weight:700;
                letter-spacing:1px;
              ">
                ${quotation.company.companyName}
              </h2>

              <div>
                ${quotation.company.addressLine1}<br>
                ${quotation.company.addressLine2}
              </div>

              <div>
                ${quotation.company.email}
              </div>
            </td>

            <!-- Mobile -->
            <td style="width:20%; border:none; text-align:right; vertical-align:top;">
              <b>Mobile:</b><br>
              ${quotation.company.mobile}
            </td>
          </tr>
        </table>
        <hr>

        <b>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="text-align:left; border:none;">
              <b>Quotation No :</b> ${quotation.quotationNo}
            </td>
            <td style="text-align:right; border:none;">
              <b>Date :</b> ${quotation.date}
            </td>
          </tr>
        </table>
        <br><br>
          
        <b>
          &nbsp;&nbsp;To,
        </b>

        <br>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size:16px; font-weight:bold;">
          ${quotation.customerName}
        </span>

        <br>

        &nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size:14px;">
          ${quotation.siteName}
        </span>

        <h2 align="center">
          <u> ${quotation.quotationTitle} </u>
        </h2>

        <table>
          <tr>
            <th>Sr</th>
            <th>Description</th>
            <!-- <th>Unit</th> -->
            <th>Size</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
          ${rows}
        </table>

        <div class="total">
          Grand Total :
          ₹ ${grandTotal}   
        </div>

        ${
          quotation.notes
          ?

            `
            <div class="notes">
            <b><u>Notes</u></b>
            <br>
            &nbsp;&nbsp;${quotation.notes.replace(/\n/g,"<br>&nbsp;&nbsp;")}
            </div>
            `

          :

          ""
        }

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
            `
            : ""
          }

          <br>
          _________________________
          <br>
          <span style="font-size:16px; font-weight:bold;">
            Authorized Signature
          </span>
          

        </div>
        
      </body>
    </html>
  `;
};