# Bateria G1 — piloto do "fator G" (30/10/2026)

> **Versão:** rodou entre a 1.0 e a 1.1 do site. Os prompts usados estão salvos em `g1/`; ver
> [CHANGELOG.md](../CHANGELOG.md).

> Continuação em [RELATORIO-G2.md](RELATORIO-G2.md): operadores, indução dura, formato da
> resposta, dica de flexão e o teste do wug do gerúndio. Ela revê duas leituras daqui: a
> "confusão com sósias" vem em boa parte do formato aberto da resposta, e a escada da morfologia
> é em boa parte hábito, não capacidade.

Uma hora de exploração para responder: dá para transformar o LogiGen numa medida de
inteligência geral, no estilo do fator G humano? E o que falta para o método ficar robusto?

**Resposta curta:** ainda não dá para confirmar um fator G, e o motivo é claro. Nos eixos de
lógica, os quatro modelos Claude no esforço *low* bateram no teto, até em desafios extremos
(cadeias de 30 passos, 500 regras). Só a **concordância de gênero** separou os modelos, em dois
degraus: Haiku e Sonnet embaixo, Opus e Fable em cima. Dentro de cada degrau, a ordem trocou de
uma rodada para outra. Um fator geral precisa de vários eixos **diferentes** que variem juntos;
aqui só um variou. No caminho, o piloto achou quatro problemas de método que mudam resultados,
e dois resultados antigos que não se sustentaram.

## O que foi testado

Seis eixos de tipos diferentes, cada um com 3 níveis e 3 desafios por nível (9 por eixo), mais
uma bateria extrema. Gerador: [`gerar-g1.js`](gerar-g1.js); correção e análise:
[`corrigir-g1.js`](corrigir-g1.js).

| Eixo | O que mede | Níveis |
|---|---|---|
| PROF | dedução em cadeia | 3, 6 e 12 passos, com uma cadeia paralela de distração |
| VOL | memória de trabalho | cadeia de 3 passos entre 20, 80 e 200 regras |
| SOS | atenção | o mesmo, com 4 iscas sósias, em 20, 40 e 80 regras |
| MORF | morfologia | flexão fácil, média (gerúndio, plural) e difícil (gênero) |
| IND | indução | descobrir a regra escondida (1 traço, "e", "ou") e classificar 2 casos novos |
| INDET | calibração | perguntas sem resposta dedutível (grupo isolado, recíproca, recíproca + ruído) |
| DURO | extremo | 2 cadeias de 30 passos, 2 cadeias entre 500 regras, 2 com sósias entre 300 regras |

Configurações: Haiku, Sonnet, Opus e Fable, todos no esforço *low*. Cada IA recebeu um eixo por
janela (9 desafios num arquivo só, lido com a ferramenta Read). Os prompts colados à mão foram
conferidos contra os arquivos pelo registro da sessão ([`auditar-colados.js`](auditar-colados.js)).

## Resultados

### Lógica certa (a palavra certa, qualquer forma)

| | PROF | VOL | SOS | MORF¹ | IND² | INDET | DURO |
|---|---|---|---|---|---|---|---|
| Haiku low | 9/9 | 9/9 | 8/9 | 3/9 | 9/9 | 9/9 | 6/6 |
| Sonnet low | 9/9 | 9/9 | 9/9 | 4/9 | 7/9 | 9/9 | 6/6 |
| Opus low | 9/9 | 9/9 | 9/9 | 7/9 | 9/9 | 9/9 | 6/6 |
| Fable low | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 | 6/6 |

¹ MORF conta a forma exata, na primeira rodada (o reteste está mais abaixo). ² IND com o
princípio "use a regra mais simples" (v2).

**Forma exata no DURO** (concordância com o personagem, num texto de 300 a 500 regras):
Haiku 2/6 · Sonnet 5/6 · Opus 6/6 · Fable 6/6.

### Estrutura: existe uma capacidade geral?

