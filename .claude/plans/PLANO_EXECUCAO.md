# Plano de Execução — Sistema de Gamificação para Aulas Cristãs

Documento derivado de [`descritivo_sistema_gamificacao_aulas_cristas.md`](descritivo_sistema_gamificacao_aulas_cristas.md).
Este arquivo é o plano técnico; o descritivo continua sendo a fonte da verdade sobre **produto**.

Última atualização: 2026-09-20

---

## 1. Decisões fechadas

| Tema | Decisão | Consequência |
|---|---|---|
| Hospedagem | Vercel | Disco efêmero: nada de arquivo local persistente |
| Banco | Neon (Postgres serverless) | Substitui o SQLite cogitado no descritivo |
| Framework | Next.js 16.3 (App Router) + React 19.2 | Necessário para preview de link no WhatsApp e cache de borda |
| Cache | `cacheComponents: true` | Habilita `use cache` / `cacheTag`; ligado desde a Fase 0 |
| Professores | Poucos, cadastrados manualmente | Login com senha; sem cadastro aberto |
| Respostas dos adolescentes | **Não** são gravadas no MVP | Seção 16 do descritivo sai do escopo inicial |
| Direção visual | Noturna / jornada | Índigo-violeta profundo + acento âmbar |

### 1.1 Por que Next.js e não Vite + SPA

O descritivo pede "basicamente tudo frontend em React". Next.js **é** React — a diferença é quem renderiza a primeira tela. Três motivos concretos, em ordem de peso:

1. **Preview de link no WhatsApp.** A seção 12 do descritivo trata o compartilhamento por WhatsApp como fluxo principal. O preview (título, tema, imagem) exige meta tags `og:` presentes no HTML que o servidor devolve. Uma SPA devolve um `<div id="root">` vazio — o WhatsApp mostra um card cinza sem nada. Isso não tem contorno no lado do cliente.
2. **Cold start do Neon.** O free tier hiberna após inatividade e a primeira consulta leva ~1s. A página do jogo publicado é conteúdo praticamente estático: cacheada com `use cache` + `cacheTag(slug)`, a maioria dos adolescentes nunca encosta no banco. Uma SPA obrigatoriamente faria fetch em runtime.
3. **Zero backend separado.** Server Actions cobrem todo o CRUD do professor sem escrever uma rota de API. O MVP não precisa de nenhum arquivo em `app/api/`.

O custo é honesto: o projeto deixa de ser "só frontend" e passa a ter código que roda no servidor. Mas não existe processo separado para manter, nem CORS, nem segundo deploy.

### 1.2 Por que a coleta de respostas fica fora (e como não fechar a porta)

Decisão consciente com um custo conhecido: quando o painel de resultados da turma (seção 16) for construído, ele começa sem nenhum dado histórico. As aulas dadas até lá não geram base.

Para manter reversível a um custo baixo, o MVP **não modela nada de sessão/resposta no banco** — quando entrar, serão tabelas novas (`play_session`, `answer`), aditivas, sem tocar em `game` ou `step`. Nenhuma migração destrutiva.

Compensação imediata, sem backend: na tela de conclusão o adolescente vê o recap das próprias respostas e tem um botão **"Mandar pro professor"** que abre o WhatsApp com o texto formatado. Resolve boa parte do valor da seção 16 para a aula presencial, e a escolha de enviar ou não é dele.

---

## 2. Arquitetura

```
Navegador do adolescente          Navegador do professor
         │                                  │
         │ GET /jogar/proposito-7H3K        │ Server Actions
         │ (server component, cacheado)     │ (sessão via cookie)
         ▼                                  ▼
┌──────────────────────────────────────────────────┐
│              Next.js 16 na Vercel                │
│  App Router · Server Components · Server Actions  │
└──────────────────────────────────────────────────┘
                        │
                        │ Drizzle + @neondatabase/serverless (HTTP)
                        ▼
              ┌───────────────────┐
              │  Neon (Postgres)  │
              └───────────────────┘
```

