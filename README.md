# Missões

Gamificação para aulas cristãs com adolescentes. O professor monta uma aula como
uma sequência de missões — situações, escolhas, reflexões e referências bíblicas
— e compartilha um link. O adolescente joga pelo celular, sem cadastro, e a
conversa continua na sala.

- **Produto:** [descritivo_sistema_gamificacao_aulas_cristas.md](descritivo_sistema_gamificacao_aulas_cristas.md)
- **Plano técnico e fases:** [.claude/plans/PLANO_EXECUCAO.md](.claude/plans/PLANO_EXECUCAO.md)

## Estado atual

Primeira versão apresentável: a experiência do adolescente está completa, com o
jogo **Propósito** publicado em `/jogar/proposito-7H3K`. A área do professor
(login, editor, publicação) vem nas próximas fases.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind v4
· Drizzle ORM · Neon (Postgres) · Zod 4 · Motion

## Rodar localmente

Requer Node 20.9+ e um projeto no [Neon](https://neon.tech).

```bash
npm install
cp .env.example .env.local        # preencha DATABASE_URL
npm run db:migrate                # cria as tabelas
npm run db:seed                   # insere o jogo Propósito
npm run dev
```

Abra http://localhost:3000/jogar/proposito-7H3K. Para testar no celular na mesma
rede, use o endereço `Network` que o `next dev` imprime.

`/demo` renderiza o Propósito a partir de um fixture, sem banco — útil para
mexer no visual. Só existe em desenvolvimento.

## Variáveis de ambiente

| Variável | Obrigatória | Para quê |
|---|---|---|
| `DATABASE_URL` | sim | Connection string do Neon (usar a **pooled**) |
| `AUTH_SECRET` | a partir da Fase 3 | Assina o cookie de sessão do professor |
| `NEXT_PUBLIC_APP_URL` | não | Só para domínio próprio. Na Vercel, a URL de produção é detectada sozinha |

## Deploy na Vercel

1. Importe o repositório na Vercel. Framework: Next.js, sem configuração extra.
2. Em **Settings → Environment Variables**, adicione `DATABASE_URL` com a
   connection string pooled do Neon (o mesmo banco já migrado e semeado
   localmente — não há passo de migração no deploy).
3. Faça o deploy. O link para os adolescentes é
   `https://<seu-projeto>.vercel.app/jogar/proposito-7H3K`.

Para conferir o preview do link antes de mandar no grupo, cole a URL em
https://developers.facebook.com/tools/debug/ — o WhatsApp usa o mesmo
mecanismo de `og:` tags.

### O que esperar no primeiro acesso

O plano gratuito do Neon hiberna o banco após inatividade: o **primeiro** acesso
do dia leva cerca de 1 segundo. Os seguintes vêm do cache (`use cache` por tag)
e não tocam no banco. Se for apresentar em sala, abra o link uma vez antes.

## Scripts

| Comando | Faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Gera migração a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica migrações no Neon |
| `npm run db:seed` | Recria o jogo Propósito (idempotente, mantém o slug) |
| `npm run db:studio` | Drizzle Studio |

## Estrutura

```
src/
├── app/
│   ├── (jogador)/jogar/[slug]/   # rota pública do jogo (PPR + cache por tag)
│   └── demo/                     # fixture sem banco, só em dev
├── components/jogador/           # runtime da jornada e suas telas
├── db/                           # Drizzle: schema, client, queries
└── lib/
    ├── schemas/step.ts           # FONTE DA VERDADE dos tipos de etapa (Zod)
    ├── fixtures/proposito.ts     # conteúdo do jogo de validação
    └── player-progress.ts        # progresso do adolescente (localStorage)
```

Regra que vale para todo o código: nada entra na coluna `step.data` (jsonb) sem
passar por `stepDataSchema`. O banco não valida a forma do conteúdo — o Zod é o
contrato.
