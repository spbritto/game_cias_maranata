# Missões

Gamificação para aulas cristãs com adolescentes. O professor monta uma aula como
uma sequência de missões — situações, escolhas, reflexões e referências bíblicas
— e compartilha um link. O adolescente joga pelo celular, sem cadastro, e a
conversa continua na sala.

- **Produto:** [descritivo_sistema_gamificacao_aulas_cristas.md](descritivo_sistema_gamificacao_aulas_cristas.md)
- **Plano técnico e fases:** [.claude/plans/PLANO_EXECUCAO.md](.claude/plans/PLANO_EXECUCAO.md)

## Estado atual

Experiência do adolescente e área do professor completas: login e cadastro
(por código de convite), painel, editor com autosave, publicação, QR Code e
troca de senha. As aulas são compartilhadas entre todos os professores e
identificadas pelo domingo do mês ("4ª aula · 27/09"). Uma aula pode ser
**gerada a partir do PDF da aula escrita** pela OpenAI e revisada no editor
antes de publicar. O jogo **Propósito** está publicado em
`/jogar/proposito-7H3K` como cenário de validação.

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
| `AUTH_SECRET` | sim | Assina o cookie de sessão do professor |
| `TEACHER_INVITE_CODE` | sim, para cadastro | Código exigido na aba "Criar conta" de `/entrar`. Sem ele, o cadastro sempre recusa (de propósito) |
| `OPENAI_API_KEY` | sim, para gerar por IA | Chave da OpenAI usada em "Criar a partir do PDF". Só no servidor |
| `OPENAI_MODEL` | não | Modelo da geração. Padrão: `gpt-5-mini` |
| `NEXT_PUBLIC_APP_URL` | não | Só para domínio próprio. Na Vercel, a URL de produção é detectada sozinha |

## Deploy na Vercel

1. Importe o repositório na Vercel. Framework: Next.js, sem configuração extra.
2. Em **Settings → Environment Variables**, adicione `DATABASE_URL` (connection
   string pooled do Neon — o mesmo banco já migrado e semeado localmente, não
   há passo de migração no deploy — rode `npm run db:migrate` localmente antes
   de publicar uma versão com migração nova), `AUTH_SECRET`,
   `TEACHER_INVITE_CODE` e `OPENAI_API_KEY`.
3. Em **Settings → Deployment Protection**, desligue a proteção para
   Production (ou deixe só "Only Preview Deployments"). **Isso não é opcional**:
   ligada, ela bloqueia com um SSO da própria Vercel *qualquer* acesso sem login
   na conta do projeto — inclusive o link do jogo que o adolescente abre pelo
   WhatsApp.
4. Faça o deploy. O link para os adolescentes é
   `https://<seu-projeto>.vercel.app/jogar/proposito-7H3K`.

Para conferir o preview do link antes de mandar no grupo, cole a URL em
https://developers.facebook.com/tools/debug/ — o WhatsApp usa o mesmo
mecanismo de `og:` tags.

### Mudou uma variável de ambiente depois do deploy?

A Vercel não aplica a mudança ao deployment que já está no ar — só ao
**próximo** build. Depois de adicionar ou alterar qualquer variável, vá em
**Deployments**, abra o menu (⋯) do deployment mais recente e clique em
**Redeploy**. Sem isso, o código continua rodando com o valor antigo (ou
ausente), mesmo que o painel da Vercel já mostre o valor novo.

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
| `npm run testar-geracao -- aula.pdf` | Gera uma aula a partir do PDF sem banco nem interface, para conferir o resultado da IA (custa uma chamada à OpenAI) |

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
