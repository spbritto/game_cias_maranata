"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2, MessageCircle } from "lucide-react";
import { Button, Card } from "./ui";
import { useOrigin } from "@/lib/use-origin";

/**
 * Painel de compartilhamento do jogo publicado.
 *
 * QR Code fica para a Fase 5; aqui já entra o essencial para a aula acontecer:
 * copiar o link e mandar no grupo.
 */
export function ShareCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  // A origem real só existe no navegador: montar a URL no servidor daria o
  // endereço configurado no ambiente, e não aquele de onde o professor acessa.
  const origin = useOrigin();
  const url = origin ? `${origin}/jogar/${slug}` : "";

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
    </Card>
  );
}