Driver HTTP do Neon, não TCP: em serverless, pool de conexões TCP estoura o limite do Postgres rapidamente. O driver HTTP não mantém conexão aberta.

### 2.1 Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) | Ver 1.1 |
| Linguagem | TypeScript (strict) | Tipos de etapa são o núcleo do sistema |
| Banco | Neon Postgres | Decisão do projeto |
| ORM | Drizzle ORM | Sem binário de engine — cold start baixo, migrações em SQL legível |
| Validação | Zod 4 | Uma união discriminada de tipos de etapa, compartilhada entre cliente e servidor |
| Estilo | Tailwind CSS v4 | Tokens como CSS vars, configuração dentro do próprio CSS |
| Componentes | shadcn/ui | Só na área do professor (formulários, diálogos) — código no repo, não dependência |
| Animação | `motion` | O reveal da reflexão é o momento central da experiência |
| Ordenação | `@dnd-kit/*` | Funciona em toque; `react-beautiful-dnd` está sem manutenção |
| Formulários | react-hook-form + `@hookform/resolvers/zod` | Reaproveita os mesmos schemas Zod |
| QR Code | `qrcode` | Gera PNG para download, não só canvas |
| Ícones | `lucide-react` | |
| Senha | `bcryptjs` | |
| Sessão | `jose` (JWT em cookie httpOnly) | Sem consulta ao banco a cada request |

**Área do professor é client-heavy, área do jogador é server-first.** O editor é uma aplicação de formulário (estado local, autosave); a página do jogo é conteúdo entregue pronto com um runtime client por cima.

### 2.2 Estrutura de pastas

```
game_cias_maranata/
├── drizzle/                         # migrações geradas (versionadas)
├── public/
├── scripts/
│   ├── criar-professor.ts           # cadastro manual (não há signup)
│   └── seed-proposito.ts            # jogo da seção 19 do descritivo
├── src/
│   ├── app/
│   │   ├── (jogador)/
│   │   │   └── jogar/[slug]/
│   │   │       ├── page.tsx              # server component, cacheado por tag
│   │   │       ├── opengraph-image.tsx   # preview do WhatsApp
│   │   │       └── runtime-jogo.tsx      # client: máquina de estados da jornada
│   │   ├── (professor)/
│   │   │   ├── entrar/
│   │   │   ├── painel/                   # dashboard (seção 5.1)
│   │   │   └── jogos/[id]/
│   │   │       ├── editar/
│   │   │       └── previa/               # reusa runtime-jogo com dados de rascunho
│   │   ├── actions/                      # Server Actions ("use server")
│   │   ├── layout.tsx
│   │   └── globals.css                   # design tokens
│   ├── components/
│   │   ├── ui/                      # shadcn
│   │   ├── jogador/                 # cartões de etapa, progresso, reveal
│   │   └── professor/               # editor de etapa, lista ordenável
│   ├── db/
│   │   ├── schema.ts                # Drizzle
│   │   ├── client.ts                # Neon
│   │   └── queries/
│   └── lib/
│       ├── schemas/step.ts          # FONTE DA VERDADE dos tipos de etapa
│       ├── auth.ts
│       ├── slug.ts
│       └── progresso-local.ts       # localStorage do adolescente
├── drizzle.config.ts
└── package.json
```

**Convenção de idioma:** rotas, textos de interface e nomes de arquivo de domínio em pt-BR (é o que o professor e o adolescente veem). Identificadores de código, colunas de banco e tipos em inglês (é o que as bibliotecas esperam). Definido agora para não virar mistura aleatória depois.

---

## 3. Modelo de dados

Três tabelas no MVP.