- Só três eixos variaram entre os modelos: SOS (só o Haiku errou, 1 vez), MORF e IND.
- Onde há variação, aparecem dois degraus: Haiku e Sonnet abaixo de Opus e Fable (MORF nas duas
  rodadas, forma no DURO). O Haiku foi o único a errar em SOS. A exceção é a indução, em que o
  Sonnet ficou abaixo do Haiku (7 × 9), nas duas conjunções.
- W de Kendall entre os 6 eixos: 0,09. É baixo por causa dos empates no teto, não porque as
  ordens se contradizem. Com 4 modelos, qualquer correlação entre eixos é descritiva.
- Conclusão: o padrão é **compatível** com um fator geral, mas também com uma capacidade
  específica (concordância morfológica) que acompanha o tamanho do modelo. Os dados não
  separam as duas hipóteses.

## Problemas de método que o piloto encontrou

1. **A lacuna não dizia que pedia um adjetivo.** Num lote, o Haiku low respondeu o substantivo
   do meio da cadeia nos 9 desafios de volume, embora tivesse chegado ao adjetivo (escreveu-o
   entre parênteses). Na calibração, preencheu a lacuna com o grupo dado no texto. Com a linha
   "a lacuna pede um adjetivo", foi a 9/9 nos dois (respostas em `g1/respostas-v1/`).
2. **O lote muda a leitura do enunciado.** Os 20 desafios da bateria 7, em dois lotes de 10:
   - lote C: 10/10 (eram 8/10 um por janela). O lote não piorou a lógica;
   - lote D: 0/10 (eram 7/10). O Haiku deu, nos 10, o substantivo do primeiro passo como
     "a resposta direta". O prompt do site em lote ("Copiar prompt") tem a mesma brecha.
3. **A indução precisava de um princípio.** Com 6 exemplos e 3 traços, mais de uma regra explica
   os exemplos. Sem dizer "use a regra mais simples", o Haiku escolheu a mais simples (9/9),
   o Opus quase sempre (8/9) e o Sonnet não (5/9). O erro era do item, não da IA. Com o
   princípio: 9, 7, 9 e 9 (respostas em `g1/respostas-ind-v1/`).
4. **A leitura do arquivo tem limite.** O DURO tem 1.818 linhas, e a ferramenta Read entregou
   1.373. O Opus e o Fable leram o resto sozinhos; o Haiku e o Sonnet obedeceram ao "leia uma
   vez" e pararam, até receberem autorização. Arquivos de bateria precisam ficar abaixo desse
   limite ou permitir uma segunda leitura.

## Dois resultados antigos que não se sustentaram

O primeiro, a vantagem do Fable sobre o Opus na morfologia, está na seção do reteste. O segundo:

Na bateria 6, o Haiku low "cortou a cadeia" em 4 de 12 desafios com 100 ou 300 regras. Aqui:

- VOL com 200 regras: 3/3; DURO com 500 regras: 2/2; DURO com 30 passos: 2/2;
- os 3 desafios da bateria 6 em que ele tinha cortado, rodados de novo: certos lidos do arquivo
  (3/3) e certos colados numa janela, como no original (2/2, um com o gênero errado).

A primeira hipótese era que as linhas numeradas da ferramenta Read ajudavam. O controle colado
derrubou essa hipótese: colado, ele também acertou. O corte de cadeia é um **erro intermitente**
(o mesmo desafio ora sai certo, ora não), não um limite fixo a partir de 100 regras. Um
resultado de uma rodada só não mede isso; é preciso repetir cada item (ver abaixo).

## Confiabilidade (reteste da morfologia)

A morfologia, o único eixo que separou os modelos, rodou de novo nas quatro configurações, com
o mesmo arquivo (respostas em `g1/respostas-reteste/`):

| | 1ª rodada | reteste | soma | mesmo resultado, item a item |
|---|---|---|---|---|
| Haiku low | 3/9 | 3/9 | 6/18 | 5 de 9 |
| Sonnet low | 4/9 | 3/9 | 7/18 | 8 de 9 |
| Opus low | 7/9 | 9/9 | 16/18 | 7 de 9 |
| Fable low | 9/9 | 7/9 | 16/18 | 7 de 9 |

