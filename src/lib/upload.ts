import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

export async function saveBase64Image(base64: string) {
  const match = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de imagem invalido.");
  }

  const mime = match[1];
  const data = match[2];
  const extension = mime.includes("png")
    ? "png"
    : mime.includes("webp")
      ? "webp"
      : "jpg";

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadsDir, fileName);
  await writeFile(absolutePath, Buffer.from(data, "base64"));

  return `/uploads/${fileName}`;
}
