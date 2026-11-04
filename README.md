# 👽 LogiGen — Lógica com palavras que nenhuma IA viu

Gerador automático de desafios de lógica em **português do Brasil e inglês**, usando palavras inventadas que *parecem* substantivos, adjetivos e verbos de verdade. Como a IA nunca viu esses textos, ela não tem como responder de memória: precisa raciocinar — e flexionar a resposta direito, o que mostra se ela entendeu a função de cada palavra.

```
Toda plalhoma é zedantosa.                Every jegomp is gluskish.
Toda flagleba é pregreventa.              Every sloseerd is tegous.
A Ludela e o Chevrur são plalhomas.       Bloskus and Trurkik are sloseerds.
A Ludela e o Chevrur são ___?             Bloskus and Trurkik are ___?
  → zedantosos                              → tegous
```

> **English:** LogiGen generates logic puzzles in Brazilian Portuguese or English with invented words that look like real nouns, adjectives and verbs, then grades the AI's answer on two axes: logic (right word) and morphology (right form). Its goals: (1) show that an AI reasons over text it has never seen, instead of just repeating its training data; (2) map where each AI does well and badly, and look for a general ability shared by all tasks, like the human "g factor"; (3) if (1) holds, check whether an AI can create new concepts and discoveries; (4) measure and compare the performance of different models on a common scale; (5) above all, work less as a showcase of what models do well and more as a diagnosis of where an AI needs to improve to become more robust. Working hypothesis: since the AIs get the logic right even with invented words, they seem to have learned a logical framework from data, possible evidence of emergent behavior; what supports it and what is still missing is in `testes/HIPOTESE.md` (in Portuguese). Open `index.html` and pick the flag at the top; `index.html?lang=en` opens straight in English.

## 🎯 Objetivos

1. **Mostrar que a IA raciocina, e não só repete a base de dados.** Muita gente diz que uma IA só devolve o que já viu. O LogiGen usa textos que ninguém nunca escreveu, com palavras que nem existem, e um filtro garante que nenhuma delas lembre uma palavra real. Se a IA responde de forma coerente — escolhe a palavra certa e a flexiona como a gramática pede —, ela está exercendo lógica sobre dados novos, não recuperando memória.
2. **Mapear onde a IA vai bem e onde vai mal, e procurar um "fator G".** Cada eixo do teste (profundidade, volume, sósias, morfologia, operadores…) tem uma escala de dificuldade. A ideia é ver os pontos fortes e fracos de cada modelo e verificar se existe uma capacidade geral comum a todos os eixos, como o fator G da inteligência humana: quem vai bem num eixo tende a ir bem nos outros?
3. **Se o objetivo 1 se confirmar, verificar se a IA cria conceitos novos.** Raciocinar sobre palavras novas é o primeiro passo; o seguinte é criar: formar categorias e nomes novos, descobrir regras escondidas nos dados e derivar palavras que seguem a gramática. Ou seja, chegar a conclusões que não estavam escritas em lugar nenhum.
4. **Medir e comparar o desempenho de modelos diferentes.** Com os mesmos testes, nas mesmas condições e numa régua comum, dá para dizer quanto um modelo é melhor que outro — e em quê —, com margem de erro declarada.
5. **Apontar a direção para uma IA mais robusta.** O objetivo final é que testes como este sejam menos uma vitrine das qualidades dos modelos e mais um diagnóstico: cada erro classificado pela causa (perde o fio em textos longos, confunde palavras parecidas, copia a forma em vez de concordar, inventa resposta quando não dá para saber), para mostrar onde uma IA precisa melhorar.

Como cada objetivo vira medida, quais eixos têm escala de dificuldade e como montar uma base de testes confiável: [testes/PLANO.md](testes/PLANO.md).

**Hipótese em teste.** Como as IAs acertam a lógica mesmo com palavras inventadas, os resultados apontam para um arcabouço lógico aprendido a partir dos dados, que captura a essência do raciocínio linguístico: uma possível evidência de comportamento emergente. O que os testes já sustentam, onde é preciso cuidado e como confirmar: [testes/HIPOTESE.md](testes/HIPOTESE.md).

## 🚀 Como usar

Abra o `index.html` no navegador. Funciona sem internet; só os ícones vêm de fora.

