# Hipótese: um arcabouço lógico aprendido

As IAs testadas respondem certo aos desafios de lógica mesmo quando as palavras são inventadas.
Isso aponta na direção de um arcabouço lógico, aprendido a partir dos dados, que captura a
essência do raciocínio linguístico. Seria uma possível evidência de comportamento emergente.

Este documento separa o que os testes já sustentam do que ainda falta para afirmar isso, e
lista os testes que confirmariam ou derrubariam a hipótese.

## A formulação que os dados sustentam hoje

> Os modelos aplicam regras lógicas e gramaticais abstratas a palavras que nunca viram, e erram
> de forma sistemática, de um jeito parecido com o humano. Isso é evidência de que aprenderam a
> estrutura do raciocínio, não só conteúdo. Se é emergente no sentido de surgir com a escala,
> os testes ainda não dizem.

## O que os testes já sustentam

- **Não é memória de fatos.** "Plalhoma" não existe em lugar nenhum, e o gerador descarta toda
  palavra a uma letra de uma palavra real. Nenhuma resposta certa pode ter sido decorada.
- **Não é um atalho superficial.** Um atalho como "pegar a palavra que vem depois de 'é'"
  cairia nas armadilhas. Nenhum modelo caiu nas regras escritas ao contrário, em mais de 50
  armadilhas recíprocas, e as regras de distração obrigam a seguir a cadeia certa.
- **A morfologia é o argumento mais forte.** Flexionar no gênero e no plural certos uma palavra
  nunca vista é o "teste do wug" (Berko, 1958). A psicolinguística usa esse teste há décadas
  como prova de que a criança aprendeu a regra, em vez de decorar as formas. O LogiGen é um
  teste do wug para lógica e gramática juntas.
- **Os erros também contam.** Eles não são aleatórios. A cadeia é cortada quando o texto cresce,
  e o sósia é "corrigido" como se fosse erro de digitação. São falhas com padrão, de memória de
  trabalho e de leitura, o que indica um mecanismo com limites, não chute. Os detalhes estão em
  [haiku-5.5-volume-e-sosias.md](haiku-5.5-volume-e-sosias.md) e
  [haiku-5.5-contaminacao.md](haiku-5.5-contaminacao.md).
- **O conteúdo não mudou a lógica, com o mundo contra.** Na bateria G11 (H17 em
  [RELATORIO-G2.md](../benchmark/RELATORIO-G2.md)), os mesmos 12 desafios saíram certos com
  palavras inventadas e com frases de plausíveis a impossíveis ("Toda lula é um rato"), nos quatro
  modelos, sem aviso: 240 de 240. Falta testar o caso em que o mundo empurra para a falácia.

## Onde a afirmação precisa de cuidado

1. **Palavra nova não é estrutura nova.** "Todo A é B; X é A; logo X é B" aparece milhões de
   vezes nos dados de treino. Os testes mostram que o modelo abstraiu essa forma e a aplica a
   qualquer símbolo. Isso já é muito: é o que se chama de ligação de variáveis. Mas é diferente
   de raciocinar sobre uma forma lógica nunca vista.
2. **"Emergente" tem dois sentidos.**
   - **Não programado:** ninguém escreveu regras de silogismo dentro do modelo; elas surgiram do
     treino. Nesse sentido, os testes são evidência.
   - **Surge de repente com a escala** (Wei et al., 2022): modelos pequenos não fazem e, a
     partir de certo tamanho, passam a fazer. Esse sentido é disputado: Schaeffer et al. (2023)
     mostraram que parte desses "saltos" vem da métrica escolhida. E os dados do LogiGen não
     alcançam essa pergunta: todos os modelos Claude testados acertam a lógica dos desafios
     curtos, então não há uma curva.

## Como transformar a hipótese em teste

| Pergunta | Teste | O que confirmaria |
|---|---|---|
| A memória ajuda ou atrapalha? | palavras reais coerentes × reais absurdas × inventadas, com a mesma lógica (objetivo 1 do [plano](PLANO.md)). **Primeira rodada feita: G11, sem nenhuma queda.** Falta o argumento inválido com conclusão crível | inventadas ≈ reais coerentes: a lógica não depende do conteúdo. Absurdas piores: viés de crença, como em humanos (Lampinen et al., 2024, viram esse efeito em modelos de linguagem) |
| Abstrai a forma ou só troca palavras? | operadores e quantificadores inventados, definidos no próprio prompt ("A é *zorva* de B quer dizer…") | a estrutura lógica vale também para regras novas, não só para palavras novas |
| Surge com a escala? | a mesma bateria em modelos abertos de vários tamanhos, de menos de 1B a 70B parâmetros | a curva mostra se a capacidade cresce aos poucos ou aos saltos |

O terceiro teste depende de modelos de fora da Anthropic, o que liga esta hipótese ao
objetivo 4 (comparar modelos). Os três entram no plano como eixos ou etapas: ver
[PLANO.md](PLANO.md).

## Referências

- Berko, J. (1958). The child's learning of English morphology. *Word*, 14, 150–177.
- Lampinen, A. K., Dasgupta, I. et al. (2024). Language models, like humans, show content effects
  on reasoning tasks. *PNAS Nexus*, doi:10.1093/pnasnexus/pgae233. Preprint: arXiv:2207.07051.
- Schaeffer, R., Miranda, B. e Koyejo, S. (2023). Are emergent abilities of large language
  models a mirage? *NeurIPS 2023*. arXiv:2304.15004.
- Wei, J. et al. (2022). Emergent abilities of large language models. *Transactions on Machine
  Learning Research*. arXiv:2206.07682.
