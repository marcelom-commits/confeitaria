import { QrCodePix } from "qrcode-pix";

export function buildPixBRCode(payload: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}): string {
  const pix = QrCodePix({
    version: "01",
    key: payload.pixKey,
    name: payload.merchantName,
    city: payload.merchantCity,
    value: payload.amount,
    transactionId: payload.txid ?? "***",
  });

  return pix.payload();
}