1. **Gerar** — escolha o nível, quantos desafios e uma semente.
2. **Copiar prompt** — cole na IA que quiser testar. Para mandar um desafio só, use o botão **Copiar** do próprio desafio.
3. **Corrigir** — cole a resposta completa da IA. Cada desafio recebe ✔ certo, ≈ flexão ambígua, ⚠ flexão errada, 🪤 caiu na armadilha ou ✘ errado, e sai o placar em dois eixos:
   - **Lógica** — escolheu a palavra certa (certo, ambígua ou flexão errada)
   - **Morfologia** — entre essas, escreveu só a forma pedida

A **semente** garante que o mesmo lote se repita **dentro da mesma versão** do site: use a mesma semente para comparar IAs diferentes na mesma prova. A versão aparece no topo e ao lado do lote; anote as duas nos relatórios.

O **modo** do prompt separa duas medidas, como na psicometria:
- **Típico** (o padrão) — o prompt não avisa nada: nem que as palavras são inventadas, nem que a resposta precisa ser flexionada. Mede o que a IA faz por conta própria.
- **Máximo** — o prompt avisa que as palavras são inventadas, pede a resposta já flexionada e traz um exemplo resolvido de cada tipo de resposta do lote, com outras palavras inventadas. Mede o que a IA sabe fazer quando sabe o que se espera. No [benchmark](benchmark/RELATORIO-G2.md) (H6 e H9), um exemplo só levou Haiku e Sonnet de 0/6 a 6/6 no gerúndio de verbos inventados.

Corrija o mesmo lote nos dois modos (cada modo guarda a sua resposta colada) e o placar mostra o **índice de intuição**: os acertos sem dica divididos pelos acertos com dica. Perto de 1, a IA faz sozinha o que se espera; perto de 0, ela sabe fazer, mas precisa ser guiada.

As escolhas (nível, quantidade, semente, modo, "Gabarito e esqueleto" e idioma) ficam salvas no navegador: ao voltar ao site, tudo reabre como estava, com o mesmo lote de desafios.

As **bandeirinhas** no topo trocam o idioma do site **e dos desafios**: a mesma semente gera um lote em português ou em inglês. `index.html?lang=en` abre direto em inglês. Na primeira visita, o site usa o idioma do navegador.

A chave **Palavras reais**, acima dos desafios, mostra o mesmo desafio com palavras de verdade, para conferir se a lógica faz sentido para uma pessoa:
- **Cada palavra inventada vira uma real da mesma classe, e as frases são remontadas a partir do esqueleto:** "Toda plalhoma é zedantosa" vira "Todo professor é curioso", e "A Júlia é uma plalhoma" vira "A Júlia é uma professora". A regra fica no masculino genérico; o substantivo concorda com a pessoa quando é dito dela, e a lacuna continua pedindo a concordância.
- **As palavras têm sentido, e a gramática não enxerga isso.** "Toda lula é um rato" e "O Caio é um sucesso" são frases bem formadas, com substantivo dos dois lados do "é", mas uma é impossível e a outra junta tipos que não se encaixam. Cada palavra real traz traços de sentido (`tipo`, `serve`, `exclui`, `e`, `faz`), e um medidor dá o absurdo de cada frase:

| Nível | Tipo | Exemplo |
|---|---|---|
| 0 | plausível: o mundo confirma | "Todo escritor é um leitor" |
| 1 | possível: nada impede | "Todo professor é um cantor" |
| 2 | absurda: tipos que não se encaixam | "O Caio é um sucesso", "Todo professor late" |
| 3 | impossível: as partes se excluem | "Toda lula é um rato" |

- **O site só usa o nível 1.** Acima dele a frase briga com o que o leitor sabe. Abaixo, o mundo responde no lugar das regras: com "Todo pintor é um escritor" e "O Caio não é um leitor", "O Caio é um pintor?" deixaria de ser "não dá para saber". Por isso duas palavras com relação entre si nunca entram no mesmo desafio.
- **As palavras inventadas ficam de fora de tudo isso.** Elas não têm sentido nenhum, e é por isso que medem a lógica pura.
- **O prompt copiado continua com as palavras inventadas**, porque são elas que medem o raciocínio da IA.