```sql
teacher
  id             uuid       pk
  name           text       not null
  email          text       not null unique
  password_hash  text       not null
  created_at     timestamptz
  updated_at     timestamptz

game
  id               uuid     pk
  teacher_id       uuid     fk -> teacher(id) on delete cascade
  title            text     not null        -- "Missão: Descubra o Propósito"
  theme            text     not null        -- "Propósito"
  objective        text
  main_scripture   text                     -- "Efésios 2:10"
  description      text
  status           text     not null default 'draft'   -- draft | published | closed
  slug             text     unique                     -- null até a 1ª publicação
  conclusion       jsonb                               -- seção 11 do descritivo
  published_at     timestamptz
  created_at       timestamptz
  updated_at       timestamptz

step
  id          uuid    pk
  game_id     uuid    fk -> game(id) on delete cascade
  position    integer not null
  type        text    not null   -- choice | scenario | true_false | reflection | verse | open_question
  data        jsonb   not null   -- validado pelo Zod, formato depende de `type`
  created_at  timestamptz
  updated_at  timestamptz

  index (game_id, position)
```

Reordenação: o cliente envia o array completo de ids na nova ordem e o servidor reescreve as posições em uma transação. Com no máximo algumas dezenas de etapas por jogo, não há motivo para indexação fracionária.

### 3.1 Por que `data` é jsonb e não tabelas normalizadas

O descritivo lista `Alternativa` e `Reflexão` como entidades candidatas (seção 23). Optei por **não** criá-las como tabelas. Razões:

- O conteúdo de uma etapa é lido e escrito **sempre inteiro**, nunca em pedaços. Não existe consulta do tipo "todas as alternativas do sistema".
- Os seis tipos de etapa têm campos diferentes entre si e a seção 8 diz explicitamente que novos tipos virão. Tabela normalizada transforma cada tipo novo em migração; `jsonb` transforma em uma variante nova no Zod.
- O volume é ínfimo — dezenas de jogos, não milhões.

**O que isso custa:** o banco não garante integridade do conteúdo de uma etapa. A validação passa a ser 100% responsabilidade do Zod, na fronteira de toda Server Action. Se essa validação for contornada, entra lixo no `jsonb`. É um contrato que precisa ser respeitado com disciplina — está registrado aqui por isso.

**O que isso não custa:** contagem agregada futura (seção 16). Cada alternativa carrega um `id` estável dentro do `jsonb`; a tabela `answer`, quando existir, guarda esse `id` e o `GROUP BY` funciona normalmente.

### 3.2 União discriminada dos tipos de etapa

`src/lib/schemas/step.ts` é o arquivo mais importante do projeto: define os seis tipos da seção 8, gera os tipos TypeScript, valida a escrita nas Server Actions e alimenta os formulários do editor.

```
StepSchema = discriminatedUnion('type', [
  ChoiceStep,        // 8.1 — situação + alternativas + reflexão por alternativa
  ScenarioStep,      // 8.2 — cenário do cotidiano + alternativas, nunca com resposta certa
  TrueFalseStep,     // 8.3 — afirmação + verdadeiro/falso + explicação
  ReflectionStep,    // 8.4 — pergunta pessoal, sem resposta certa, opções livres
  VerseStep,         // 8.5 — texto bíblico + referência + comentário do professor
  OpenQuestionStep,  // 8.6 — campo de texto livre
])
```

Campos comuns a todos (seção 9), quase todos opcionais: `title`, `context`, `question`, `feedback`, `reflection`, `scriptureRef`, `scriptureText`, `discussionQuestion`.

Detalhe de produto que o schema precisa sustentar (seções 10 e 3.4): em `ChoiceStep`, a reflexão é **por alternativa**, não por etapa. É o que permite o feedback ensinar em vez de dizer "certo/errado". `correctOptionId` é opcional e, quando ausente, a interface não marca nenhuma alternativa como certa.

`ScenarioStep` e `ReflectionStep` ficaram próximos no descritivo, então a distinção foi fixada na implementação: `scenario` exige `context` (o cenário narrativo) e **não tem** `correctOptionId` em nenhuma hipótese; `reflection` é pergunta direta com opções curtas tipo etiqueta e aceita `allowMultiple`. `verse` é a única etapa que não espera resposta — `stepExpectsAnswer()` é o que o runtime consulta para decidir entre mostrar alternativas ou só o botão de avançar.

