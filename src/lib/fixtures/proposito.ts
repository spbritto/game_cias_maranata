import type { Conclusion, StepData } from "@/lib/schemas/step";

/**
 * Conteúdo do jogo "Propósito" — seção 19 do descritivo.
 *
 * Fonte única: o seed (`scripts/seed-proposito.ts`) insere isto no banco e a
 * rota de demonstração (`/demo`, só em desenvolvimento) renderiza a partir daqui
 * sem tocar no Neon. Assim dá para iterar no visual da jornada sem banco e sem
 * duplicar o conteúdo em dois lugares.
 */

export const PROPOSITO_SLUG = "proposito-7H3K";

export const propositoGame = {
  title: "Missão: Descubra o Propósito",
  theme: "Propósito",
  objective:
    "Fazer os adolescentes compreenderem que propósito cristão não começa na profissão nem nos sonhos pessoais, mas em entender para quem estamos vivendo.",
  mainScripture: "Efésios 2:10",
  description:
    "Cinco missões curtas que saem de uma situação do cotidiano e chegam em um princípio bíblico. Pensado para ser jogado no celular durante a aula, com pausas para conversa.",
};

export const propositoConclusion: Conclusion = {
  title: "Missão concluída",
  message:
    "Propósito cristão não é apenas descobrir o que eu vou fazer. Começa entendendo de quem eu sou, para quem eu vivo e quem eu estou me tornando. Antes de perguntar “o que eu vou fazer da minha vida?”, experimente perguntar “para quem eu estou vivendo a minha vida?”.",
  diagram: ["Criador", "Identidade", "Propósito", "Vida"],
  discussionQuestion:
    "Se a minha profissão, os meus sonhos e os meus planos mudarem, eu ainda posso continuar vivendo o meu propósito? Por quê?",
  scriptureRef: "Romanos 11:36",
  scriptureText:
    "Pois dele, por ele e para ele são todas as coisas. A ele seja a glória para sempre! Amém.",
};