- A concordância item a item foi de 27 em 36 (75%).
- Os dois degraus se mantêm. Dentro de cada degrau, a ordem é ruído: o Opus e o Fable trocaram
  de lugar.
- Isso põe em dúvida a vantagem do Fable low sobre o Opus low na morfologia (80% × 70%),
  registrada na bateria de 17/10 com uma rodada só. Uma diferença de 1 ou 2 desafios em 10 não
  se sustenta sem repetição.
- No reteste, o Fable e o Haiku erraram o plural de grupo misto ("a X e o Y são ___" pede o
  masculino) e escreveram o feminino. Na primeira rodada, o Fable tinha acertado esses mesmos
  itens.

## Caminho para uma medida de inteligência geral

Um fator G não se confirma com um teste; ele aparece numa **população** de examinados em muitos
testes diferentes. O que isso pede do LogiGen:

1. **População.** Com 4 modelos Claude, qualquer eixo se correlaciona com o tamanho do modelo
   ("fator tamanho"). São precisos de 15 a 20 modelos ou mais, de fabricantes e tamanhos
   diferentes, incluindo modelos abertos pequenos, onde a lógica ainda varia. Trabalhos que
   fizeram isso com benchmarks públicos (Burnell e colegas, 2023; Ruan e colegas, 2024) acharam
   poucos fatores dominantes, com o primeiro explicando boa parte da variância: um ponto de
   comparação.
2. **Sair do teto.** Para modelos fortes, a lógica com "todo A é B" está resolvida até 30 passos
   e 500 regras. Os eixos precisam de botões que ainda separam: operadores ("nenhum", "ou" com
   prova por casos, "alguns"), negação, vários personagens ao mesmo tempo, contradições a
   detectar e conceitos novos (objetivo 3). O critério de um bom nível é ficar entre 30% e 70%
   de acerto em alguma configuração.
3. **Repetir.** Os erros são intermitentes: medir a probabilidade de acerto de cada item (3 ou
   mais rodadas), não um certo ou errado.
4. **Pré-teste de cada tipo de item.** Dois dos seis eixos novos tinham enunciados ambíguos, e
   só a leitura do raciocínio das IAs mostrou isso. Todo tipo novo passa por 2 modelos, com o
   raciocínio lido, antes de entrar num banco oficial.
5. **Critérios definidos antes** de olhar os dados (para não achar o que se quer):
   - variedade positiva: correlações positivas entre todos os eixos, na população de modelos;
   - um primeiro fator que explique a maior parte da variância (por exemplo, mais de 50%);
   - itens que se ajustam a uma escala única (TRI, Rasch);
   - **validade preditiva**: a nota geral prevê o desempenho num tipo de tarefa novo, que não
     entrou no cálculo. É esse o teste que distingue um fator geral de um "fator tamanho".

## Custo

46 subagentes em ~20 minutos de relógio, em ondas de até 7, cada um com 40 a 80 mil tokens,
quase todos das instruções do próprio Claude Code. A exploração inteira gastou 12 pontos
percentuais da janela de 5 horas (de 14% para 26%) e 1 da semanal (de 7% para 8%). Mandar um eixo inteiro por janela (9 desafios num arquivo)
custou um agente em vez de nove, sem piorar a lógica no lote C, desde que o enunciado diga o
tipo da resposta (lote D).

## Arquivos

| Arquivo | O que é |
|---|---|
| `gerar-g1.js` | gerador dos 6 eixos (`node benchmark/gerar-g1.js`) e do DURO (`... duro`) |
| `gerar-lote-b7.js` | os 20 desafios da bateria 7 em dois lotes de 10 |
| `corrigir-g1.js` | correção, tabela, W de Kendall, correlações, dominância e controle de lote |
| `auditar-colados.js` | confere os prompts colados contra os arquivos, pelo registro da sessão |
| `g1/prompts/`, `g1/prompts-v1/` | os prompts enviados (v2 e a primeira versão) |
| `g1/respostas*/` | as respostas de cada configuração |
| `g1/formato/` | o experimento de formato (arquivo × colado) |
| `g1/gabarito*.json` | gabaritos (ficaram fora da pasta enquanto as IAs respondiam) |
