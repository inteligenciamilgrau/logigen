# 👽 LogiGen — Gerador de Lógica Manual

Ferramenta para montar puzzles de lógica, medir a dificuldade de cada um e gerar versões prontas para colar em qualquer IA. Sem servidor, sem instalação: é uma página HTML que roda no navegador.

## 🚀 Como usar

Abra o `index.html` no navegador (duplo clique). Só precisa de internet para carregar o Tailwind, os ícones e a fonte.

1. **Construtor Lógico** — escreva as regras, a pergunta e o gabarito usando variáveis. O nível de dificuldade é recalculado enquanto você digita.
2. **Gerador Manual** — escolha um template e clique em *Rolar Puzzle*. As variáveis viram palavras sorteadas do dicionário. Use *Copiar prompt*, cole na IA que quiser testar e compare com a resposta mestra.
3. **Dados** — edite os dicionários (fictício e real) e importe/exporte tudo.

## 🧩 Variáveis dos templates

| Variável | Preenchida com | Exemplo |
|---|---|---|
| `{S1}`, `{S2}`… | Substantivos | Gromulon / Ferreiro |
| `{V1}`… | Verbos | frunfa / forjar |
| `{A1}`… | Adjetivos | Vultuoso / Sábio |
| `{N1}`… | Nomes | Tibúrlio / Helena |
| `{L1}`… | Locais | na Fenda / no Vale |

O mesmo número sempre vira a mesma palavra dentro de um puzzle. Outras letras (ex.: `{K1}`) contam no cálculo de dificuldade, mas não são substituídas.

O dicionário **fictício** usa palavras inventadas para a IA não reconhecer o puzzle de memória; o **real** gera uma versão legível para conferir a lógica.

## 💾 Onde ficam os dados

- `dados.js` traz os templates e dicionários padrão.
- O que você edita fica salvo no navegador (localStorage).
- Para guardar de vez, use **Exportar dados** na aba Dados e substitua o `dados.js` do projeto pelo arquivo baixado. **Restaurar padrão** volta ao conteúdo do `dados.js`.

## 📂 Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Interface (abas, layout) |
| `app.js` | Lógica da interface: editor, gerador, dicionário, importar/exportar |
| `motor.js` | Cálculo de carga cognitiva e régua de níveis (1–20) |
| `dados.js` | Templates e dicionários padrão |
| `DOCUMENTACAO_CALCULO.md` | Explicação da fórmula de dificuldade |

---
*Desenvolvido no Laboratório Inteligência Mil Grau.*
