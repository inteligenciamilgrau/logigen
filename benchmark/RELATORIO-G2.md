# Bateria G2 — continuação da exploração (30/10/2026)

Relatório parcial, atualizado a cada rodada. Começa onde a [G1](RELATORIO-G1.md) parou: a
lógica com "todo A é B" estava no teto para os quatro modelos low.

## Hipóteses desta rodada

| # | Hipótese | Teste |
|---|---|---|
| H1 | Operadores novos tiram a lógica do teto | 12 desafios com negação, contraposição, prova por casos e as falácias de afirmar o consequente e negar o antecedente; respostas "sim", "não" ou "não dá para saber" |
| H2 | O lote D da G1 (0/10) foi leitura do enunciado, não lógica | o mesmo lote com a linha "a lacuna pede um adjetivo", e repetido sem ela |
| H3 | O esforço funciona como mais um "indivíduo" para a análise de fator | operadores no Haiku max, ao lado do Haiku low |

## Como o gabarito é feito (G2)

Cada desafio sai de um molde ("prova por casos", "negar o antecedente"...), mas o gabarito vem de
um verificador ([`gerar-g2.js`](gerar-g2.js)). Ele testa todas as combinações de verdade dos
grupos ligados ao personagem e diz se as frases garantem "sim", garantem "não" ou não garantem
nada. Se o verificador discordar do molde, o desafio é descartado. O cabeçalho do prompt fixa
duas coisas que a G1 ensinou a fixar: responder só pelo que as frases garantem, e que "A ou B"
inclui os dois.

| Nível | Moldes |
|---|---|
| 1 | negação · contraposição · afirmar o consequente · negar o antecedente |
| 2 | prova por casos · silogismo disjuntivo · contraposição em cadeia · casos com um ramo aberto |
| 3 | casos + nenhum · disjuntivo + contraposição · nenhum + contraposição · casos com ramos diferentes |

## Resultados

### H1 — operadores: ainda no teto, até encadeados no ruído

| | G2 · operadores curtos (12) | G3 · operadores encadeados (12) |
|---|---|---|
| Haiku low | 12 | 12 |
| Haiku max | 12 | — |
| Sonnet low | 12 | **11** |
| Opus low | 12 | 12 |
| Fable low | 12 | 12 |

- A G2 tem negação, contraposição, prova por casos, silogismo disjuntivo e as duas falácias
  clássicas. Nenhum modelo caiu numa falácia: todos responderam "não dá para saber" quando era o
  caso.
- A G3 ([`gerar-g3.js`](gerar-g3.js)) encadeia 3, 6 ou 10 operações entre 10, 40 ou 100 regras
  de ruído, com o gabarito dado por um resolvedor SAT. A única queda foi do Sonnet low no item
  mais difícil (10 operações, 100 regras de ruído, contraposição por "nenhum" no fim): disse
  "não dá para saber" em vez de "não".
- Leitura: para esses modelos, a dedução explícita em português com palavras inventadas está
  resolvida, mesmo com operadores e ruído. É uma evidência forte para o objetivo 1 (raciocinar
  sobre o que nunca foi visto) e um problema para o objetivo 2: sem erro, não há o que medir.

### H4 — indução dura (4 traços, 10 exemplos, 3 casos novos)

| | acertos | observação |
|---|---|---|
| Haiku low | 9/9 | no desafio 8, escolheu "2 de 3" porque os desafios 4 e 9 seguiam esse padrão |
| Haiku max | 8/9 | no desafio 8, apontou a ambiguidade e escolheu "A e (B ou C)": "tem três condições; a outra exige pelo menos cinco para ser escrita" |
| Sonnet low | 8/9 | errou só o desafio 8 |
| Opus low | 8/9 | errou só o desafio 8 |
| Fable low | 8/9 | errou só o desafio 8 |