### 3.3 Regras de ciclo de vida

- **Slug** é gerado na primeira publicação (`kebab(theme)` + 4 caracteres de um alfabeto sem `0/O/1/I/l`, porque vai ser lido em voz alta e digitado) e **nunca muda**. Links já compartilhados não podem quebrar.
- **Editar um jogo publicado** tem efeito imediato — a edição revalida o cache da tag do slug. Não há versionamento. Simples e previsível; se virar problema na prática, é sinal de que o Modo Aula é a solução real.
- **Encerrar** (`closed`) mantém o link vivo, mas mostra uma tela de "missão encerrada" em vez do jogo.
- **Duplicar** copia jogo + etapas com `status = 'draft'` e `slug = null`.

### 3.4 Estado do adolescente (sem banco)

`localStorage`, chave `jogo:<slug>`:

```json
{ "nickname": "Samuel", "currentStep": 2, "answers": { "<stepId>": "<valor>" }, "startedAt": "..." }
```

Não é conveniência — é requisito. Celular de adolescente trava e bloqueia no meio da aula; sem isso, ele perde a jornada e desiste. Toda leitura e escrita vai em `try/catch` (aba anônima, armazenamento bloqueado).

---

## 4. Direção visual

Base índigo-violeta profunda, acento âmbar, progresso como constelação. Lê como "jornada e descoberta", funciona bem em tela de celular em ambiente iluminado ou não, e foge tanto da estética infantil quanto do clichê de material de igreja.

Tokens em `globals.css` como CSS custom properties, expostos ao Tailwind v4 via `@theme`. Regras que valem como contrato, tiradas das seções 17 e 20:

- **Um objetivo por tela.** A pergunta é o maior elemento; apoio é secundário.
- **Alvo de toque ≥ 48px**, ação principal na zona do polegar (parte inferior).
- **Nada de verde/vermelho de acerto e erro.** Feedback é reveal de reflexão, não julgamento. Isso é o item 3.4 e a seção 17 do descritivo, e é o ponto onde é mais fácil errar por hábito.
- **Sem pontuação, sem ranking, sem porcentagem de fé.**
- **`prefers-reduced-motion` respeitado** em todas as transições.
- Tipografia: uma fonte de display com personalidade para perguntas e títulos, uma neutra de alta legibilidade para corpo. Definidas na Fase 0.

---

## 5. Fases

Ordenadas para validar cedo o que tem mais risco. O risco maior deste produto **não** é técnico — é o adolescente achar a experiência sem graça. Por isso a experiência do jogador vem antes do editor, alimentada por um seed do jogo "Propósito" (seção 19) inserido direto no banco.

### Fase 0 — Fundação ✅ (commit `b581efc`)
- [x] Next.js 16.3 + TypeScript strict + Tailwind v4 + `cacheComponents: true`
- [x] Drizzle: `src/db/schema.ts`, `drizzle.config.ts`, migração `0000`
- [x] `src/lib/schemas/step.ts` com os seis tipos
- [x] Design tokens e tipografia (`src/app/globals.css`)
- [x] `scripts/seed-proposito.ts` — as 5 missões da seção 19, conteúdo real
- [x] Projeto no Neon + `DATABASE_URL` preenchida em `.env.local`
- [x] `npm run db:migrate && npm run db:seed` — Propósito no banco; `/jogar/proposito-7H3K` verificado contra o Neon (1,2s no cold start, 66ms do cache)
- [ ] Deploy inicial na Vercel ligado ao Neon ← movido para a Fase 6, junto do polimento

**Pronto quando:** o pipeline completo (commit → Vercel → Neon) funciona e o jogo Propósito está no banco.

### Fases 1 e 2 — Experiência do jogador ✅ (commit `0a08e3b`) ⬅ ponto de validação