A aba **Humano × IA** (`index.html#versus`) põe uma pessoa e uma IA no mesmo desafio, cada uma na sua língua:
1. Você escolhe o nível, a quantidade, a semente, o seu idioma e o da IA, e clica em **Começar**. O relógio dispara.
2. Os desafios aparecem **sem cores e sem esqueleto**, do jeito que a IA vê, com um campo de resposta em cada um.
3. Ao mesmo tempo, você copia o prompt para a IA, cola a resposta dela e corrige.
4. As duas respostas passam pelo mesmo corretor, e o placar diz quem ganhou. Vence quem acerta mais a **lógica**; no empate, a **morfologia** desempata.

Com idiomas diferentes, o gerador cria um **lote pareado**: em cada desafio, a mesma variante e a mesma ordem das regras nas duas línguas, só com as palavras inventadas de cada uma. "A Nepeia está ___?" (*xudrandando*) e "What is Fesis doing? Fesis is ___?" (*zendelking*) são o mesmo desafio. Com o mesmo idioma, os dois recebem o texto idêntico. Os gabaritos e o resultado da IA só aparecem depois que você termina.

Você também pode **jogar com palavras reais** enquanto a IA continua com as inventadas. A sua resposta ("curiosas") é traduzida de volta para a palavra inventada antes da correção. O sentido das palavras pode ajudar, ou atrapalhar quando a frase soa estranha.

A aba **Pesquisa** (`index.html#pesquisa`) mostra os gráficos comparativos das baterias de teste com IAs:
- as baterias G do [benchmark](benchmark/): onde a lógica satura (eixo × modelo), hábito ou capacidade (sem ajuda × com ajuda, com o índice de intuição) e o que muda entre duas línguas;
- a escada da morfologia;
- os acertos por tipo de flexão;
- cada desafio em cada modelo;
- onde a lógica quebra (volume e sósias);
- a contaminação por palavras perto do português.

Cada barra traz o intervalo de confiança de 95%, para deixar claro o que a amostra permite concluir. Os gráficos são recalculados a partir de `pesquisa-dados.js`: uma bateria nova é só mais uma entrada nesse arquivo.

## 🧠 Princípios

- **O gabarito nunca é escrito à mão.** Cada desafio nasce de um esqueleto lógico; um solucionador deduz a resposta e confere que ela é a única possível antes de o desafio virar texto.
- **Nível é receita, não pontuação.** Cada nível é um esqueleto escrito em `niveis.js`, numa notação reta, sem margem de interpretação.
- **Sem dicas.** A pergunta é só uma lacuna ("Ludela é ___?"), sem opções, e o prompt não avisa que as palavras são inventadas. Só o modo máximo avisa, e de propósito: para comparar com o típico.
- **A resposta tem que vir flexionada.** A frase da pergunta obriga a concordar ou conjugar: feminino, plural, gerúndio, 3ª pessoa do plural. A resposta sempre sai do texto, na lógica e na gramática.
- **Copiar não basta.** A forma pedida nunca é a que já aparece escrita: na concordância com um personagem, ele tem o gênero oposto ao da forma da regra ("Toda ronhilha é vesurdenta" → "O Crodel é vesurdento"). O artigo antes do nome deixa o gênero do personagem explícito.
- **Lógica e morfologia são medidas separadas.** São habilidades diferentes: nos testes, Haiku, Sonnet e Opus 5.5 e Fable 5.1 acertaram 100% da lógica nos esforços low e max, mas a morfologia fez uma escada de 20% (Haiku low) a 100% (Opus max), passando por Fable low (80%) e Fable max (90%) — e a concordância de gênero com o personagem foi o item mais difícil: só o Opus max acertou os três (ver `testes/`). A lógica do Haiku low só quebrou quando o texto cresceu (com 100+ regras ele corta a cadeia no meio) e com palavras sósias ("Bromar" × "Bramar"), que ele lê uma pela outra.
- **Correção automática e exata.** Toda palavra inventada é única no lote. Certo = a forma exata pedida; flexão errada = palavra certa na forma errada (acertou a lógica, errou a gramática); errado = outra palavra.
- **Diagnóstico da flexão errada.** Quando a palavra está certa e a forma não, o corretor diz por quê: copiou a forma escrita na regra ("glovunda" onde se pede "glovundando"), leu o verbo como adjetivo ("são ladadra"), trocou a conjugação ("gronetram" onde se pede "gronetrem"), concordou com o grupo e não com as pessoas ("A Marina e o Caio são glapartas" → "dralelhudas"), errou o gênero, trocou singular e plural, ou escreveu uma forma que não existe. Os tipos vêm das baterias da pasta [`benchmark/`](benchmark/RELATORIO-G2.md).

