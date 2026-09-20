# Sistema de Gamificação para Aulas com Adolescentes

## 1. Visão Geral

Desenvolver uma aplicação web simples de **gamificação para aulas cristãs com adolescentes**.

A proposta não é criar apenas um jogo específico, mas uma ferramenta reutilizável em que o **professor constrói uma atividade interativa a partir do tema da aula**, organiza perguntas, situações, desafios, reflexões e referências bíblicas e, ao final, gera um jogo que possa ser compartilhado com os adolescentes por meio de um link.

O sistema deve funcionar como um apoio à aula presencial: o jogo introduz situações, provoca escolhas e reflexões e cria oportunidades para o professor aprofundar o conteúdo com a turma.

Exemplo inicial de tema: **Propósito à luz da Bíblia e da vida cristã**.

A aplicação deve ser simples, visual, responsiva e especialmente confortável para uso em celulares.

---

# 2. Ideia Central

O fluxo principal deve ser:

**Professor cria uma aula → transforma o conteúdo em uma experiência gamificada → publica → compartilha → adolescentes jogam → professor utiliza as respostas e reflexões durante a aula.**

O foco não deve estar em competição ou em medir quem é “mais cristão”.

A gamificação deve servir para:

- despertar curiosidade;
- aumentar a participação;
- apresentar situações próximas da realidade dos adolescentes;
- provocar reflexão;
- conectar escolhas do cotidiano com princípios bíblicos;
- facilitar discussões em grupo;
- tornar a aula mais dinâmica;
- reforçar o conteúdo apresentado pelo professor.

---

# 3. Princípios do Produto

## 3.1 Simplicidade

O professor não deve precisar entender de tecnologia para montar uma atividade.

Criar um jogo precisa ser semelhante a montar um pequeno formulário ou apresentação.

## 3.2 Mobile First

Os adolescentes provavelmente acessarão o jogo pelo celular através de um link compartilhado no WhatsApp ou QR Code.

Toda a experiência do jogador deve ser pensada primeiro para telas pequenas.

## 3.3 Conteúdo cristão conduzido pelo professor

O sistema é uma ferramenta.

O professor continua responsável pelo conteúdo, interpretação, referências bíblicas e direcionamento da aula.

O sistema deve ajudar a organizar e apresentar esse conteúdo de maneira interativa.

## 3.4 Reflexão acima de pontuação

Nem toda pergunta precisa ter uma resposta simplesmente “certa” ou “errada”.

Devem existir desafios que apresentem situações e, após a escolha do adolescente, revelem uma reflexão e um princípio bíblico relacionado.

Exemplo:

> Seus amigos dizem que sucesso significa ter dinheiro, seguidores e ser admirado. O que você pensa sobre isso?

Depois da escolha, o jogo pode apresentar uma reflexão baseada em Mateus 6:21.

## 3.5 Reutilização

O mesmo sistema deve permitir criar jogos sobre diferentes temas, definidos pelo professor.

---

# 4. Perfis

Inicialmente considerar dois contextos de uso.

## Professor

Responsável por criar, editar, organizar, publicar e compartilhar os jogos.

## Jogador

Adolescente que recebe um link e participa da experiência.

Na primeira versão, evitar exigir cadastro do adolescente.

O acesso ao jogo deve ser o mais simples possível.

---

# 5. Jornada do Professor

## 5.1 Dashboard

Após entrar no sistema, o professor visualiza seus jogos/aulas.

Exemplo:

- Propósito
- Identidade em Cristo
- Amizades
- Escolhas
- Fé no cotidiano

Cada jogo pode possuir estados como:

- Rascunho
- Publicado
- Encerrado

Ações principais:

- Criar novo jogo
- Editar
- Visualizar
- Duplicar
- Publicar
- Compartilhar
- Encerrar

---

# 6. Criando um Jogo

Ao selecionar **Criar novo jogo**, iniciar um fluxo simples.

## Etapa 1 — Informações da aula

Campos sugeridos:

**Tema da aula**

Exemplo:

> Propósito

**Título do jogo**

Exemplo:

> Missão: Descubra o Propósito

**Objetivo da aula**

Exemplo:

> Fazer os adolescentes compreenderem que propósito cristão não começa apenas na profissão ou nos sonhos pessoais, mas em entender para quem estamos vivendo.

**Texto bíblico principal**

Exemplo:

> Efésios 2:10

**Descrição ou contexto**

Campo livre para o professor explicar o assunto que será trabalhado.

---

# 7. Estrutura do Jogo

O professor deve conseguir adicionar uma sequência de **etapas/desafios**.

Exemplo:

```text
Início
  ↓
Desafio 1
  ↓
Reflexão
  ↓
Desafio 2
  ↓
Reflexão
  ↓
Desafio 3
  ↓
Reflexão
  ↓
Conclusão
```

Cada etapa deve ser editável e ordenável.

---

# 8. Tipos de Etapas

A arquitetura deve permitir expansão futura, mas inicialmente considerar alguns tipos simples.

## 8.1 Escolha

Apresenta uma situação e algumas alternativas.

Exemplo:

> Você ganhou um objeto que nunca viu antes. Como descobriria para que ele foi criado?

Alternativas:

- Inventaria uma utilidade.
- Perguntaria para quem criou.
- Faria aquilo que outras pessoas fazem.

Depois da resposta, apresentar a reflexão definida pelo professor.

---

## 8.2 Situação do cotidiano

Apresenta um pequeno cenário relacionado à realidade do adolescente.

Exemplo:

> Todos os seus amigos dizem que sucesso significa ter dinheiro, seguidores e ser admirado.

Pergunta:

> O que deveria definir sucesso para um cristão?

O objetivo é gerar conversa e reflexão.

---

## 8.3 Verdadeiro ou falso

Perguntas rápidas para quebrar o ritmo e verificar entendimento.

Exemplo:

> “Meu propósito é necessariamente a profissão que escolherei no futuro.”

Verdadeiro / Falso

Depois da resposta, explicar o conceito.

---

## 8.4 Reflexão pessoal

Não precisa existir resposta correta.

Exemplo:

> O que mais influencia suas escolhas atualmente?

Possíveis opções:

- Deus
- Família
- Amigos
- Redes sociais
- Dinheiro
- Futuro
- Aceitação
- Sonhos

Esse tipo de pergunta pode ser utilizado posteriormente pelo professor para iniciar uma conversa.

---

## 8.5 Versículo

Apresenta um texto bíblico relacionado ao desafio anterior.

Exemplo:

> “...fazei tudo para a glória de Deus.”

**1 Coríntios 10:31**

Pode acompanhar uma pequena explicação criada pelo professor.

---

## 8.6 Pergunta aberta

Exemplo:

> Para você, o que significa viver com propósito?

O adolescente pode escrever uma pequena resposta.

Avaliar durante a implementação se essas respostas serão armazenadas já no MVP ou inicialmente utilizadas apenas na experiência local.

---

# 9. Estrutura de um Desafio

Um desafio pode possuir:

```text
Título

Contexto / situação

Pergunta

Alternativas

Resposta esperada (quando aplicável)

Feedback

Reflexão

Referência bíblica

Texto bíblico

Pergunta para discussão em grupo
```

Nem todos os campos precisam ser obrigatórios.

---

# 10. Feedback após a Escolha

Uma característica importante do sistema será não simplesmente informar:

> Certo.

ou:

> Errado.

O feedback deve ensinar.

Exemplo:

### Escolha realizada

> Perguntar para quem criou.

### Reflexão

> Se queremos entender profundamente o propósito de alguma coisa, faz sentido conhecer a intenção de quem a criou. Na fé cristã, compreender nosso propósito começa olhando para Deus como Criador.

### Base bíblica

> “Pois somos feitura dele, criados em Cristo Jesus para boas obras...”

**Efésios 2:10**

---

# 11. Conclusão do Jogo

Ao terminar todas as etapas, apresentar uma tela de fechamento criada pelo professor.

Para o exemplo sobre propósito:

## Missão concluída

> Propósito cristão não é apenas descobrir o que vou fazer. Começa entendendo de quem eu sou, para quem vivo e quem estou me tornando.

Uma representação visual poderia ser:

```text
CRIADOR
   ↓
IDENTIDADE
   ↓
PROPÓSITO
   ↓
VIDA
```

E finalizar com uma pergunta para discussão:

> Se minha profissão, meus sonhos e meus planos mudarem, ainda posso continuar vivendo meu propósito? Por quê?

Essa pergunta pode ser utilizada pelo professor para retomar a conversa presencial.

---

# 12. Publicação

Quando o professor terminar a atividade, deve existir uma opção:

## Publicar jogo

O sistema gera uma URL pública única.

Exemplo conceitual:

```text
/app/jogar/proposito-7H3K
```

O professor pode:

- copiar o link;
- compartilhar pelo WhatsApp;
- gerar QR Code;
- abrir uma prévia do jogo.

O adolescente não deve precisar instalar aplicativo.

Basta acessar pelo navegador.

---

# 13. Experiência do Adolescente

Ao abrir o link:

## Tela inicial

Mostrar:

- título;
- tema;
- pequena apresentação;
- botão **Começar missão**.

Opcionalmente solicitar apenas:

> Como você quer ser chamado?

Evitar cadastro, senha, e-mail ou qualquer barreira desnecessária.

---

# 14. Durante o Jogo

Exibir uma etapa por vez.

Exemplo:

```text
MISSÃO 2 DE 5

O QUE ESTÁ GUIANDO VOCÊ?

[ situação ]

[ alternativa A ]

[ alternativa B ]

[ alternativa C ]

        ↓

REFLEXÃO

[ explicação ]

📖 Mateus 6:21

[ Próxima missão ]
```

Mostrar visualmente o progresso:

```text
● ● ● ○ ○

3 de 5
```

A experiência deve ser rápida e adequada para toque.

---

# 15. Uso Presencial

O sistema deve considerar que o jogo será utilizado dentro de uma aula.

O professor pode orientar:

> Respondam a missão 1.

Os adolescentes respondem.

Depois o professor pode interromper o avanço para conversar sobre aquela situação.

Em versões futuras, pode existir um **Modo Aula**, no qual o professor controla quando a próxima etapa é liberada.

Exemplo:

```text
Professor
      ↓
Liberar missão 2
      ↓
Todos os celulares avançam
```

Esse recurso não precisa necessariamente fazer parte do primeiro MVP, mas a arquitetura não deve impedir sua evolução.

---

# 16. Resultados da Turma

Uma evolução importante será permitir ao professor visualizar respostas agregadas.

Exemplo:

## Pergunta

> O que mais influencia suas escolhas hoje?

```text
Amigos          30%
Redes sociais   25%
Família         20%
Futuro          15%
Outros          10%
```

O objetivo não é identificar ou julgar adolescentes individualmente.

O objetivo é fornecer ao professor informação para conduzir a conversa:

> “Olhem o resultado da nossa turma. Por que vocês acham que amigos e redes sociais apareceram tanto?”

Sempre que possível, priorizar resultados agregados e privacidade.

---

# 17. Gamificação

A gamificação deve ser leve.

Elementos possíveis:

- missões;
- progresso;
- desafios;
- jornada;
- descoberta;
- pequenas conquistas;
- transições;
- mensagens de incentivo;
- conclusão da missão.

Evitar transformar a experiência cristã em uma pontuação espiritual.

Não utilizar conceitos como:

```text
Você é 90% cristão.
Sua fé vale 70 pontos.
Você é mais espiritual que os outros.
```

A recompensa principal deve ser **descoberta, reflexão e participação**.

---

# 18. Possível Assistência de IA

Uma evolução futura pode utilizar IA para ajudar o professor a construir o jogo.

Exemplo:

Professor informa:

```text
Tema:
Propósito

Faixa etária:
13–17 anos

Texto principal:
Efésios 2:10

Objetivo:
Mostrar que propósito não é somente profissão,
mas viver para Deus.
```

O sistema poderia sugerir:

- título;
- estrutura da jornada;
- situações;
- perguntas;
- alternativas;
- reflexões;
- referências bíblicas relacionadas;
- perguntas para discussão.

O professor deve revisar e aprovar todo conteúdo antes da publicação.

A IA deve atuar como **assistente de preparação**, não como autoridade teológica.

---

# 19. Exemplo de Jogo — Propósito

Utilizar o tema **Propósito** como primeiro caso real para validar o produto.

Sugestão:

### Missão 1 — Quem define o propósito?

Conceito:

> Criador → Criação → Propósito

Referência:

> Efésios 2:10

### Missão 2 — O que guia minha vida?

Situação envolvendo:

- amigos;
- redes sociais;
- sucesso;
- dinheiro;
- aprovação.

Referência sugerida:

> Mateus 6:21

### Missão 3 — Para quem estou vivendo?

Mostrar que atividades comuns também podem glorificar a Deus.