Unidas em um passo só: `scenario` reaproveita quase toda a UI de `choice` e `true_false` é uma escolha de duas opções, então separar custaria mais que fazer junto — e o checkpoint visual passa a ser o Propósito inteiro, não um pedaço. Os seis tipos de etapa estão no runtime. Falta apenas rodar contra o Neon.

<details>
<summary>Escopo original das duas fases</summary>

#### Fase 1 — Fatia vertical do jogador
- `/jogar/[slug]`: tela inicial (título, tema, apresentação, apelido opcional, "Começar missão")
- Runtime da etapa tipo **Escolha**: situação → alternativas → reveal da reflexão → versículo → próxima
- Progresso em constelação, transições com Motion
- Retomada via `localStorage`
- Tela de conclusão (seção 11)
- `opengraph-image` para o preview do WhatsApp

**Pronto quando:** dá para abrir o link no celular e jogar o Propósito do início ao fim.
**Checkpoint:** aprovação visual antes de propagar a identidade para o resto do sistema.

#### Fase 2 — Demais tipos de etapa
Situação do cotidiano, Verdadeiro/Falso, Reflexão pessoal, Versículo, Pergunta aberta.
Conclusão ganha recap das respostas + botão "Mandar pro professor" (deep link `wa.me`).

</details>

**Verificado:** typecheck, lint, build (a rota saiu como Partial Prerender), render no servidor da tela inicial, tokens e fontes no CSS servido.
**Não verificado:** a navegação clicando pelas etapas e a aparência real em celular — dependem de olho humano e do banco.

### Fase 3 — Autenticação e dashboard
- Login com bcrypt + JWT em cookie `httpOnly` / `secure` / `sameSite=lax` via `jose`; `proxy.ts` protegendo `(professor)` — no Next 16 `middleware` foi renomeado para `proxy` e roda só no runtime Node
- `scripts/criar-professor.ts`
- Dashboard (seção 5.1): lista por estado, com criar / editar / duplicar / publicar / compartilhar / encerrar

### Fase 4 — Editor ⬅ maior fatia
- Etapa 1: informações da aula (seção 6)
- Lista de etapas ordenável com dnd-kit, funcionando em toque
- Um formulário por tipo de etapa, derivado do Zod, com autosave
- Editor da tela de conclusão
- Prévia reaproveitando o runtime da Fase 1 com dados de rascunho

### Fase 5 — Publicação e compartilhamento
- Publicar → gera slug estável → `updateTag(slug)` (não `revalidateTag`: o professor precisa ver a publicação surtir efeito na hora, não depois de uma revalidação em segundo plano)
- Painel: copiar link, abrir no WhatsApp, QR Code com download em PNG
- Encerrar e republicar

### Fase 6 — Polimento
- Acessibilidade: foco visível, contraste AA, alvos ≥48px, `prefers-reduced-motion`
- Estados vazios, carregamento e erro em todas as telas
- Manifest PWA + ícone (sem service worker)
- Teste em 360px de largura
- **Aula real com o jogo Propósito** — o critério de sucesso da seção 24

### Fora do MVP, por decisão
| Item | Origem | Observação |
|---|---|---|
| Coleta de respostas + painel agregado | Seções 8.6 e 16 | Tabelas aditivas; nasce sem histórico |
| Modo Aula (professor libera etapas) | Seção 15 | SSE ou polling de 3s; nada na arquitetura impede |
| IA assistente de criação | Seção 18 | Server Action + provedor; schemas Zod já servem de contrato de saída |
| Templates e biblioteca pública | Seção 22 | `duplicar` já é a base |

---

## 6. Riscos registrados

