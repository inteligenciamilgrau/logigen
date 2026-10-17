# Bateria 8 — Sonnet 5.5 nas baterias 6 (volume e sósias) e 7 (contaminação)

17/10/2026. São os mesmos prompts, letra por letra, das baterias 6 e 7 do Haiku 5.5 low (ver
`haiku-5.5-volume-e-sosias.md` e `haiku-5.5-contaminacao.md`). O protocolo é o de sempre: um
desafio por janela, sem gabarito, e a instrução de não usar ferramentas para resolver. Os 44
prompts enviados conferem letra por letra com os gerados.

| Bateria | Sonnet low | Sonnet max |
|---|---|---|
| 6 (volume e sósias) | os 18 desafios | só os 6 de 300 regras, porque com 20 e 100 o low já tinha acertado tudo |
| 7 (contaminação) | os 20 desafios | não rodou, porque o low já tinha acertado 20 de 20 |

## Bateria 6 · volume e sósias

| Regras | Haiku low A | Haiku low B | Sonnet low A | Sonnet low B | Sonnet max A | Sonnet max B |
|---|---|---|---|---|---|---|
| 20 | 3/3 | 2/3 | 3/3 | 3/3 | — | — |
| 100 | 2/3 | 2/3 | 3/3 | 3/3 | — | — |
| 300 | 2/3 | 1/3 | 3/3 | **1/3** | 3/3 | **3/3** |
| **Total** | 7/9 | 5/9 | 9/9 | 7/9 | 3/3 | 3/3 |

Os dois erros do Sonnet low aconteceram com 300 regras, e os dois foram confusões com sósias:

- **B300-1:** respondeu "o Bromar é trudrachino **(e também gladrertento)**". Leu "O Bramar é
  um xovrerdo" como "O Bromar", a mesma confusão do Haiku low nesse desafio. Esse par fica perto
  do português ("bramar" é um verbo real, e "Bromar" fica a uma letra de "cromar").
- **B300-3:** incluiu "flotetrenta" porque leu "Todo r**u**lhodro é flotetrento" como
  "rilhodro". Esse par é limpo.

**Nenhuma cadeia cortada.** O Haiku low cortou a cadeia em 4 dos 12 desafios com 100 ou 300
regras; o Sonnet low, em nenhum.

**O Sonnet max acertou os 6 de 300 regras**, inclusive B300-1 e B300-3. Ele conferiu cada palavra
parecida uma por uma: "'Bramar' (que é xovrerdo) não é 'Bromar'. 'plumanho' não é 'plamanho'.
'dratrosca' não é 'drotrosca'…".

## Bateria 7 · contaminação (20 regras)

| | C (sósias limpas) | D (sósias perto do português) |
|---|---|---|
| Haiku low | 8/10 | 7/10 |
| **Sonnet low** | **10/10** | **10/10** (1 hesitou) |

O Sonnet low não confundiu nenhuma sósia e não chamou nenhuma de "erro de digitação". Ele usa a
palavra certa para elas: "As palavras parecidas (Jelhice, brebata, tabulve, cleronhudo) são
sósias e não entram na cadeia." A única hesitação (D-1) foi condicional e rejeitada na mesma
frase: "ele também seria runizina se 'treponta' fosse a mesma coisa que 'trepunta', mas a
grafia difere".

## Pares de sósias, baterias 6 e 7 somadas

| | Pares perto do português | Pares limpos |
|---|---|---|
| Haiku low | 4 confusões em 45 (9%) | 2 em 100 (2%) |
| Sonnet low | 1 em 45 (2%) | 1 em 100 (1%) |

## Tempo e tokens por resposta

| Configuração | Tempo | Tokens |
|---|---|---|
| Sonnet low | 6–13 s | ~33–38 mil |
| Sonnet max (300 regras) | 70–97 s | ~49–54 mil |

## Conclusões

1. **Os dois modos de erro do Haiku dependem do modelo de jeitos diferentes.**
   - O **corte de cadeia** sumiu no Sonnet low: nenhum em 12 desafios com 100 ou 300 regras.
   - A **confusão com sósias** continua no Sonnet low, mas só aparece com 300 regras.
2. **O esforço maior resolve a confusão.** O Sonnet max acertou os dois desafios em que o low
   confundiu, conferindo letra por letra cada palavra parecida.
3. **A escala de dificuldade para os níveis novos começa a aparecer:**

   | Configuração | Erra com |
   |---|---|
   | Haiku low | 20 regras com sósias, ou 100 regras sem sósias |
   | Sonnet low | 300 regras com sósias |
   | Sonnet max | nada até aqui |

   Volume e sósias, juntos, formam um eixo de dificuldade que separa os modelos.
4. **O par "Bromar" × "Bramar" derrubou Haiku low e Sonnet low.** É o par mais perto do
   português da bateria. Um caso só não prova a contaminação, mas reforça a decisão do filtro de
   dicionário.

## Próximos passos sugeridos

- Rodar Opus e Fable nos desafios de 300 regras com sósias, e criar um ponto mais difícil (600
  regras, ou mais sósias por desafio) para achar o limite do Sonnet max.
- Levar os eixos volume e sósia para o gerador, como níveis novos.
