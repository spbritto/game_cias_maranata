"use client";

/**
 * Rede de segurança para quando o PRÓPRIO layout raiz falha — caso raro
 * (fonte não carrega, erro na leitura de `metadataBase`), mas se acontecer sem
 * este arquivo o navegador mostra a tela de erro nua do próprio Next.
 *
 * Substitui `layout.tsx` inteiro nesse cenário, por isso precisa desenhar
 * `<html>`/`<body>` própios e não pode depender de `globals.css` ou dos
 * componentes do resto do app — qualquer um deles pode ser a causa da falha.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100dvh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1.25rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#14101f",
          color: "#eeecf2",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          O aplicativo não carregou
        </h1>
        <p style={{ color: "#b8b2c6", lineHeight: 1.6, maxWidth: "24rem" }}>
          Algo impediu a página inteira de abrir. Tente novamente — se
          persistir, recarregue o navegador.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: "3rem",
            padding: "0 1.5rem",
            borderRadius: "9999px",
            border: "none",
            background: "#f5b950",
            color: "#14101f",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
