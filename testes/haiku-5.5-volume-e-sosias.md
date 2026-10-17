# Bateria 6 — Onde a lógica do Haiku 5.5 low quebra: volume × palavras sósias

17/10/2026. Nas baterias 1 a 5, a lógica nunca separou ninguém: o Haiku low acertou até cadeias
de 10 passos com 18 regras e os protótipos de "ou", "não", "alguns" e "exceto". A pergunta
desta bateria é **o que faz o Haiku errar lógica**: só aumentar o contexto basta, ou é preciso
algo mais?

## Hipótese

> O Haiku não erra por excesso de contexto. Ele erra quando a leitura fica ambígua: palavras
> quase iguais que querem dizer coisas diferentes.

Previsões:

1. Com volume puro, até 300 regras, ele continua acertando.
2. Com o mesmo volume e sósias das palavras da cadeia (uma vogal de diferença), ele troca uma
   palavra pela outra.

## O teste

Os desafios foram montados por um protótipo fora do gerador
(`scratchpad/b6/gerar-b6.js`), com o léxico, o solucionador e as frases do projeto.

**A cadeia:** personagem → grupo → grupo → verbo → adjetivo, em 3 passos (`X1 é G1`,
`todo G1 é G2`, `todo G2 é V1`, `todo V1 é A1`).

**As iscas.** Cada desafio tem 4, uma para cada ponto em que dá para se confundir, e cada uma
leva a um adjetivo diferente. Assim, a resposta errada mostra onde a confusão aconteceu:

| Isca | O que faz |
|---|---|
| personagem | outro personagem, com um fato que leva a outro adjetivo |
| G1 | outro grupo, com regra para outro adjetivo |
| G2 | outro grupo, com regra para outro adjetivo |
| V1 | outro verbo, com regra para outro adjetivo |

Há também um adjetivo parecido com a resposta, que aparece em regras de ruído.

**O ruído.** As outras regras formam uma rede sem ligação com o personagem. Elas só apontam
para a cadeia, nunca saem dela. O solucionador confere que o único adjetivo dedutível é a
resposta, em exatamente 3 passos. Todas as palavras ficam a pelo menos 3 letras de distância
umas das outras.

**Os dois eixos:**

- **A, volume puro:** as iscas têm nomes comuns, diferentes de tudo.
- **B, com sósias:** o texto é idêntico ao de A, na mesma ordem e com as mesmas palavras. Só
  as iscas mudam e viram sósias das palavras da cadeia, como "o Clodrel" × "o Clidrel",
  "grorenho" × "grerenho", "jimorto" × "jumorto", "vruzine" × "vruzene" e
  "putromboso" × "petromboso".

**Volumes:** 20, 100 e 300 regras (cerca de 110, 470 e 1.400 palavras). Foram 3 desafios por
ponto, 18 no total.

**Protocolo:** o de sempre. Um Haiku 5.5 low por desafio, numa janela nova, sem acesso a
gabarito, com o prompt "Responda esse desafio:" e a instrução de não usar ferramentas.

- **Prompts:** os 18 enviados foram comparados, pelo histórico da sessão, com os gerados, e
  são idênticos letra por letra.
- **Correção:** só a lógica (palavra certa). A flexão não entra nesta bateria.

## Resultados

| Desafio | Regras | Respondeu | Lógica | Tipo de erro |
|---|---|---|---|---|
| A20-1 | 20 | putromboso | ✔ | |
| B20-1 | 20 | putromboso | ✔ | (achou que "jumorto" e "vruzene" eram **erros de digitação** e juntou as palavras; rejeitou o que isso dava "porque não é a intenção do enunciado") |
| A20-2 | 20 | zotrodroso | ✔ | |
| B20-2 | 20 | zotrodroso | ✔ | (listou as 4 sósias e explicou que cada uma é outra palavra) |
| A20-3 | 20 | plerilhento | ✔ | |
| **B20-3** | 20 | "frefelta… grafesca, **driflertudo** e plerilhento" | **✘** | **confusão por sósia**: "Quem gr**o**fesca é driflertudo" lido como "gr**a**fesca" (isca de V1). Notou plerilhento × plerulhento, mas não grofesca × grafesca |
| **A100-1** | 100 | "o Dreplur é **vavredre**" | **✘** | **cadeia cortada**: parou no verbo, um passo antes do adjetivo, e pôs o verbo depois de "é" |
| B100-1 | 100 | ganefento | ✔ | (apontou vavrodre × vavredre) |
| A100-2 | 100 | clisimosa | ✔ | |
| **B100-2** | 100 | "a Drigrina é **vribafa**" | **✘** | **cadeia cortada**: parou no verbo |
| A100-3 | 100 | xodrarboso | ✔ | (não achou a ferramenta de entrega em 3 tentativas; a resposta veio da transcrição) |
| B100-3 | 100 | xodrarboso | ✔ | (apontou xedrarboso × xodrarboso e flizopo × flozopo) |
| A300-1 | 300 | trudrachino | ✔ | |
| **B300-1** | 300 | "trudrachino (e também **gladrertento**)" | **✘** | **confusão por sósia**: leu "O **Bra**mar é um xovrerdo" como "O **Bro**mar" e somou uma segunda cadeia falsa (isca do personagem) |
| **A300-2** | 300 | "a Clelhela é **um plolhoflo**" | **✘** | **cadeia cortada**: só repetiu o fato do enunciado, no passo 0 |
| **B300-2** | 300 | "a Clelhela é **um plolhoflo**" | **✘** | **cadeia cortada**: chegou até "chafisca" (2 passos) e mesmo assim respondeu com o fato |
| A300-3 | 300 | clevirdudo | ✔ | (gênero errado, mas a palavra é a certa) |
| B300-3 | 300 | clevirdudo | ✔ | (apontou lovutra × levutra) |

