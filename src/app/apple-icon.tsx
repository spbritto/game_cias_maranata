import { ImageResponse } from "next/og";
import { brandIcon } from "@/lib/brand-icon";

/**
 * Ícone de "adicionar à tela de início" no iOS/Safari, que exige PNG — SVG
 * (usado no favicon comum) não funciona aí. Gerado com `next/og`, o mesmo
 * mecanismo já usado no preview do WhatsApp, sem depender de nenhuma
 * ferramenta externa de imagem. Convenção de arquivo do Next: o link
 * `<link rel="apple-touch-icon">` é injetado sozinho, sem configuração extra.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(brandIcon(180), size);
}