Os três erraram o mesmo desafio da mesma forma: a regra escondida era "pelo menos 2 de A, B, C",
e os três chegaram, cada um por conta própria, a "A e (C ou D)", que também explica os 10
exemplos e tem o mesmo número de condições. Essa família de regras não estava no espaço que o
gerador conferia. Recontando com ela, **3 dos 9 desafios** (6, 7 e 8) têm uma regra alternativa
compatível que muda a resposta. O "erro" no 8 é do item. Sem os itens ambíguos, os três modelos
acertaram tudo o que foi bem posto. Lição para o gerador: conferir a unicidade contra todas as
famílias de regras do mesmo tamanho, ou não pedir "a regra mais simples" quando há empate.

### H2 — o lote D da G1 foi leitura do enunciado?

| Rodada do lote D (Haiku low) | certos |
|---|---|
| G1, lido do arquivo | 0/10 (substantivo do primeiro passo nos 10) |
| com a dica "a lacuna pede um adjetivo" | 10/10 |
| repetido sem a dica | 10/10 |
| colado no prompt, sem arquivo | 10/10 |
| um por janela, em 17/10 | 7/10 (3 confusões com sósias) |

A troca de leitura da G1 não se repetiu: foi intermitente. E os lotes, lidos ou colados, não
tiveram nenhuma confusão de sósia (0 em 30), contra 5 erros em 20 com um desafio por janela
(bateria 7). Separando as variáveis:
- não é o arquivo nem as linhas numeradas: o lote colado também saiu 10/10;
- não é a data: refeito hoje, um por janela, o desafio C-2 repetiu a mesma confusão de 17/10.

### H5 — o formato da resposta muda o erro? Sim, e muito

Os 5 desafios da bateria 7 que o Haiku low tinha errado, refeitos hoje, numa janela cada, com
o mesmo texto (resultados em `g1/janela-hoje/`):

| Desafio | 17/10, formato aberto | hoje, formato aberto | hoje, "responda com uma palavra só" |
|---|---|---|---|
| C-2 | confusão | confusão ("freplerbosa e também xalhuntosa") | **certo**: "xisilha é palavra diferente de xisolha" |
| C-8 | cadeia cortada | confusão ("pladaspino", vindo do sósia trofelho) | **certo** |
| D-1 | confusão | confusão na lista ("também runizina", do sósia treponta) | **certo** |
| D-8 | confusão | certo | **certo** |
| D-10 | confusão | certo | **certo** |
| **total** | 0/5 | 2/5 | **5/5** |

- No formato aberto, o Haiku lista tudo o que consegue deduzir e trata sósias como "possível
  erro de digitação" ("assumi que é o mesmo predicado com grafia diferente"). Com isso, cita a
  palavra a que a isca leva, às vezes como resposta principal.
- Pedindo uma palavra só, ele lê com rigor e separa os sósias. Os lotes ("1: resposta") têm o
  mesmo efeito: 0 confusões em 30.
- **Releitura das baterias 6 e 7:** boa parte da "confusão com sósias" do Haiku low era um
  efeito do formato aberto, não um limite de leitura. O hábito de "corrigir erro de digitação"
  existe, mas aparece quando a pergunta deixa a resposta aberta.
- Lição de método: o formato da resposta faz parte do teste. Ele precisa ser fixo, igual para
  todos os modelos e registrado junto do resultado.

### H6 — a escada da morfologia é capacidade ou hábito? Quase toda hábito

A morfologia foi o único eixo que separou os modelos. O mesmo arquivo, com uma linha a mais:
"Escreva cada resposta já flexionada na forma que completa a frase corretamente" (respostas em
`g1/respostas-morf-dica/`).

| | sem a dica (2 rodadas) | com a dica | o que ainda erra com a dica |
|---|---|---|---|
| Haiku low | 3 · 3 | **7** | os 2 gerúndios |
| Sonnet low | 4 · 3 | 5 | os 2 gerúndios, feminino plural, plural misto |
| Opus low | 7 · 9 | 9 | — |
| Fable low | 9 · 7 | 9 | — |

