"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Download, ExternalLink, Link2, MessageCircle } from "lucide-react";
import { Button, Card } from "./ui";
import { useOrigin } from "@/lib/use-origin";

/**
 * Painel de compartilhamento do jogo publicado: link, WhatsApp e QR Code.
 *
 * Tudo gerado no navegador do professor — o QR Code nunca passa pelo servidor,
 * então não existe rota nem cache para invalidar quando o link muda.
 */
export function ShareCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  // A origem real só existe no navegador: montar a URL no servidor daria o
  // endereço configurado no ambiente, e não aquele de onde o professor acessa.
  const origin = useOrigin();
  const url = origin ? `${origin}/jogar/${slug}` : "";

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      color: { dark: "#14101f", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        // Sem QR Code o professor ainda tem o link e o botão do WhatsApp.
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de área de transferência o link segue visível abaixo.
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `Bora? A missão de hoje está aqui: ${url}`,
  )}`;

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">Link da turma</h3>
        <p className="mt-1 text-xs text-ink-subtle">
          Este endereço não muda, mesmo que você edite o tema depois.
        </p>
      </div>

      <code className="block overflow-x-auto rounded-field border border-line bg-surface-overlay px-4 py-3 text-sm text-ember-300">
        {url || `/jogar/${slug}`}
      </code>

      <div className="flex flex-wrap gap-2">
        <Button onClick={copy} disabled={!url}>
          {copied ? (
            <Check aria-hidden className="size-4 text-ember-400" />
          ) : (
            <Link2 aria-hidden className="size-4" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-5 text-sm font-semibold text-ink hover:border-line-strong"
        >
          <MessageCircle aria-hidden className="size-4" />
          WhatsApp
        </a>

        <a
          href={`/jogar/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-5 text-sm font-semibold text-ink hover:border-line-strong"
        >
          <ExternalLink aria-hidden className="size-4" />
          Abrir
        </a>
      </div>

      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-3 border-t border-line pt-4">
          <div className="rounded-field bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada no navegador, next/image não se aplica */}
            <img
              src={qrDataUrl}
              alt={`QR Code para ${url}`}
              width={160}
              height={160}
              className="size-40"
            />
          </div>
          <a
            href={qrDataUrl}
            download={`missao-${slug}.png`}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-5 text-sm font-semibold text-ink hover:border-line-strong"
          >
            <Download aria-hidden className="size-4" />
            Baixar QR Code
          </a>
          <p className="text-center text-xs text-ink-subtle">
            Bom para projetar na tela ou colar no quadro — quem apontar a
            câmera do celular entra direto na missão.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