## 📶 Níveis e esqueletos

Cada nível é um conjunto de **variantes**, e cada variante é um esqueleto. Cada desafio sorteia uma variante. O gerador lê exatamente esse texto; não existe outra definição escondida no código.

```
todo G1 é V1      # leva à resposta
todo G2 é V2      # distração
X1 é G1
pergunta: X1 está ___?
resposta: V1
```

- Letras, sempre com número: `X1` personagem · `G1` grupo (substantivo) · `A1` adjetivo · `V1` verbo
- Cada linha vira sempre a mesma frase (a tabela completa está no topo de `niveis.js`), menos no nível 9
- A classe da lacuna vem da `resposta:` (`A1` = adjetivo, `V1` = verbo) e a forma da pergunta define a flexão pedida:

| Pergunta no esqueleto | Frase (resposta A) | Frase (resposta V) | Flexão pedida |
|---|---|---|---|
| `X1 é ___?` | X1 é ___? | X1 ___? | A: gênero de X1 · V: presente (ele) |
| `X1 e X2 são ___?` | X1 e X2 são ___? | X1 e X2 ___? | A: plural · V: presente (eles) |
| `X1 está ___?` | — | X1 está ___? | gerúndio |

- `resposta:` é o que você espera. O solucionador confere: a resposta precisa ser o **único** adjetivo (ou verbo) dedutível para os personagens perguntados; senão, o esqueleto é recusado com a explicação do erro.
- Cada nível declara quantos `passos` (regras encadeadas) a resposta exige, e o solucionador confere em todas as variantes — nenhum esqueleto pode ter atalho.
- Cada nível declara também quantas `armadilhas` tem. Uma armadilha é uma regra que engana quem a lê ao contrário ("todo G3 é G1" não quer dizer "todo G1 é G3"). O solucionador testa cada regra lida também ao contrário: se outra palavra passar a caber na lacuna, é armadilha. O número achado tem que ser exatamente o declarado — inclusive zero nos níveis sem armadilha.
- Nos desafios de gerúndio dos níveis 1 a 3 todos os verbos são em -ar: pelo presente "pavobe" não daria para saber se o gerúndio é "pavobendo" ou "pavobindo". O nível 6 resolve isso com um glossário (abaixo).
- Na pergunta do gerúndio, nenhum adjetivo pode ser dedutível para o personagem: "está" também aceita adjetivo ("A Marina está zedantosa"), e a lacuna teria duas respostas certas. O solucionador recusa esse esqueleto. Por isso, nos níveis 2 e 3, o gerúndio usa um grupo como elo, e o adjetivo fica como elo do plural verbal.
- As regras aparecem embaralhadas e os fatos vêm depois delas.

Com **Gabarito e esqueleto** ligado, cada desafio mostra a variante, a linha do esqueleto ao lado de cada frase, a prova (`X1 é G1 → todo G1 é V1 ⇒ X1 é V1`), qual palavra é cada letra e a flexão pedida. As cores separam as classes: **nome**, **substantivo**, **adjetivo** e **verbo**.

