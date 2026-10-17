# 👽 LogiGen — Lógica com palavras que nenhuma IA viu

Gerador automático de desafios de lógica em português do Brasil, usando palavras inventadas que *parecem* substantivos, adjetivos e verbos de verdade. Como a IA nunca viu esses textos, ela não tem como responder de memória: precisa raciocinar — e flexionar a resposta direito, o que mostra se ela entendeu a função de cada palavra.

```
Toda plalhoma é zedantosa.
Toda flagleba é pregreventa.
Ludela e Chevrur são plalhomas.
Ludela e Chevrur são ___?          → zedantosos
```

## 🚀 Como usar

Abra o `index.html` no navegador (só precisa de internet para o Tailwind, os ícones e a fonte).

1. **Gerar** — escolha o nível, quantos desafios e uma semente.
2. **Copiar prompt** — cole na IA que quiser testar. Para mandar um desafio só, use o botão **Copiar** do próprio desafio.
3. **Corrigir** — cole a resposta completa da IA. Cada desafio recebe ✔ certo, ⚠ flexão errada ou ✘ errado, e sai o placar.

A **semente** garante que o mesmo lote se repita: use a mesma semente para comparar IAs diferentes na mesma prova.

## 🧠 Princípios

- **O gabarito nunca é escrito à mão.** Cada desafio nasce de um esqueleto lógico; um solucionador deduz a resposta e confere que ela é a única possível antes de o desafio virar texto.
- **Nível é receita, não pontuação.** Cada nível é um esqueleto escrito em `niveis.js`, numa notação reta, sem margem de interpretação.
- **Sem dicas.** A pergunta é só uma lacuna ("Ludela é ___?"), sem opções, e o prompt não avisa que as palavras são inventadas.
- **A resposta tem que vir flexionada.** A frase da pergunta obriga a concordar ou conjugar: feminino, plural, gerúndio, 3ª pessoa do plural. A resposta sempre sai do texto, na lógica e na gramática.
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
- Nos desafios de gerúndio todos os verbos são em -ar: pelo presente "pavobe" não daria para saber se o gerúndio é "pavobendo" ou "pavobindo".
- As regras aparecem embaralhadas e os fatos vêm depois delas.

Com **Gabarito e esqueleto** ligado, cada desafio mostra a variante, a linha do esqueleto ao lado de cada frase, a prova (`X1 é G1 → todo G1 é V1 ⇒ X1 é V1`), qual palavra é cada letra e a flexão pedida. As cores separam as classes: **nome**, **substantivo**, **adjetivo** e **verbo**.

| Nível | Nome | Variantes |
|---|---|---|
| 1 | Dedução direta | adjetivo · gênero, adjetivo · plural, verbo · gerúndio, verbo · plural |

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

---
*Desenvolvido no Laboratório Inteligência Mil Grau.*
