# 👽 LogiGen — Lógica com palavras que nenhuma IA viu

Gerador automático de desafios de lógica em **português do Brasil e inglês**, usando palavras inventadas que *parecem* substantivos, adjetivos e verbos de verdade. Como a IA nunca viu esses textos, ela não tem como responder de memória: precisa raciocinar — e flexionar a resposta direito, o que mostra se ela entendeu a função de cada palavra.

```
Toda plalhoma é zedantosa.                Every jegomp is gluskish.
Toda flagleba é pregreventa.              Every sloseerd is tegous.
A Ludela e o Chevrur são plalhomas.       Bloskus and Trurkik are sloseerds.
A Ludela e o Chevrur são ___?             Bloskus and Trurkik are ___?
  → zedantosos                              → tegous
```

> **English:** LogiGen generates logic puzzles in Brazilian Portuguese or English with invented words that look like real nouns, adjectives and verbs, then grades the AI's answer on two axes: logic (right word) and morphology (right form). Open `index.html` and pick the flag at the top; `index.html?lang=en` opens straight in English.

## 🚀 Como usar

Abra o `index.html` no navegador. Funciona sem internet; com internet aparecem também os ícones e a fonte Inter.

1. **Gerar** — escolha o nível, quantos desafios e uma semente.
2. **Copiar prompt** — cole na IA que quiser testar. Para mandar um desafio só, use o botão **Copiar** do próprio desafio.
3. **Corrigir** — cole a resposta completa da IA. Cada desafio recebe ✔ certo, ≈ flexão ambígua, ⚠ flexão errada, 🪤 caiu na armadilha ou ✘ errado, e sai o placar em dois eixos:
   - **Lógica** — escolheu a palavra certa (certo, ambígua ou flexão errada)
   - **Morfologia** — entre essas, escreveu só a forma pedida

A **semente** garante que o mesmo lote se repita: use a mesma semente para comparar IAs diferentes na mesma prova.

As escolhas (nível, quantidade, semente, "Gabarito e esqueleto" e idioma) ficam salvas no navegador: ao voltar ao site, tudo reabre como estava, com o mesmo lote de desafios.

As **bandeirinhas** no topo trocam o idioma do site **e dos desafios**: a mesma semente gera um lote em português ou em inglês. `index.html?lang=en` abre direto em inglês. Na primeira visita, o site usa o idioma do navegador.

A aba **Humano × IA** (`index.html#versus`) põe uma pessoa e uma IA no mesmo desafio, cada uma na sua língua:
1. Você escolhe o nível, a quantidade, a semente, o seu idioma e o da IA, e clica em **Começar**. O relógio dispara.
2. Os desafios aparecem **sem cores e sem esqueleto**, do jeito que a IA vê, com um campo de resposta em cada um.
3. Ao mesmo tempo, você copia o prompt para a IA, cola a resposta dela e corrige.
4. As duas respostas passam pelo mesmo corretor, e o placar diz quem ganhou. Vence quem acerta mais a **lógica**; no empate, a **morfologia** desempata.

Com idiomas diferentes, o gerador cria um **lote pareado**: em cada desafio, a mesma variante e a mesma ordem das regras nas duas línguas, só com as palavras inventadas de cada uma. "A Nepeia está ___?" (*xudrandando*) e "What is Fesis doing? Fesis is ___?" (*zendelking*) são o mesmo desafio. Com o mesmo idioma, os dois recebem o texto idêntico. Os gabaritos e o resultado da IA só aparecem depois que você termina.

A aba **Pesquisa** (`index.html#pesquisa`) mostra os gráficos comparativos das baterias de teste com IAs:
- a escada da morfologia;
- os acertos por tipo de flexão;
- cada desafio em cada modelo;
- onde a lógica quebra (volume e sósias);
- a contaminação por palavras perto do português.