| Nível | Nome | Passos | Armadilhas | Estrutura |
|---|---|---|---|---|
| 1 | Dedução direta | 1 | 0 | 2 regras + 1 fato; uma regra leva à resposta, a outra é distração |
| 2 | Cadeia de dois passos | 2 | 0 | 2 cadeias de 2 regras; uma leva à resposta, a outra é distração. O elo do meio é um grupo, um verbo ou um adjetivo |
| 3 | Armadilha da recíproca | 2 | 1 | cadeia de 2 regras + uma regra que, lida ao contrário, leva a outra resposta. A armadilha muda de lugar conforme a variante |
| 4 | Negação e falácias | — | — | "nenhum" e fatos negativos; resposta sim, não ou não dá para saber. Variantes: cadeia, negação, contraposição, afirmar o consequente, negar o antecedente |
| 5 | Prova por casos | — | — | "todo G1 é G2 ou G3"; examinar os dois casos ou eliminar um. Variantes: casos, silogismo disjuntivo, casos + nenhum, ramo aberto |
| 6 | Palavras novas (wug) | 2 | 0 | cadeia de 2 regras + glossário; gerúndio de verbos em -er e -ir, plural em -em, e grupos cujo substantivo tem outro gênero que o das pessoas |
| 7 | Indução | — | — | exemplos no lugar das regras; descobrir a regra escondida e aplicá-la a alguém novo (sim ou não). Variantes: um traço, um traço negado, dois traços com "e" ou "ou", "e" com negação, três traços |
| 8 | Troca de língua | 2 | 0 | o texto vem na outra língua e a resposta é pedida na língua do site, com glossário. Variantes: adjetivo com grupo misto ou feminino, verbo no plural, gerúndio |
| 9 | Texto natural | — | — | a mesma lógica num parágrafo de conversa, com a pergunta no fim. Variantes: flexões (adjetivo, plural, gerúndio), cadeia, negação, contraposição, as duas falácias e casos |

Os níveis 1 a 3 têm as mesmas 4 variantes de flexão: adjetivo · gênero, adjetivo · plural, verbo · gerúndio, verbo · plural.

**Níveis 4 e 5: operadores.** Vieram das baterias G2 e G3 do [benchmark](benchmark/RELATORIO-G2.md), em que os modelos acertaram negação, "ou" e as falácias até em cadeias longas. A pergunta não tem lacuna: é de sim ou não, e o prompt diz como responder. O esqueleto ganha quatro formas:

```
nenhum G2 é G3        # "Nenhum G2 é um G3."
todo G1 é G2 ou G3    # "Todo G1 é um G2 ou um G3." (pelo menos um dos dois)
X1 não é G1           # "O X1 não é um G1."
pergunta: X1 é G3?    # "O X1 é um G3?"
resposta: não dá para saber
```

- A resposta é conferida por um verificador (um resolvedor SAT) que testa todas as combinações de verdade dos grupos: se as frases mais "X1 é G3" e as frases mais "X1 não é G3" forem ambas possíveis, a resposta é "não dá para saber". O esqueleto é recusado se o verificador discordar da `resposta:`.
- Concluir "sim" ou "não" quando as frases não garantem nada conta como **caiu na armadilha**: é a falácia (afirmar o consequente, negar o antecedente, ou escolher um dos casos do "ou").

**Nível 6: palavras novas.** É o "teste do wug" (Berko, 1958): aplicar uma regra da língua a uma palavra que nunca existiu. As baterias do [benchmark](benchmark/RELATORIO-G2.md) mostraram que a lógica quase não erra, mas a forma das palavras novas erra: copiar a forma escrita na regra, trocar a conjugação, concordar com o substantivo do grupo em vez das pessoas. O nível isola esses erros. O esqueleto ganha duas diretivas, e cada desafio traz um glossário:

```
conjugação: V1 -ir, V2 -er        # "pavobe" pode ser pavober ou pavobir; aqui é pavobir
gênero: X1 f, X2 m, G1 f, G2 m    # a Ana e o Pedro são plalhomas (feminino) → masculino plural
```

```
Glossário: pavobir (verbo); zedanter (verbo).
```

- O glossário traz o infinitivo de cada verbo e a forma básica (masculino singular) de cada adjetivo do desafio, em ordem sorteada, para não entregar qual é a resposta.
- A correção diz por que a forma saiu errada: **copiou** uma forma do desafio (do texto ou do glossário), **conjugação** errada (-ando × -endo, -am × -em) ou **atração** (concordou com o grupo, não com as pessoas).
- Em inglês o verbo não tem conjugação e o adjetivo não tem gênero: as diretivas não mudam nada, e o nível fica perto do nível 2.

**Nível 7: indução.** Os outros níveis dão as regras e pedem a conclusão (dedução). Este dá exemplos e esconde a regra:

```
A Clavira é dunhententa, não é fravrolosa e não é glufludenta. A Clavira é um brunapo.
O Zofel é dunhentento, é fravroloso e é glufludento. O Zofel não é um brunapo.
...
O Grovol é dunhentento, não é fravroloso e é glufludento. O Grovol é um brunapo?   → sim
```

