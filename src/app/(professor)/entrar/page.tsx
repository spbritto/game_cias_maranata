import { Suspense } from "react";
import type { Metadata } from "next";
import { Starfield } from "@/components/jogador/starfield";
import { AuthTabs } from "./auth-tabs";

export const metadata: Metadata = { title: "Entrar" };

type Props = { searchParams: Promise<{ destino?: string }> };

export default function LoginPage({ searchParams }: Props) {
  return (
    <>
      <Starfield />
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-5 py-12">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-[0.2em] text-ember-400 uppercase">
            Área do professor
          </p>
          <h1 className="text-3xl leading-tight font-semibold text-ink">
            Entrar
          </h1>
          <p className="text-sm text-ink-muted">
            Cadastro de professor é feito com um código de convite — peça para
            quem administra o sistema.
          </p>
        </div>

        {/* `searchParams` é dado de requisição: com Cache Components, só sob
            Suspense — assim o resto da tela sai do shell estático. */}
        <Suspense fallback={<FormSkeleton />}>
          <TabsWithDestination searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function TabsWithDestination({ searchParams }: Props) {
  const { destino } = await searchParams;
  return <AuthTabs destino={destino ?? ""} />;
}

function FormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-touch rounded-pill bg-night-800" />
      <div className="flex flex-col gap-5">
        <div className="h-touch rounded-field bg-night-800" />
        <div className="h-touch rounded-field bg-night-800" />
        <div className="h-touch rounded-pill bg-night-800" />
      </div>
    </div>
  );
}
