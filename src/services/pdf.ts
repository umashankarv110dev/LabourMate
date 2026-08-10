import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system/legacy";
import { quotationTemplate } from "@/templates/quotationTemplate";

const convertImageToBase64 = async (uri: string) => {
  if (!uri) return "";

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return base64;
};

export const generatePDF =
async (
quotation:any
)=>{

const logoBase64 = quotation.company.logo
  ? await convertImageToBase64(quotation.company.logo)
  : "";

const signBase64 = quotation.company.signature
  ? await convertImageToBase64(quotation.company.signature)
  : "";

const html = quotationTemplate(
  quotation,
  logoBase64,
  signBase64
);


const file =
await Print.printToFileAsync({

html,

});

return file.uri;

};

export const sharePDF =
async (
quotation:any
)=>{

const uri =
await generatePDF(
quotation
);

await Sharing.shareAsync(
uri
);

};