O esqueleto diz só os traços, quantos exemplos e a regra escondida:

```
traços: A1 A2 A3
exemplos: 6
regra: G1 = A1 e não A2
```

- A resposta é sorteada (sim ou não, meio a meio), e os exemplos também. O verificador só aceita o desafio se **todas** as regras plausíveis que explicam os exemplos derem a mesma resposta para o personagem novo: as regras com "e", "ou" e "não" do mesmo tamanho da escondida ou menores, mais "só um dos dois" e "pelo menos 2 de 3". E nenhuma regra menor que a escondida pode explicar os exemplos: a variante "dois traços" precisa mesmo de dois.
- Isso vem da bateria H4 do [benchmark](benchmark/RELATORIO-G2.md): três modelos "erraram" o mesmo item porque acharam, cada um, outra regra do mesmo tamanho que também explicava os exemplos. O erro era do item.
- Com mais liberdade, a resposta pode mudar: aceitando regras com um traço a mais que a escondida, só uma parte dos desafios continua com resposta única (cerca de 1 em cada 6 em "dois traços · e" e "dois traços · ou"). Por isso o prompt pede **a regra mais simples**. Exigir o traço a mais deixaria "dois traços · e" sempre com resposta "não", e daria para acertar sem pensar.

**Nível 8: troca de língua.** O desafio vem na outra língua e a resposta é pedida na língua do site: com o site em português, o texto vem em inglês; com o site em inglês, vem em português. A lógica é feita numa língua e a palavra precisa sair flexionada na outra.

```
Every teegeng is sneebsome.
Every grepift is a teegeng.
...
Teglane and Peflel are grepifts.
Teglane and Peflel are ___?
Glossário: sleendal → gravrorboso (adjetivo); sneebsome → dresontudo (adjetivo). Pessoas: a Teglane, o Peflel.
→ dresontudos
```

- O mesmo esqueleto vira um desafio em cada língua (o lote pareado): o texto sai de um e o gabarito do outro.
- O glossário liga cada adjetivo e verbo do texto à palavra da língua da resposta, em ordem sorteada. Em português ele também diz o gênero de cada pessoa ("a Teglane, o Peflel"), que o inglês não marca e a concordância precisa.
- Vem das baterias G9 e G10 do [benchmark](benchmark/RELATORIO-G2.md) (H15 e H16): a lógica sobreviveu à troca de língua em todos os casos, e os erros que sobraram foram de forma.
- A correção tem um diagnóstico a mais: **respondeu na língua do texto** (a palavra certa, mas na língua errada) conta como lógica certa e forma errada. A atração de concordância não é diagnosticada aqui, porque o gênero do substantivo não aparece no texto em inglês.
- Com **Palavras reais**, o nível mostra o mesmo desafio sem a troca, na língua da resposta: as palavras reais servem para conferir a lógica, e ela é a mesma.
- O nível não aparece na aba **Humano × IA**, em que cada lado já escolhe a sua língua.

**Nível 9: texto natural.** Os outros níveis soam como aula de lógica, de propósito: cada linha vira sempre a mesma frase, para a forma não variar. Este escreve a mesma lógica num parágrafo de conversa, com a pergunta no fim:

```
Meu avô trabalhou muitos anos numa fazenda e ainda lembra de cada detalhe daquele lugar. Por lá,
as bipalvas, sem exceção, são vrogefas. Além disso, toda treplufa é uma lonholta. Ali, não existe
cletesta que não seja uma treplufa. Uma pessoa que sempre aparece nessas histórias é a Glegeia, que
não é uma lonholta. A Jenhira é uma bipalva.
Pelo que ele contou, a Glegeia é uma cletesta?   → não
```

- **O esqueleto e o solucionador são os mesmos.** Só muda a escrita: o nível tem `natural: true`, e os esqueletos são os de sempre.
- **Cada molde diz exatamente o que a linha diz.** "Não existe A que não seja B" e "os As, sem exceção, são Bs" são "todo A é B"; "costuma ser" ou "quase todo" soariam bem, mas mudariam a lógica. O "ou" deixa claro que vale pelo menos um dos dois.
- **A pergunta também é natural, sem lacuna:** "como são...?", "o que ... fazem?", "o que ... vive fazendo?". As regras ficam no singular, então a forma pedida nunca está escrita no texto. "Vive fazendo", e não "está fazendo agora": a regra diz o que o grupo faz sempre.
- **O texto usa 4 histórias de abertura, 7 ligações e de 2 a 4 moldes por tipo de frase.** Quem vê muitos desafios vai reconhecer os moldes.