Cada barra traz o intervalo de confiança de 95%, para deixar claro o que a amostra permite concluir. Os gráficos são recalculados a partir de `pesquisa-dados.js`: uma bateria nova é só mais uma entrada nesse arquivo.

## 🧠 Princípios

- **O gabarito nunca é escrito à mão.** Cada desafio nasce de um esqueleto lógico; um solucionador deduz a resposta e confere que ela é a única possível antes de o desafio virar texto.
- **Nível é receita, não pontuação.** Cada nível é um esqueleto escrito em `niveis.js`, numa notação reta, sem margem de interpretação.
- **Sem dicas.** A pergunta é só uma lacuna ("Ludela é ___?"), sem opções, e o prompt não avisa que as palavras são inventadas.
- **A resposta tem que vir flexionada.** A frase da pergunta obriga a concordar ou conjugar: feminino, plural, gerúndio, 3ª pessoa do plural. A resposta sempre sai do texto, na lógica e na gramática.
- **Copiar não basta.** A forma pedida nunca é a que já aparece escrita: na concordância com um personagem, ele tem o gênero oposto ao da forma da regra ("Toda ronhilha é vesurdenta" → "O Crodel é vesurdento"). O artigo antes do nome deixa o gênero do personagem explícito.
- **Lógica e morfologia são medidas separadas.** São habilidades diferentes: nos testes, Haiku, Sonnet e Opus 5.5 e Fable 5.1 acertaram 100% da lógica nos esforços low e max, mas a morfologia fez uma escada de 20% (Haiku low) a 100% (Opus max), passando por Fable low (80%) e Fable max (90%) — e a concordância de gênero com o personagem foi o item mais difícil: só o Opus max acertou os três (ver `testes/`). A lógica do Haiku low só quebrou quando o texto cresceu (com 100+ regras ele corta a cadeia no meio) e com palavras sósias ("Bromar" × "Bramar"), que ele lê uma pela outra.
- **Correção automática e exata.** Toda palavra inventada é única no lote. Certo = a forma exata pedida; flexão errada = palavra certa na forma errada (acertou a lógica, errou a gramática); errado = outra palavra.

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
- Cada linha vira sempre a mesma frase (a tabela completa está no topo de `niveis.js`)
- A classe da lacuna vem da `resposta:` (`A1` = adjetivo, `V1` = verbo) e a forma da pergunta define a flexão pedida:

| Pergunta no esqueleto | Frase (resposta A) | Frase (resposta V) | Flexão pedida |
|---|---|---|---|
| `X1 é ___?` | X1 é ___? | X1 ___? | A: gênero de X1 · V: presente (ele) |
| `X1 e X2 são ___?` | X1 e X2 são ___? | X1 e X2 ___? | A: plural · V: presente (eles) |
| `X1 está ___?` | — | X1 está ___? | gerúndio |

- `resposta:` é o que você espera. O solucionador confere: a resposta precisa ser o **único** adjetivo (ou verbo) dedutível para os personagens perguntados; senão, o esqueleto é recusado com a explicação do erro.
- Cada nível declara quantos `passos` (regras encadeadas) a resposta exige, e o solucionador confere em todas as variantes — nenhum esqueleto pode ter atalho.
- Cada nível declara também quantas `armadilhas` tem. Uma armadilha é uma regra que engana quem a lê ao contrário ("todo G3 é G1" não quer dizer "todo G1 é G3"). O solucionador testa cada regra lida também ao contrário: se outra palavra passar a caber na lacuna, é armadilha. O número achado tem que ser exatamente o declarado — inclusive zero nos níveis sem armadilha.
- Nos desafios de gerúndio todos os verbos são em -ar: pelo presente "pavobe" não daria para saber se o gerúndio é "pavobendo" ou "pavobindo".
- As regras aparecem embaralhadas e os fatos vêm depois delas.