### Placar

| Regras | A (volume puro) | B (com sósias) |
|---|---|---|
| 20 | 3/3 | 2/3 (1 confusão) |
| 100 | 2/3 (1 cortada) | 2/3 (1 cortada) |
| 300 | 2/3 (1 cortada) | 1/3 (1 confusão + 1 cortada) |
| **Total** | **7/9 (78%)** | **5/9 (56%)** |

Tempo por resposta: 7–20 s. Tokens por resposta: ~34–42 mil.

## Conclusões

1. **A lógica do Haiku low finalmente quebrou.** Foram os primeiros erros de lógica dele em seis
   baterias: 6 em 18, contra 0 em 41 nas baterias 1 e 2.
2. **A hipótese acertou pela metade. Há dois mecanismos de erro diferentes**, e eles se somam:
   - **Sósias provocam confusão.** Ele afirma algo falso porque lê uma palavra como outra
     parecida. Isso aconteceu já com 20 regras e só no eixo B. Ele percebe muitas sósias, e
     mesmo assim uma escapa. No B20-1 o mecanismo apareceu escrito: ele achou que as sósias
     eram erros de digitação e "corrigiu" o texto.
   - **Volume provoca cadeia cortada.** Ele para antes do fim e responde com algo verdadeiro,
     mas intermediário: o verbo do meio da cadeia, ou o próprio fato do enunciado. Isso nunca
     aconteceu com 20 regras e apareceu em 4 dos 12 desafios com 100 ou 300 regras, nos dois
     eixos. **Então volume puro também quebra**, ao contrário da previsão 1, mas de outro
     jeito: não confunde, encurta.
3. **A cadeia cortada se liga ao ponto fraco de morfologia.** No corte com 100 regras, ele pôs um
   verbo depois de "é" ("o Dreplur é vavredre"). É a mesma cegueira de classe gramatical do
   "Xarice está brarerta" da bateria 1: sob carga, ele pega o primeiro predicado que aparece e
   não confere se a classe cabe na lacuna.
4. **Brecha do formato da pergunta.** "A Clelhela é ___?" aceita "um plolhoflo", que é verdade
   e é o fato dado. Até aqui nenhum modelo tinha respondido assim, e o desafio pede o único
   adjetivo dedutível. Com 300 regras, esse virou o atalho. Para os próximos níveis, a correção
   pode dar um status próprio a essas respostas ("cadeia incompleta": citou um elo da própria
   prova), separado de "errado".
5. **Amostra pequena.** São 3 desafios por casela, então os números mostram os mecanismos, não
   taxas confiáveis.

## O que isso dá para os próximos níveis

Os dois eixos novos são baratos de gerar e o solucionador consegue conferir os dois:

- **Volume:** nível com 100 ou mais regras de ruído. Testa se a cadeia vai até o fim.
- **Sósias:** a "armadilha da sósia", análoga à da recíproca. O solucionador junta cada par de
  sósias e vê se outro adjetivo passa a ser dedutível. Se passar, é armadilha, e a correção
  marca 🪤 quando a IA cai nela.

## Próximos passos sugeridos

- **Separar os efeitos:** sósias **sem** volume (20 regras, mais desafios), para medir a taxa de
  confusão sozinha.
- **Separar as palavras de corte:**
  - o verbo é o que mais atrai o corte? Testar com cadeias sem verbo no meio;
  - o fato é o que mais atrai? Testar pergunta "X1 é ___?" contra fato com adjetivo.
- **Rodar os mesmos 18 no Haiku max e no Sonnet:** o esforço evita o corte? O tamanho do modelo
  evita a confusão?
- **Levar ao gerador:** níveis com volume e com armadilha de sósia, mais o status "cadeia
  incompleta" na correção.

## Adendo: palavras perto do português

Esta bateria foi feita antes do filtro de dicionário. Conferindo depois:
- 53 das 1.150 palavras destes desafios ficavam a uma letra de uma palavra real;
- dos 45 pares de sósias, 5 tinham uma palavra perto do português;
- as **duas** confusões caíram nesses 5: "grofesca" (perto de "grotesca") e "Bromar" × "Bramar"
  ("cromar" e o verbo "bramar").

A bateria 7 (`haiku-5.5-contaminacao.md`) testou isso de forma controlada. A confusão também
acontece com sósias limpas, e perto do português ela foi só um pouco maior.

## Limitações

- As transcrições dos subagentes que entregam a resposta ficam vazias, então as chamadas de
  ferramenta não puderam ser auditadas. O B300-2 registrou 2 chamadas em vez de 1.
- O A100-3 não encontrou a ferramenta de entrega, e a resposta dele foi lida da transcrição,
  que nesse caso ficou gravada.
- O eixo B muda o gênero de uma das iscas de grupo em relação ao A (a sósia herda o gênero da
  palavra original). O resto do texto é idêntico.
