# 👽 LogiGen — Lógica com palavras que nenhuma IA viu

Gerador automático de desafios de lógica em português do Brasil, usando palavras inventadas que *parecem* substantivos, adjetivos e verbos de verdade. Como a IA nunca viu esses textos, ela não tem como responder de memória: precisa raciocinar — e flexionar a resposta direito, o que mostra se ela entendeu a função de cada palavra.

```
Toda plalhoma é zedantosa.
Toda flagleba é pregreventa.
A Ludela e o Chevrur são plalhomas.
A Ludela e o Chevrur são ___?      → zedantosos
```

## 🚀 Como usar

Abra o `index.html` no navegador. Funciona sem internet; com internet aparecem também os ícones e a fonte Inter.

1. **Gerar** — escolha o nível, quantos desafios e uma semente.
2. **Copiar prompt** — cole na IA que quiser testar. Para mandar um desafio só, use o botão **Copiar** do próprio desafio.
3. **Corrigir** — cole a resposta completa da IA. Cada desafio recebe ✔ certo, ≈ flexão ambígua, ⚠ flexão errada, 🪤 caiu na armadilha ou ✘ errado, e sai o placar em dois eixos:
   - **Lógica** — escolheu a palavra certa (certo, ambígua ou flexão errada)
   - **Morfologia** — entre essas, escreveu só a forma pedida

A **semente** garante que o mesmo lote se repita: use a mesma semente para comparar IAs diferentes na mesma prova.

As escolhas (nível, quantidade, semente e "Gabarito e esqueleto") ficam salvas no navegador: ao voltar ao site, tudo reabre como estava, com o mesmo lote de desafios.

## 🧠 Princípios

- **O gabarito nunca é escrito à mão.** Cada desafio nasce de um esqueleto lógico; um solucionador deduz a resposta e confere que ela é a única possível antes de o desafio virar texto.
- **Nível é receita, não pontuação.** Cada nível é um esqueleto escrito em `niveis.js`, numa notação reta, sem margem de interpretação.
- **Sem dicas.** A pergunta é só uma lacuna ("Ludela é ___?"), sem opções, e o prompt não avisa que as palavras são inventadas.
- **A resposta tem que vir flexionada.** A frase da pergunta obriga a concordar ou conjugar: feminino, plural, gerúndio, 3ª pessoa do plural. A resposta sempre sai do texto, na lógica e na gramática.
- **Copiar não basta.** A forma pedida nunca é a que já aparece escrita: na concordância com um personagem, ele tem o gênero oposto ao da forma da regra ("Toda ronhilha é vesurdenta" → "O Crodel é vesurdento"). O artigo antes do nome deixa o gênero do personagem explícito.
- **Lógica e morfologia são medidas separadas.** São habilidades diferentes: nos testes com o Haiku 5.5 low, ele acertou 100% da lógica e só 42% das flexões (ver `testes/`).
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

## 📂 Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Interface |
| `app.js` | Liga a interface: gerar, copiar, corrigir, cores |
| `niveis.js` | Esqueletos lógicos de cada nível (é aqui que se cria nível novo) |
| `logica.js` | Lê o esqueleto, solucionador, texto dos desafios, flexões e correção |
| `palavras.js` | Gerador de palavras inventadas e sorteio com semente |
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