Exemplo do nível 3:

```
Todo pregrevo zalhela.          ⚠ armadilha
Toda plalhoma zalhela.
Todo pregrevo é clapascento.
Quem zalhela é frachebino.
Mubrice e Gravrur são plalhomas.
Mubrice e Gravrur são ___?      → frachebinos
```

Quem pensa "eles zalhelam, então são pregrevos" responde *clapascentos* — e a correção marca **🪤 caiu na armadilha**, separado de um erro qualquer.

Para criar um nível novo, basta escrever outro esqueleto em `niveis.js`.

## 🔤 Palavras inventadas

Montadas com sílabas e sufixos do português, sem acentos, com todas as flexões:

- **Substantivos** com gênero e plural: *plalhoma → plalhomas* (Todo/Toda, um/uma)
- **Adjetivos** com sufixos reais (-oso, -ento, -udo, -ino): *zedantoso, zedantosa, zedantosos, zedantosas*
- **Verbos** de 1ª, 2ª e 3ª conjugação: *pavobir → pavobe, pavobem, pavobindo*
- **Nomes próprios**: *Ludela*, *Chevrur*

**Nenhuma palavra fica perto do português.** Toda forma escrita de cada palavra (plural, feminino, conjugações) é conferida num dicionário de 243 mil formas do português. Se tirando, pondo ou trocando **uma letra** ela vira uma palavra real, é descartada e sorteada de novo. Sem isso, cerca de 9% das palavras inventadas ficavam a uma letra do português (23% dos nomes): "grofesca" lembrava "grotesca", e o nome "Bramar" era o verbo "bramar". Nos testes, a IA confundiu palavras sósias um pouco mais quando uma delas ficava perto do português. A confusão também acontece entre palavras limpas, porque a IA trata a diferença de uma vogal como "erro de digitação" (ver `testes/`). O filtro tira o português da equação.