Referência:

> 1 Coríntios 10:31

### Missão 4 — Propósito é profissão?

Mostrar que profissão, sonhos e circunstâncias podem mudar sem reduzir propósito cristão a uma carreira.

Referência:

> Mateus 22:37–39

### Missão 5 — Minha resposta

Pergunta:

> Como posso viver minha vida amando a Deus, amando pessoas e glorificando a Deus no que faço?

Referência:

> Romanos 11:36

### Encerramento

Mensagem:

> Antes de perguntar “O que eu vou fazer da minha vida?”, experimente perguntar “Para quem eu estou vivendo a minha vida?”

---

# 20. Diretrizes de Interface

O design deve ser:

- moderno;
- jovem;
- simples;
- acolhedor;
- visual;
- responsivo;
- mobile first;
- fácil de entender sem instruções extensas.

Evitar aparência infantil demais.

O público são adolescentes.

Utilizar elementos visuais relacionados a:

- jornada;
- descoberta;
- missão;
- caminhos;
- escolhas;
- progresso.

Não sobrecarregar as telas com texto.

Cada tela deve possuir um objetivo claro.

---

# 21. MVP Sugerido

A primeira versão deve validar a ideia com o mínimo de complexidade.

## Professor

- autenticação simples;
- criar jogo;
- editar jogo;
- criar etapas;
- ordenar etapas;
- pré-visualizar;
- publicar;
- copiar link;
- gerar QR Code;
- listar jogos existentes.

## Adolescente

- acessar link;
- iniciar jogo;
- navegar pelas etapas;
- responder escolhas;
- visualizar feedback/reflexão;
- visualizar referências bíblicas;
- acompanhar progresso;
- finalizar atividade.

## Fora do MVP inicialmente

Avaliar posteriormente:

- ranking;
- multiplayer em tempo real;
- modo professor controlando a turma;
- relatórios avançados;
- histórico individual;
- IA gerando conteúdo;
- biblioteca pública de jogos;
- equipes;
- conquistas complexas.

---

# 22. Evoluções Possíveis

Após validar o MVP:

### Biblioteca de aulas

O professor poderá reutilizar e duplicar jogos anteriores.

### Templates

Modelos como:

- Quiz
- Jornada
- Escolhas
- Verdadeiro/Falso
- Estudo bíblico interativo

### IA para criação

Professor descreve o tema e recebe uma primeira estrutura para editar.

### Modo Aula

Professor controla o andamento da experiência em tempo real.

### Painel ao vivo

Mostrar respostas agregadas enquanto os adolescentes participam.

### Histórico

Visualizar quais temas já foram trabalhados.

### Compartilhamento entre professores

Permitir que outro professor duplique uma atividade para sua própria turma.

---

# 23. Diretriz Técnica para o Agente

Antes de implementar:

1. analisar este documento;
2. propor uma arquitetura simples e compatível com o objetivo do produto;
3. evitar complexidade prematura;
4. definir claramente o MVP;
5. modelar os conceitos principais;
6. propor estrutura de frontend, backend e persistência;
7. planejar a implementação em fases pequenas;
8. utilizar o jogo **Propósito** como primeiro cenário de validação ponta a ponta.

Entidades conceituais iniciais a considerar:

```text
Professor
Jogo
Etapa
Alternativa
Reflexão
Referência Bíblica
Publicação
Sessão de Jogo
Resposta
```

Essas entidades são apenas direcionadoras.

O agente deve analisar a necessidade real antes de definir a modelagem definitiva.

---

# 24. Resultado Esperado

Ao final do MVP, deve ser possível realizar o seguinte cenário:

```text
Professor entra no sistema
        ↓
Cria uma aula sobre PROPÓSITO
        ↓
Monta 5 desafios
        ↓
Adiciona reflexões e referências bíblicas
        ↓
Visualiza como ficará para o adolescente
        ↓
Publica
        ↓
Sistema gera link / QR Code
        ↓
Professor envia no grupo
        ↓
Adolescentes acessam pelo celular
        ↓
Jogam e refletem sobre as situações
        ↓
Professor utiliza a experiência para conduzir a discussão
```

O sucesso da aplicação não será medido pela quantidade de funcionalidades, mas pela capacidade de tornar uma aula cristã com adolescentes **mais participativa, reflexiva e envolvente sem aumentar a complexidade para o professor**.