Com **Gabarito e esqueleto** ligado, cada desafio mostra a variante, a linha do esqueleto ao lado de cada frase, a prova (`X1 é G1 → todo G1 é V1 ⇒ X1 é V1`), qual palavra é cada letra e a flexão pedida. As cores separam as classes: **nome**, **substantivo**, **adjetivo** e **verbo**.

| Nível | Nome | Passos | Armadilhas | Estrutura |
|---|---|---|---|---|
| 1 | Dedução direta | 1 | 0 | 2 regras + 1 fato; uma regra leva à resposta, a outra é distração |
| 2 | Cadeia de dois passos | 2 | 0 | 2 cadeias de 2 regras; uma leva à resposta, a outra é distração. O elo do meio é um grupo, um verbo ou um adjetivo |
| 3 | Armadilha da recíproca | 2 | 1 | cadeia de 2 regras + uma regra que, lida ao contrário, leva a outra resposta. A armadilha muda de lugar conforme a variante |

Todos os níveis têm as mesmas 4 variantes de flexão: adjetivo · gênero, adjetivo · plural, verbo · gerúndio, verbo · plural.

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
- **Verbos sem ambiguidade.** Todo radical em inglês termina em duas consoantes (*florp*, *snurk*): o gerúndio é só "+ing", sem dúvida sobre dobrar a consoante (*blop → blopping*) ou tirar o "e" (*glame → glaming*). É o mesmo cuidado do português, onde os desafios de gerúndio só usam verbos em -ar.
- **Nomes sem artigo.** Em inglês não há gênero para marcar, então "o Glanol" vira só "Bloskus".
- **Filtro de dicionário em inglês.** As palavras inventadas passam pelo mesmo filtro, com 362 mil palavras do inglês ([dwyl/english-words](https://github.com/dwyl/english-words), domínio público). O arquivo (`dicionario-en.js`, 3,7 MB) só é carregado quando o inglês é escolhido.
- **As baterias de teste até agora foram todas em português.** A aba Pesquisa aparece traduzida, mas os resultados são dos testes em português.

## 📂 Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Interface |
| `app.js` | Liga a interface: gerar, copiar, corrigir, cores |
| `niveis.js` | Esqueletos lógicos de cada nível (é aqui que se cria nível novo) |
| `logica.js` | Lê o esqueleto, solucionador, texto dos desafios, flexões e correção |
| `palavras.js` | Gerador de palavras inventadas e sorteio com semente |
| `dicionario.js` | Palavras do português, para nenhuma inventada ficar a uma letra de uma real |
| `dicionario-en.js` | O mesmo, em inglês (carregado só quando o inglês é escolhido) |
| `idiomas.js` | Textos do site em português e inglês, bandeiras e a notação do esqueleto na tela |
| `pesquisa-dados.js` | Resultado de cada desafio em cada IA testada (é aqui que entra uma bateria nova) |
| `pesquisa.js` | Aba Pesquisa: gráficos comparativos e intervalos de confiança |
| `versus.js` | Aba Humano × IA: a pessoa resolve na sua língua, a IA na dela, e o placar compara |
| `favicon.svg` | Ícone da aba |
| `vendor/tailwind-3.4.17.js` | Tailwind (CSS) guardado no repositório, sem depender de CDN |
| `testes/` | Diários das baterias de teste com IAs (método, respostas e conclusões) |

## 🔒 Segurança

- Página estática: sem servidor, sem chamadas de rede próprias, sem `eval`.
- Todo texto vindo de fora (a resposta colada da IA) é escapado antes de ir para a tela.
- Os ícones vêm da CDN com hash de integridade (SRI): se o arquivo for alterado lá, o navegador recusa e a página segue funcionando sem ícones.
- O Tailwind fica no repositório porque a CDN dele não libera CORS, o que impede a verificação por hash.
- No navegador ficam salvas só as configurações (nível, quantidade, semente); valores inválidos são ignorados.

---
*Desenvolvido no Laboratório Inteligência Mil Grau.*