O dicionário (`dicionario.js`) vem da [Lista de todas as palavras do português brasileiro](https://www.ime.usp.br/~pf/dicios/), de Paulo Feofiloff (IME-USP), preparada a partir do Dicionário br.ispell, de Ricardo Ueda Karpischek, sob licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br).

Com o filtro, as mesmas sementes passaram a gerar lotes diferentes dos usados nas baterias de teste 1 a 6.

## 🌎 Em inglês

O esqueleto é o mesmo nos dois idiomas: a lógica dos níveis não muda, só a frase que o desafio vira.

| Esqueleto | Português | Inglês |
|---|---|---|
| `todo G1 é A1` | Toda plalhoma é zedantosa. | Every jegomp is gluskish. |
| `todo A1 é V1` | Quem é zedantoso glovunda. | Whoever is gluskish florps. |
| `X1 é G1` | A Ludela é uma plalhoma. | Bloskus is a jegomp. |
| `pergunta: X1 e X2 são ___?` (verbo) | A Ludela e o Chevrur ___? → *glovundam* | Bloskus and Trurkik ___? → *florp* |
| `pergunta: X1 está ___?` | A Ludela está ___? → *glovundando* | What is Bloskus doing? Bloskus is ___? → *florping* |

- **O inglês quase não flexiona.** O adjetivo não tem gênero nem plural, então em inglês a morfologia fica nos verbos: o gerúndio (*florping*) e a forma do plural (a regra diz *florps*, a pergunta pede *florp*). As variantes de adjetivo medem a lógica — e se a IA inventa uma flexão que não existe (*gluskishes*).
- **O "está" vira "What is X doing?".** Sem isso, "Bloskus is ___?" aceitaria também um adjetivo, e a lacuna não diria que a resposta é um verbo no gerúndio.
- **Verbos sem ambiguidade.** Todo radical em inglês termina em duas consoantes (*florp*, *snurk*): o gerúndio é só "+ing", sem dúvida sobre dobrar a consoante (*blop → blopping*) ou tirar o "e" (*glame → glaming*). É o mesmo cuidado do português, onde os desafios de gerúndio dos níveis 1 a 3 só usam verbos em -ar.
- **Nomes sem artigo.** Em inglês não há gênero para marcar, então "o Glanol" vira só "Bloskus".
- **Filtro de dicionário em inglês.** As palavras inventadas passam pelo mesmo filtro, com 362 mil palavras do inglês ([dwyl/english-words](https://github.com/dwyl/english-words), domínio público). O arquivo (`dicionario-en.js`, 3,7 MB) só é carregado quando o inglês é escolhido.
- **As baterias de teste até agora foram todas em português.** A aba Pesquisa aparece traduzida, mas os resultados são dos testes em português.

## 🏷️ Versões

O site mostra a versão no topo, ao lado de cada lote e na aba Pesquisa. O [CHANGELOG.md](CHANGELOG.md) diz o que mudou em cada uma, em qual versão cada bateria rodou e quando trocar o número:

- **X** (2.0): o prompt de um nível que já existia mudou para a mesma semente; os resultados não se comparam diretamente.
- **Y** (1.3): entrou algo novo; os prompts antigos continuam iguais.
- **Z** (1.2.1): só tela ou texto.

`node benchmark/impressao.js` guarda um resumo dos lotes de cada nível por versão e acusa quando o gerador mudou sem o número mudar.

## 📂 Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Interface |
| `app.js` | Liga a interface: gerar, copiar, corrigir, cores |
| `niveis.js` | Esqueletos lógicos de cada nível (é aqui que se cria nível novo) |
| `logica.js` | Lê o esqueleto, solucionador, texto dos desafios, flexões e correção |
| `palavras.js` | Gerador de palavras inventadas e sorteio com semente |
| `palavras-reais.js` | Vocabulário real com traços de sentido, medidor de absurdo e remontagem das frases, para ver o mesmo desafio com palavras de verdade |
| `dicionario.js` | Palavras do português, para nenhuma inventada ficar a uma letra de uma real |
| `dicionario-en.js` | O mesmo, em inglês (carregado só quando o inglês é escolhido) |
| `idiomas.js` | Textos do site em português e inglês, bandeiras e a notação do esqueleto na tela |
| `pesquisa-dados.js` | Resultado de cada desafio em cada IA testada (é aqui que entra uma bateria nova) |
| `pesquisa.js` | Aba Pesquisa: gráficos comparativos e intervalos de confiança |
| `versus.js` | Aba Humano × IA: a pessoa resolve na sua língua, a IA na dela, e o placar compara |
| `favicon.svg` | Ícone da aba |
| `vendor/tailwind-3.4.17.js` | Tailwind (CSS) guardado no repositório, sem depender de CDN |
| `vendor/inter/` | Fonte Inter (subconjunto latino) e a licença dela (SIL Open Font License) |
| `testes/` | Diários das baterias de teste com IAs (método, respostas e conclusões) |
| `testes/scripts/` | Scripts que montaram os desafios das baterias 6 e 7, para reproduzir os prompts |

## 🔒 Segurança

- Página estática: sem servidor, sem chamadas de rede próprias, sem `eval`.
- Política de segurança (CSP) no próprio `index.html`: scripts só do repositório e dos ícones, e a página não consegue enviar dados para outro site, rodar `eval` nem carregar plugins. Ela ainda precisa de `'unsafe-inline'` por causa dos `onclick` no HTML e dos estilos que o Tailwind gera na hora.
- Todo texto vindo de fora (a resposta colada da IA, as respostas digitadas no Humano × IA) é escapado antes de ir para a tela.
- Os ícones vêm da CDN com hash de integridade (SRI): se o arquivo for alterado lá, o navegador recusa e a página segue funcionando sem ícones.
- O Tailwind e a fonte Inter ficam no repositório. O Tailwind porque a CDN dele não libera CORS, o que impede a verificação por hash; a fonte para que o Google não receba o endereço de quem abre a página.
- No navegador ficam salvas só as configurações (nível, quantidade, semente); valores inválidos são ignorados.
- Chaves de API nunca vão para o repositório: o `.gitignore` barra `.env`, `.env.*`, `*.pem` e `*.key`, e também o banco de testes reservado (`testes/bancos/reservado/`).

---
*Desenvolvido no Laboratório Inteligência Mil Grau.*
