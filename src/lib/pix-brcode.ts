function crc16CCITT(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function emvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function buildPixBRCode(payload: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txid } = payload;

  const gui = "br.gov.bcb.pix";
  const merchantAccountInfo =
    emvField("00", gui) + emvField("01", pixKey);

  const amountFormatted = amount.toFixed(2);
  const name = merchantName.trim().substring(0, 25);
  const city = merchantCity.trim().substring(0, 15);
  const theTxid = txid ?? "***";

  let pixPayload =
    emvField("00", "01") +
    emvField("01", "12") +
    emvField("26", merchantAccountInfo) +
    emvField("52", "0000") +
    emvField("53", "986") +
    emvField("54", amountFormatted) +
    emvField("58", "BR") +
    emvField("59", name) +
    emvField("60", city) +
    emvField("62", emvField("05", theTxid));

  const crc = crc16CCITT(pixPayload + "6304");
  pixPayload += "6304" + crc;

  return pixPayload;
}