export const propositoSteps: StepData[] = [
  // Missão 1 — Quem define o propósito?
  {
    type: "choice",
    title: "Quem define o propósito?",
    context:
      "Imagine que alguém te entrega um objeto que você nunca viu na vida. Formato estranho, nenhum botão, nenhuma instrução. Ninguém na sala sabe dizer o que é.",
    question: "Como você descobriria para que ele foi criado?",
    options: [
      {
        id: "inventar",
        label: "Inventaria uma utilidade para ele.",
        reflection:
          "Você provavelmente conseguiria. Dá para usar quase qualquer coisa como peso de papel. Mas repare: isso não seria descobrir o propósito dele — seria dar um. E dar um propósito qualquer costuma render bem menos do que o objeto era capaz de fazer.",
      },
      {
        id: "criador",
        label: "Perguntaria para quem criou.",
        reflection:
          "Se queremos entender profundamente o propósito de alguma coisa, faz sentido conhecer a intenção de quem a criou. Na fé cristã, compreender o nosso propósito começa olhando para Deus como Criador — não porque isso limita a vida, mas porque é ali que ela faz sentido.",
        scriptureRef: "Efésios 2:10",
        scriptureText:
          "Pois somos criação de Deus realizada em Cristo Jesus para fazermos boas obras, as quais Deus preparou de antemão para que nós as praticássemos.",
      },
      {
        id: "copiar",
        label: "Olharia o que as outras pessoas fazem com o delas.",
        reflection:
          "É o caminho mais rápido e o mais comum. O problema é que, se todo mundo está copiando todo mundo, ninguém de fato foi atrás da resposta. Muita gente descobre tarde que passou anos vivendo a versão de propósito que viu nos outros.",
      },
    ],
    correctOptionId: "criador",
    reflection:
      "Existe uma ordem aqui que vale carregar para o resto da jornada: primeiro o Criador, depois a criação, e só então o propósito.",
    discussionQuestion:
      "Em que áreas da sua vida você tem ido atrás da intenção de Deus, e em que áreas você tem inventado ou copiado?",
  },

  // Missão 2 — O que está guiando você?
  {
    type: "scenario",
    title: "O que está guiando você?",
    context:
      "No grupo da escola, o assunto é sempre o mesmo: quem viajou, quem comprou, quem tem quantos seguidores, quem foi chamado para quê. Ontem alguém disse, meio de brincadeira, que só é bem-sucedido quem consegue ser admirado. Todo mundo riu e concordou.",
    question: "O que deveria definir sucesso para um cristão?",
    options: [
      {
        id: "reconhecimento",
        label: "Ser reconhecido pelo que eu conquistei.",
        reflection:
          "Reconhecimento não é pecado, e conquistar coisas também não. O problema é quando ele vira a medida: quem depende de ser admirado precisa de plateia nova o tempo todo, e nenhuma plateia dura para sempre.",
      },
      {
        id: "estabilidade",
        label: "Ter estabilidade e não precisar de ninguém.",
        reflection:
          "Faz sentido querer segurança. Mas a Bíblia trata independência total como ilusão, não como conquista — fomos feitos para depender de Deus e para viver com pessoas, não apesar delas.",
      },
      {
        id: "fidelidade",
        label: "Ser fiel a Deus no que está na minha mão hoje.",
        reflection:
          "Essa é a medida que não depende de plateia nem de circunstância. Ela cabe num dia comum, numa prova, numa conversa difícil em casa. E é a única que continua valendo quando tudo o mais muda.",
      },
    ],
    reflection:
      "Jesus não disse que é errado ter tesouro. Ele disse que o coração vai junto com ele. A pergunta não é “o que eu quero ter?”, é “para onde isso está levando o meu coração?”.",
    scriptureRef: "Mateus 6:21",
    scriptureText:
      "Pois onde estiver o seu tesouro, aí também estará o seu coração.",
    discussionQuestion:
      "Se alguém olhasse só a sua semana — sem você explicar nada — onde diria que está o seu tesouro?",
  },

  // Missão 3 — Propósito é profissão?
  {
    type: "true_false",
    title: "Propósito é profissão?",
    statement:
      "O meu propósito é necessariamente a profissão que eu vou escolher no futuro.",
    answer: false,
    explanation:
      "Profissão é uma das formas de viver o propósito, não o propósito em si. Se fosse a mesma coisa, quem ainda não escolheu carreira estaria sem propósito, e quem trocasse de área perderia o seu. A Bíblia aponta para outra direção: o propósito começa em amar a Deus e amar as pessoas — e isso você já pode viver hoje, na escola, em casa, no grupo de amigos, antes de decidir qualquer carreira.",
    scriptureRef: "Mateus 22:37-39",
    scriptureText:
      "“Ame o Senhor, o seu Deus, de todo o seu coração, de toda a sua alma e de todo o seu entendimento.” Este é o primeiro e maior mandamento. E o segundo é semelhante a ele: “Ame o seu próximo como a si mesmo.”",
    discussionQuestion:
      "O que muda na forma como você encara o vestibular ou o primeiro emprego se o propósito não depende deles?",
  },

  // Interlúdio — para quem estou vivendo?
  {
    type: "verse",
    title: "Para quem estou vivendo?",
    scriptureRef: "1 Coríntios 10:31",
    scriptureText:
      "Assim, quer vocês comam, bebam ou façam qualquer outra coisa, façam tudo para a glória de Deus.",
    comment:
      "Repare no que Paulo escolheu como exemplo: comer e beber. As coisas mais comuns do dia. Ele não está falando de momentos grandiosos — está dizendo que a vida inteira, inclusive a parte sem graça dela, cabe dentro do propósito.",
  },

  // Missão 4 — O que influencia as minhas escolhas
  {
    type: "reflection",
    title: "O que está te influenciando?",
    question: "O que mais influencia as suas escolhas hoje?",
    options: [
      { id: "deus", label: "Deus" },
      { id: "familia", label: "Família" },
      { id: "amigos", label: "Amigos" },
      { id: "redes", label: "Redes sociais" },
      { id: "dinheiro", label: "Dinheiro" },
      { id: "futuro", label: "Futuro" },
      { id: "aceitacao", label: "Aceitação" },
      { id: "sonhos", label: "Sonhos" },
    ],
    allowMultiple: true,
    reflection:
      "Não existe resposta certa aqui, e ninguém vai ver o que você marcou. A pergunta é só para você olhar com honestidade: o que costuma falar mais alto na hora de decidir?",
    discussionQuestion:
      "Por que vocês acham que amigos e redes sociais aparecem tanto nessa lista? O que isso diz sobre a idade de vocês — e sobre a nossa também?",
  },

  // Missão 5 — Minha resposta
  {
    type: "open_question",
    title: "Minha resposta",
    context:
      "Última missão. Essa resposta fica só no seu celular — você decide se quer mostrar para alguém.",
    question:
      "Como você pode viver a sua vida amando a Deus, amando pessoas e glorificando a Deus no que você faz?",
    placeholder: "Escreva do seu jeito, sem se preocupar com a forma...",
    maxLength: 600,
    reflection:
      "Guarde o que você escreveu. Daqui a um tempo, vale reler e ver o que mudou.",
    scriptureRef: "Romanos 11:36",
    scriptureText:
      "Pois dele, por ele e para ele são todas as coisas. A ele seja a glória para sempre! Amém.",
  },
];