| # | Risco | Mitigação |
|---|---|---|
| 1 | Neon hiberna no free tier; primeiro acesso lento | Página do jogo cacheada por tag — o adolescente normalmente não toca no banco |
| 2 | `jsonb` sem integridade referencial | Validação Zod obrigatória em toda Server Action; sem exceção |
| 3 | Editar jogo publicado muda a experiência de quem está jogando | Comportamento documentado; sinal de que o Modo Aula é a solução real |
| 4 | Painel agregado nascerá sem histórico | Aceito; recap por WhatsApp cobre a aula no curto prazo |
| 5 | Autenticação escrita à mão | Escopo pequeno (poucos professores, sem dado sensível); bcrypt + cookie httpOnly, sem invenção. Migrar para Auth.js se abrir cadastro |
| 6 | Gamificação escorregar para pontuação/comparação | Proibido por contrato na seção 4 deste plano; revisar a cada tela nova |

---

## 7. Critério de conclusão do MVP

O cenário da seção 24 do descritivo, ponta a ponta, sem intervenção manual no banco:

```
Professor entra → cria a aula sobre Propósito → monta 5 desafios →
adiciona reflexões e referências → pré-visualiza → publica →
recebe link e QR Code → envia no grupo → adolescentes jogam pelo celular →
professor conduz a discussão a partir da experiência
```

---

## 8. Registro de ajustes

Mudanças feitas depois que o plano foi aprovado, com o motivo. O plano acima já está corrigido; esta seção existe para que a diferença não se perca.

### 2026-09-20 — Next.js 16 em vez de 15

O plano foi escrito assumindo Next.js 15. O estável publicado é **16.3.5**, e o `AGENTS.md` que o próprio framework instala avisa que a versão tem breaking changes em relação ao que um modelo de linguagem "sabe" — com os docs versionados em `node_modules/next/dist/docs/`. Consultados antes de escrever código. O que mudou de fato para este projeto:

| Item | Next 15 (plano) | Next 16 (real) |
|---|---|---|
| Cache da página pública | `unstable_cache` | `use cache` + `cacheTag`, exigindo `cacheComponents: true` |
| Invalidar ao publicar | `revalidateTag(tag)` | `updateTag(tag)` em Server Action — `revalidateTag` agora exige um 2º argumento de perfil e só serve stale-while-revalidate |
| Proteção de rota | `middleware.ts` | `proxy.ts`, runtime Node fixo |
| `params` / `searchParams` / `cookies()` | síncronos permitidos | **sempre** `await` |
| Bundler | opt-in | Turbopack por padrão em `dev` e `build` |

**`cacheComponents: true` foi ligado já na Fase 0**, e não adiado para o polimento, porque ele muda a regra de como toda leitura dinâmica precisa ser escrita (o que não é cacheado tem de estar sob Suspense). Ligar depois significaria revisar todas as telas prontas.

### 2026-09-20 — Zod 4

Instalado 4.6.5, não 3.x. `z.email()` e `z.uuid()` passaram a ser funções de topo e a customização de mensagem usa `error:` no lugar de `message:`. Sem impacto no desenho, mas o código do editor (Fase 4) precisa nascer nessa sintaxe.

### 2026-09-20 — Marco v0.1 antes da Fase 3

O Samuel aprovou a jornada no celular e pediu uma primeira versão para apresentar aos adolescentes com o jogo Propósito, antes de existir área do professor. Tag `v0.1` (commit `9913f62`), publicada no GitHub. Não estava no plano: as fases previam o MVP inteiro antes de qualquer uso real. É uma mudança boa — validar a experiência do adolescente com adolescentes de verdade antes de investir no editor é exatamente a ordem de risco que a seção 5 defende.

Preparação feita para o deploy, sem feature nova: raiz sem link para `/painel`, 404 com identidade, `icon.svg`, `metadataBase` via `appUrl()` (detecta a URL da Vercel sozinha), README com os passos.

### 2026-09-20 — `db` atrás de Proxy

Não previsto no plano. `src/db/client.ts` valida `DATABASE_URL` no primeiro uso, não no import, porque um `next build` em máquina sem a variável quebraria em qualquer rota que apenas importasse o módulo — inclusive rotas que não consultam o banco.
