# Histórico de versões

A versão aparece no topo do site, ao lado do lote gerado e na aba Pesquisa. Ela existe por causa
dos relatórios: **a mesma semente só repete o lote na mesma versão**. Sem dizer a versão, um
resultado não pode ser refeito nem comparado com outro.

## Quando trocar a versão

| Troca | Quando | O que significa para os relatórios |
|---|---|---|
| **X** (1.2 → 2.0) | o prompt de um nível que já existia muda para a mesma semente | resultados de antes e de depois não se comparam diretamente |
| **Y** (1.2 → 1.3) | entra nível, modo ou bateria nova, ou muda o modo palavras reais; os prompts dos níveis antigos ficam iguais | os resultados antigos continuam comparáveis |
| **Z** (1.2 → 1.2.1) | correção de tela ou de texto, sem efeito nos lotes | nenhuma mudança |

Para trocar:
1. Altere `VERSAO` em `logica.js`.
2. Rode `node benchmark/impressao.js`, que registra o resumo dos lotes em `benchmark/impressoes.json`.
3. Acrescente a versão abaixo, dizendo o que mudou nos lotes.

O mesmo script, sem trocar a versão, acusa quando o gerador mudou e o número não: é isso que faz
o número valer. Rode antes de cada commit que mexa em `niveis.js`, `logica.js`, `palavras.js` ou
`palavras-reais.js`.

Cada versão publicada tem uma tag `logigen-X.Y`. Todo relatório novo diz em qual versão rodou.

## Em qual versão cada bateria rodou

| Baterias | Rodaram | Dá para refazer hoje? |
|---|---|---|
| Baterias 1 a 7 (`testes/`) | antes da 1.0 | só pelos diários; o gerador mudou depois |
| G1 a G10, H1 a H16 (`benchmark/`) | entre a 1.0 e a 1.1 | não pelo script: a 1.1 mudou os níveis 2 e 3. Os prompts usados estão salvos em `benchmark/g*/prompts/` |
| G11 e G12, H17 e H18 (`benchmark/`) | entre a 1.1 e a 1.2 | sim: os scripts geram na 1.2 exatamente os mesmos prompts |

## 1.2 (04/11/2026)

**Lotes:** nos níveis 1 a 8, o prompt, as respostas e o gabarito são iguais aos da 1.1 para a mesma
semente (conferido contra a tag). **O modo palavras reais mudou**, em todos os níveis.

- Nível 9, texto natural: a mesma lógica num parágrafo de conversa, com a pergunta no fim.
- Modo palavras reais refeito: traços de sentido em cada palavra, medidor de absurdo de 0 a 3, e
  frases remontadas a partir do esqueleto, com o substantivo concordando com a pessoa. O
  vocabulário deixou de ter bichos, que se excluem ("Toda lula é um rato").
- Nos níveis de sim ou não, cada desafio passa a ter as suas palavras reais.
- Baterias G11 e G12: a lógica com frases contra o mundo, e as premissas ocultas das palavras.
- Versão no site, este histórico e a impressão digital dos lotes.

## 1.1 (30/10/2026)

**Lotes:** mudaram nos níveis 2 e 3 (variantes de gerúndio e de plural verbal, para tirar a
ambiguidade do "está ___"). Pelas regras acima, que só valem a partir da 1.2, isso teria sido uma
troca de X.

- Níveis 4 a 8: negação e falácias, prova por casos, palavras novas (wug), indução e troca de língua.
- Modo típico × máximo e índice de intuição.
- Diagnóstico da flexão errada no corretor.
- Baterias G1 a G10 e seus relatórios; baterias G na aba Pesquisa.

## 1.0 (30/10/2026)

Primeira versão marcada: gerador em português e inglês com filtro de dicionário, correção em dois
eixos (lógica e morfologia), níveis 1 a 3, abas Gerador, Humano × IA e Pesquisa, e as baterias 1 a
7 documentadas em `testes/`.