- O Haiku passou a acertar todo o gênero: a falha de concordância era de **atenção espontânea**
  (perceber que a frase pede flexão), não de saber flexionar.
- O gerúndio resistiu à dica nos dois menores: para "A X está ___?", eles respondem o presente
  ("bronhanda") em vez do gerúndio ("bronhandando"). É o candidato a limite de verdade.
- Em psicometria, isso é a diferença entre **desempenho típico** (o que a pessoa faz por conta
  própria) e **desempenho máximo** (o que faz quando sabe o que se pede). O site mede o típico,
  e isso tem valor (é o objetivo 1: a IA entende a função da palavra sem ser avisada). Um teste
  de fator G precisa medir o máximo, senão compara hábitos.

### H7 — o gerúndio falha porque o verbo é inventado? No Haiku, sim; no Sonnet, não

Os mesmos 6 desafios de gerúndio, com palavras inventadas e com palavras reais ("Todo coelho
pisca. A Lívia é um coelho. A Lívia está ___?"), sem dica nenhuma
([`gerar-gerundio.js`](gerar-gerundio.js), respostas em `g5/respostas/`):

| | palavras reais | palavras inventadas |
|---|---|---|
| Haiku low | **6/6** ("piscando", "mergulhando"...) | 0/6 ("glenherna" em vez de "glenhernando") |
| Sonnet low | 0/6 ("pisca", "mergulha"...) | 0/6 |

- **Haiku low: falha no teste do wug.** Ele conhece a construção "está + gerúndio" e a aplica a
  verbos que já conhece, mas com um verbo nunca visto copia a forma escrita no texto. A regra do
  "-ndo" não é produtiva para ele sem ajuda. É exatamente o que o teste de Berko (1958) separa:
  regra aprendida × formas decoradas.
- **Sonnet low: estratégia, não vocabulário.** Copia a forma da regra até com verbos reais,
  escrevendo frases agramaticais ("A Lívia está pisca"). Ele trata a lacuna como "qual é a
  palavra", não como "complete a frase". Nem a dica de flexão (H6) mudou isso.
- Consequência para a [hipótese](../testes/HIPOTESE.md): a lógica abstrata sobre palavras novas
  se confirmou em todos os modelos; a **morfologia produtiva** sobre palavras novas não. Nos
  modelos menores, parte da flexão ainda depende do vocabulário conhecido.

### H8 — o esforço máximo corrige o gerúndio? Não

O teste do wug do gerúndio no esforço *max*:

| | palavras reais | palavras inventadas |
|---|---|---|
| Haiku low | 6/6 | 0/6 |
| Haiku max | — | 0/6 |
| Sonnet low | 0/6 | 0/6 |
| Sonnet max | 0/6 | 0/6 |

- Pensar mais não muda nada. O Haiku max explicou a escolha: "cada resposta é a palavra exata
  que aparece nas premissas, sem ajustar". É uma **política de resposta**, não pressa: diante
  de um verbo inventado, ele acha mais seguro copiar do que flexionar.
- O Sonnet mantém o mesmo padrão nos dois esforços e nas duas versões: a lacuna "está ___" recebe
  a forma copiada da regra, até quando a frase fica agramatical.
- Para o site, isso separa duas perguntas que hoje são corrigidas juntas: "a IA chegou à palavra
  certa?" (lógica, quase sempre sim) e "a IA acha que pode flexionar uma palavra que não
  conhece?" (uma política, que muda de modelo para modelo e não melhora com mais esforço).

### H9 — um exemplo resolvido destrava a flexão? Sim, por completo

Os mesmos 6 desafios com verbos inventados, com uma linha a mais no topo: um exemplo resolvido
com outras palavras inventadas ("Todo plimbo zarfa. O Tilo é um plimbo. O Tilo está ___?" →
"zarfando").

| | sem exemplo | com 1 exemplo |
|---|---|---|
| Haiku low | 0/6 | **6/6** |
| Sonnet low | 0/6 | **6/6** |

- A capacidade de aplicar o "-ndo" a um verbo nunca visto **existe** nos dois. Faltava saber que
  era permitido flexionar uma palavra inventada. Com um exemplo, os dois flexionaram as 6, todas
  na forma exata.
- Fecha a história da morfologia: sem dica, a "escada" mede uma política de resposta (copiar ×
  flexionar); com dica e exemplo, os quatro modelos flexionam. Opus e Fable flexionam sozinhos.
- Para o benchmark: o modo *desempenho máximo* precisa de um exemplo resolvido de cada tipo de
  resposta. Sem isso, um teste de "capacidade" mede quem adivinha melhor o que se espera.

### H10 e H11 — o teste do wug do plural (português)

Seis desafios de plural ([`gerar-plural.js`](gerar-plural.js), respostas em `g6/respostas/`):
2 adjetivos com grupo misto ("A X e o Y são ___?" pede o masculino), 2 no feminino plural e 2
verbos no plural ("A X e o Y ___?" → "-am", "-em"). Seis versões dos mesmos desafios:

| | inventadas | + exemplo sem troca de gênero | + exemplo com troca de gênero e "-em" | reais | palavras reais, nomes inventados | palavras inventadas, nomes reais |
|---|---|---|---|---|---|---|
| Haiku low | 2 | 3 | **6** | 6 | 5 | 4 |
| Sonnet low | 3 | 3 | **6** | 6 | 5 | 3 |

- **Com palavras inventadas, eles copiam o gênero da regra.** "Toda tronufa é xarezenta" + "A
  Gloplela e o Cloleu são ___?" → "xarezentas" (pede "xarezentos"). O Haiku explicou: "usei o
  plural masculino quando o predicado é masculino e o feminino quando o predicado é feminino". O
  artigo dos nomes ("**a** Bretrela e **a** Venhane") é ignorado.
- **O verbo inventado no plural tem dois erros diferentes.** O Haiku tratou o verbo como
  adjetivo ("gronetres", "gletoflas"). O Sonnet flexionou, mas errou a conjugação ("gronetram":
  a regra traz "gronetre", e o "-e" pede o plural em "-em"). É um erro de wug legítimo: deduzir
  a conjugação de um verbo nunca visto pela forma do singular.
- **O exemplo precisa mostrar a regra difícil.** Um exemplo sem troca de gênero não mudou nada
  (3/6). Com um exemplo de troca de gênero e outro de conjugação em "-em", os dois foram a 6/6.
- **Os nomes ajudam, mas não explicam tudo.** Com nomes reais (Marina, Caio) e palavras
  inventadas, o Haiku acertou todo o gênero, porque sabe que Marina é mulher. Mas os verbos
  continuaram copiados. Com palavras reais e nomes inventados, cada um errou o gênero de um grupo
  (o Haiku leu "a Bretrela e a Venhane" como grupo misto).

Leitura: são duas dificuldades independentes, as duas com palavras novas. (1) **Licença para
flexionar** o que não se conhece: sem exemplo, eles copiam a forma escrita. (2) **Atribuir
gênero** a um nome desconhecido pelo artigo: eles se apoiam no que sabem do nome. As duas somem
com exemplos certos ou palavras conhecidas.

### H12 — inglês: a concordância ao contrário

Em inglês o verbo no plural **perde** o "-s" ("Every spumorp bonorps. Gloondet and Clindus ___?"
→ "bonorp"), e adjetivo não tem gênero. Quem copia a forma da regra escreve "bonorps"; quem
aplica "plural leva S" também. Quatro plurais e dois gerúndios ("-ing"), com palavras inventadas
e reais ([`gerar-ingles.js`](gerar-ingles.js), respostas em `g7/respostas/`):

| | inventadas: plurais | inventadas: gerúndios | reais: plurais | reais: gerúndios |
|---|---|---|---|---|
| Haiku low | **4/4** | 0/2 ("farnends") | 4/4 | 0/2 ("play", "hop") |
| Sonnet low | **4/4** | 2/2 | 4/4 | 0/2 ("plays", "hops") |
| Opus low | 4/4 | 2/2 | — | — |
| Fable low | 4/4 | 2/2 | — | — |

- **O plural verbal em inglês funciona até com verbo inventado** (16 de 16), inclusive tirando o
  "-s" da forma escrita na regra. Em português, o plural de verbo inventado falhou nos mesmos
  modelos sem exemplo ("gronetre", "gronetres", "gronetram"). A mesma operação lógica (concordar
  o verbo com um sujeito plural) é produtiva numa língua e não na outra.
- Duas explicações possíveis, a testar: o inglês domina os dados de treino; e o plural inglês é
  mais simples (a forma básica, sem escolher conjugação), enquanto o português exige deduzir a
  conjugação ("-am" × "-em") pela forma do singular.
- **O gerúndio segue o ponto fraco dos menores**, nas duas línguas, com um detalhe estranho: o
  Sonnet acertou os gerúndios com verbos inventados em inglês e errou com verbos reais ("plays").
  Com 2 itens por condição, isso pode ser variação; precisa de repetição.
- A observação de que as regras das duas línguas são diferentes vira um **eixo de comparação
  entre línguas**: o mesmo esqueleto lógico, a concordância exigida muda (gênero só em português,
  plural verbal em direções opostas). Diferenças de acerto entre as duas versões mostram o que é
  regra aprendida e o que é hábito de uma língua.

### H13 e H14 — conjugação ou língua? E o gerúndio com mais itens

[`gerar-g8.js`](gerar-g8.js), respostas em `g8/respostas/`:
- **H13:** 6 verbos inventados no plural em português, 3 em "-a" ("ladadra" → "ladadram") e 3
  em "-e" ("gosache" → "gosachem");
- **H14:** 6 gerúndios em inglês, com verbos inventados e com verbos reais.

| | português, verbo em "-a" | português, verbo em "-e" | inglês, gerúndio inventado | inglês, gerúndio real |
|---|---|---|---|---|
| Haiku low | 0/3 ("são ladadra") | 0/3 ("são gosache") | 0/6 ("snololfs") | 0/6, mas **em português** ("pulando", "nadando") |
| Sonnet low | **3/3** | 2/3 ("gosacham") | 0/6 ("snololfs") | 0/6 ("jumps", "swims") |

- **Haiku: o problema em português é a classe da palavra.** Ele leu "Toda frosina ladadra" como
  "é ladadra" e respondeu "são ladadra", com o verbo inventado tomado por adjetivo. Em inglês,
  "Every spumorp bonorps" foi reconhecido como verbo (4/4 plurais na H12). A falha não é de
  conjugação; é reconhecer que uma palavra nova é verbo pela posição na frase, e isso falha em
  português, não em inglês.
- **Sonnet: o problema é a conjugação.** Verbos em "-a" sempre certos (3/3 aqui, 1/1 antes). Nos
  em "-e", errou 1 de 3 aqui e 1 de 1 antes, sempre trocando para "-am" ("gosacham",
  "gronetram"). Ele reconhece o verbo, mas deduzir "-er/-ir" pela forma "gosache" falha.
- **O gerúndio em inglês confirma o padrão do português**: com 6 itens, os dois copiaram a forma
  da regra em todos os casos. O acerto do Sonnet na H12 (2/2) foi variação.
- **Um achado à parte:** com verbos reais, o Haiku fez o gerúndio certo, mas traduziu a resposta
  para o português ("pulando" para "jumping") num desafio todo em inglês. A instrução do agente
  estava em inglês; o ambiente dele, em português. A **língua da resposta** é mais uma coisa que
  o teste precisa fixar.

## Síntese até aqui

1. **A dedução está resolvida para esses modelos**, mesmo com negação, "ou", falácias, 10
   operações encadeadas e 100 regras de ruído (51 de 52 respostas certas na G2 e na G3, contando
   o Haiku max). É a evidência mais forte até agora para o objetivo 1: raciocínio abstrato sobre
   texto que nunca existiu.
2. **O que separa os modelos não é a lógica**, são três coisas:
   - hábitos de resposta que dependem do formato: listar tudo, "corrigir erro de digitação",
     copiar a forma da regra (H5, H6, H7);
   - morfologia produtiva em palavras novas: o gerúndio de verbo inventado (H7);
   - ambiguidades do próprio teste, que modelos diferentes resolvem de jeitos diferentes (G1 e
     H4).
3. **A ordem dos modelos muda com o formato.** Sem dica, o Haiku low foi o pior em morfologia.
   Com a dica, ficou à frente do Sonnet low (7 × 5). O Sonnet low também ficou atrás do Haiku na
   indução (G1), na G3 e no gerúndio com palavras reais. Ou seja, o esforço *low* não é o mesmo
   regime para modelos diferentes, e um "fator geral" medido sem fixar o formato estaria medindo
   hábitos.
4. **Para medir um fator G, o teste precisa de dois modos**, como na psicometria:
   - *desempenho típico* (o modo do site, sem dicas), que mostra o que a IA faz por conta própria
     e serve ao objetivo 5 (diagnóstico);
   - *desempenho máximo* (tipo da resposta explícito, uma palavra só, flexão pedida e um exemplo
     resolvido de cada tipo), que é o que se compara entre modelos para procurar um fator comum
     (objetivos 2 e 4).
   Com o desempenho máximo, quase tudo o que separava os quatro modelos Claude desapareceu: a
   lógica, o gênero (H6) e o gerúndio (H9). O que sobra entre eles é pouco, e um fator G entre
   modelos tão próximos não teria variância para aparecer. Ele só pode ser procurado numa
   população mais diversa.
5. **Próximos testes que valem a pena:**
   - um eixo do wug pareado (verbo real × inventado, gerúndio, derivação em -dor, -vel, -oso), que
     separou os modelos de forma limpa e é o "conceito novo" mais simples do objetivo 3;
   - o esforço como variável (low × max em todos os modelos), para ver se a ordem se mantém;
   - modelos de fora da família Claude, onde a dedução ainda deve variar.

## Hipótese levantada na conversa: a lógica satura cedo, o resto é contexto?

Ideia do autor do projeto: se a lógica já está perfeita num modelo pequeno, não é preciso treinar
um modelo gigante com "livros e mais livros de medicina". Bastaria um modelo bom em lógica e um
anexo com bastante contexto. O site mediria, por padrão, **em que ponto cada eixo satura**: se
existe dificuldade que separa um Opus de um Haiku, ou se a lógica para de mudar a partir de
certo tamanho.

O que os dados daqui já dizem:
- **A favor:** com regras explícitas e completas no texto, o Haiku low chegou ao teto da
  dedução (30 passos, 500 regras, negação, "ou", falácias). Para esse tipo de tarefa, o modelo
  pequeno basta.
- **O que ainda separa os modelos não é lógica, é o que vem antes dela:** reconhecer a classe
  de uma palavra nova, deduzir a conjugação, entender o que a pergunta espera sem ser avisado
  (Opus e Fable flexionaram sozinhos; Haiku e Sonnet precisaram de exemplo). Num manual real, em
  prosa, sem "Todo A é B", essa leitura é justamente a parte difícil.
- **O eixo português × inglês** mede a invariância: a lógica foi a mesma nas duas línguas, e a
  concordância não. Uma lógica que se mantém quando a superfície muda é o sinal de abstração.

Teste proposto para decidir: um **manual fictício em prosa** (doenças, sintomas e exceções
inventados, para nada vir do treino), com centenas de parágrafos no contexto e perguntas de
várias etapas. Duas versões do mesmo manual: em regras "Todo A é B" e em prosa natural, com
sinônimos e relações implícitas. Se o Haiku empatar com o Opus nas duas, a hipótese se sustenta.
Se empatar só na versão em regras, a diferença entre os modelos está na leitura, não na lógica.

### Intuição: o que o modelo grande faz sem ser pedido

Segunda ideia da conversa: o fato de Opus e Fable flexionarem palavras inventadas por conta
própria mostra um ganho de "intuição", e não só de conhecimento. Os dados apoiam isso de três
formas:
- **Não é falta de saber a regra.** Haiku e Sonnet sabem fazer o gerúndio e o plural de verbos
  inventados: com um único exemplo, foram de 0/6 a 6/6. A regra está lá; o que falta é usá-la sem
  ser avisado.
- **Não é falta de pensar mais.** O Haiku max, pensando muito mais, continuou copiando, e explicou
  por quê ("a palavra exata das premissas, sem ajustar"). O Opus low, pensando o mínimo, flexionou
  de primeira. A diferença está no que o modelo faz de imediato, não no que ele delibera. É a
  diferença entre intuição e deliberação.
- **Não segue só o tamanho.** O Sonnet, maior que o Haiku, se comportou como ele, e às vezes pior
  (copiou o gerúndio até com verbos reais). A intuição varia de modelo para modelo, não só com a
  escala.

Isso vira uma medida: **o índice de intuição de cada eixo**, o acerto sem dica dividido pelo
acerto com dica e exemplo. Perto de 1, o modelo infere sozinho o que se espera; perto de 0, ele
sabe fazer, mas precisa ser guiado. No gerúndio de verbos inventados: Opus e Fable ≈ 1, Haiku e
Sonnet ≈ 0. Ela também ajusta a ideia anterior: para um modelo pequeno com bastante contexto, o
"anexo" precisa trazer exemplos do que se espera, não só os fatos.

### Pergunta nova: dá para treinar um modelo pequeno que seja "puro fator G"?

Ideia da conversa: um modelo menor, com o mínimo de dados e o máximo de lógica (dedutiva,
abdutiva, indutiva). Linhas de pesquisa que tocam nisso:
- **Dados poucos e bons:** Phi-1 ("Textbooks Are All You Need", Gunasekar e colegas, 2023) e
  TinyStories (Eldan e Li, 2023) mostraram que modelos pequenos com dados escolhidos ou sintéticos
  rendem muito acima do tamanho.
- **Destilação de raciocínio:** modelos pequenos treinados com as cadeias de raciocínio de um
  modelo grande (por exemplo, as versões destiladas do DeepSeek-R1, 2025).
- **Lógica sintética, parente direto do LogiGen:** RuleTaker (Clark e colegas, 2020) e ProofWriter
  (Tafjord e colegas, 2021) treinaram modelos em bases de regras geradas.
- **O alerta:** "On the Paradox of Learning to Reason from Data" (Zhang e colegas, 2023) mostrou
  que um modelo treinado só com lógica sintética aprende as estatísticas do gerador, não o
  raciocínio, e falha quando a distribuição muda.

Como o LogiGen pode testar isso: ele é uma fonte infinita de exercícios com gabarito verificável
e palavras que não existem (nada a decorar). O desenho que separa "lógica geral" de "atalho do
gerador" é **treinar em alguns eixos e medir nos outros**: treinar em dedução e medir indução,
treinar em português e medir inglês. Se o ganho se transfere, é um ganho geral, a definição
operacional de um fator G. Se não se transfere, o modelo aprendeu o gerador.

### Analogia da conversa: afasias e "lesões" em modelos

No AVC, a afasia de Broca tira a fala e preserva o pensamento; a de Wernicke preserva a fala e
tira a coerência. Pergunta: cérebro e LLM são como um computador com uma "ULA" central (perdeu,
perdeu tudo) ou aprendem tudo localmente (estragou um ponto, perde só aquilo)?

- **No cérebro:** a rede da linguagem e a rede do raciocínio são separáveis. Pessoas com afasia
  grave ainda fazem aritmética, quebra-cabeças lógicos e entendem intenções (Fedorenko e Varley,
  2016; Fedorenko, Piantadosi e Gibson, *Nature*, 2024). Esses estudos usam frases
  "Jabberwocky", com palavras inventadas e gramática real, exatamente como o LogiGen.
- **Nos LLMs:** a conta passa toda pelas mesmas unidades de cálculo (a "ULA" do hardware), mas as
  funções ficam espalhadas nos pesos, com alguma localização. Fatos podem ser editados em pontos
  específicos (Meng e colegas, 2022), e desligar "neurônios de uma língua" afeta aquela língua e
  preserva as outras (Tang e colegas, 2024), uma afasia artificial. A pesquisa de
  interpretabilidade da Anthropic (2025) achou conceitos compartilhados entre línguas, com
  entrada e saída específicas de cada língua.
- **Nos dados de hoje:** a lógica saturou e a morfologia de palavras novas variou, como se fossem
  partes separáveis. E o Haiku que respondeu "pulando" para "jumping" calculou o conceito certo
  e mandou a saída para a língua errada: o conceito ficou intacto e a produção trocou de língua.

Experimentos possíveis: (1) **comportamental, já:** desafio numa língua e resposta pedida em
outra, para ver se a lógica sobrevive quando a produção muda de língua; (2) **com modelos
abertos:** "lesionar" neurônios de uma língua e medir se a lógica do LogiGen continua, como
numa afasia de Broca.

### H15 — troca de língua: a lógica sobrevive quando a "saída" muda de língua?

O experimento comportamental da analogia das afasias ([`gerar-g9.js`](gerar-g9.js), respostas em
`g9/respostas/`). Desafio numa língua, resposta pedida na outra, com palavras reais e 2 passos
com distração. Seis desafios por direção: adjetivo com grupo misto, adjetivo com grupo feminino,
2 verbos no plural e 2 gerúndios.

| | inglês → resposta em português | português → resposta em inglês |
|---|---|---|
| Haiku low | **6/6** | 4/6 + 2 com a forma errada ("jumping" para "jump") |
| Sonnet low | **6/6** | **6/6** |
| Opus low | **6/6** | 4/6 + 2 leituras alternativas válidas |

- **A lógica sobreviveu à troca de língua em todos os casos.** Nenhum conceito errado de verdade.
  As duas respostas do Opus que o corretor marcou como erro ("hungry", "famous") são adjetivos da
  própria cadeia: em português, "a Marina **está** ___?" aceita adjetivo de estado ("está
  faminta"). O item é ambíguo na direção português → inglês; em inglês, "What is X doing?" não
  é.
- **A produção se adaptou à gramática da língua de saída**, inclusive o que o texto de origem não
  marcava. Com o problema em inglês (sem gênero), os três escreveram "famosos" para "Marina and
  Bruno" e "cansadas" para "Clara and Sofia": tiraram o gênero dos nomes e fizeram a concordância
  do português.
- **Nada de "afasia" com palavras reais.** O conceito é calculado à parte da língua, e a saída é
  montada na língua pedida, como na imagem de conceitos compartilhados com entrada e saída por
  língua. As falhas de produção que vimos antes só apareceram com **palavras inventadas**, quando
  a regra precisa ser aplicada a um item desconhecido.
- Lição para o gerador: em português, a pergunta do gerúndio ("está ___?") não pode ter adjetivo
  de estado na cadeia, ou vira ambígua.

## Custo desta rodada

70 subagentes (40 até a H9, 18 nos testes de plural e de inglês, 6 na G8 e 6 na G9). A janela de
5 horas foi de 26% para 42%, e a semanal, de 8% para 10%.
