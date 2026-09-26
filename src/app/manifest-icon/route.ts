import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { brandIcon } from "@/lib/brand-icon";

/**
 * Ícones do manifesto PWA (192 e 512px), referenciados por `manifest.ts`.
 * Gerados sob demanda com `next/og` — os dois únicos tamanhos que o manifesto
 * pede, então `?size=` só aceita essas duas opções.
 */
export function GET(request: NextRequest) {
  const size = request.nextUrl.searchParams.get("size") === "512" ? 512 : 192;
  return new ImageResponse(brandIcon(size), { width: size, height: size });
}
