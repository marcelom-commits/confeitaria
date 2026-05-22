import { createStaticPix, hasError } from "pix-utils";
import type { PixStaticObject } from "pix-utils/dist/module/types/pixElements";

export function buildPixBRCode(payload: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}): string {
  const pix = createStaticPix({
    pixKey: payload.pixKey,
    merchantName: payload.merchantName.trim().substring(0, 25),
    merchantCity: payload.merchantCity.trim().substring(0, 15),
    transactionAmount: payload.amount,
    txid: payload.txid ?? "***",
  });

  if (hasError(pix)) {
    throw new Error("Erro ao gerar BR Code PIX");
  }

  return (pix as PixStaticObject).toBRCode();
}
