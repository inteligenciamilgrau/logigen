# 🧠 Algoritmo de Carga Cognitiva Sintética (LogiGen Pro Max)

Este documento descreve a matemática por trás da **Calculadora Cognitiva Dinâmica** usada para medir a dificuldade dos puzzles de lógica do **ET Labs**. O código fica em `motor.js`.

O sistema abandona a intuição humana para categorizar a dificuldade de um desafio lógico e utiliza uma aproximação baseada na **Teoria da Carga Cognitiva**. O algoritmo analisa a sintaxe do template e extrai os pilares que consomem o "contexto" e a "atenção cruzada" (Cross-Attention) da IA.

---

## 1. As 4 Variáveis da Equação

O cálculo é processado em tempo real enquanto um template é montado.

### P = Total de Regras (Premissas)
* **O que é:** Quantas linhas isoladas de afirmações lógicas existem.
* **O peso (x1.0):** É o menor peso do cálculo. Avalia o tamanho absoluto do prompt. LLMs modernas são boas com textos enormes, então o tamanho do texto por si só não quebra a IA.

### V = Diversidade de Entidades (Variáveis Únicas)
* **O que é:** A quantidade de marcações `{S1}`, `{A2}`, `{N1}` diferentes no template (regras, pergunta e gabarito).
* **O peso (x1.5):** Mede a necessidade da IA de armazenar tokens virtuais e não confundir sujeitos. Quanto mais objetos/atores diferentes, maior a chance de atribuir uma ação à pessoa errada (como um jogo de "copos embaralhados").

### E = Cruzamentos e Elos (As 'Pontes Lógicas')
* **O que é:** Quantas variáveis aparecem em **mais de um lugar** — em duas regras diferentes, ou ligando uma regra à pergunta ou ao gabarito.
* **O peso (x2.5):** É o fator mais destrutivo para IAs. Se `{A1}` é citado na Regra 1 e volta na Regra 5, ele funciona como uma **Ponte**, forçando deduções retroativas no labirinto vetorial.

### C = Carga Oculta (Palavras de Leitura Difícil)
* **O que é:** Cada ocorrência de **não**, **nem**, **exceto**, **falha** ou **apenas** soma **1.5**. A expressão **"em seguida"** soma **3.5** (uma vez só).
* **Por quê:** Negações e restrições obrigam a IA a inverter ou filtrar o que acabou de ler.

---

## 2. A Fórmula Matemática Central

```math
SD (Score de Dificuldade) = (P * 1.0) + (V * 1.5) + (E * 2.5) + C
```

Exemplo: um puzzle com 6 premissas, 9 variáveis diferentes, 8 delas funcionando como pontes e nenhuma palavra difícil:
`(6 * 1) + (9 * 1.5) + (8 * 2.5) + 0 = 39.5 pontos de Carga Cognitiva` → **Nível 7**.

---

## 3. Régua de Divisão dos Níveis

O score define o **Nível Calculado (LC)**:

| Nível | Score | Nome | | Nível | Score | Nome |
|---|---|---|---|---|---|---|
| 1 | até 21 | Básico | | 11 | 66 a 74 | Distorção Quântica |
| 2 | 21 a 26 | Interm. | | 12 | 74 a 84 | Labirinto Abissal |
| 3 | 26 a 28 | Dupla Condição | | 13 | 84 a 94 | Sobreposição 3D |
| 4 | 28 a 31 | Inversores | | 14 | 94 a 105 | Grafo Oculto Inverso |
| 5 | 31 a 34 | Ramificação | | 15 | 105 a 118 | Nó Oculto Recíproco |
| 6 | 34 a 38 | Multi-Excludente | | 16 | 118 a 132 | Teia Fractal de Tormenta |
| 7 | 38 a 44 | Efeito Borboleta | | 17 | 132 a 146 | Retrocausalidade Sombria |
| 8 | 44 a 53 | Lógica Excludente Tardia | | 18 | 146 a 156 | Espiral Infinita Densa |
| 9 | 53 a 60 | Anomalia Cíclica e Ruído | | 19 | 156 a 165 | Colapso Assintótico Mortal |
| 10 | 60 a 66 | Causalidade Divina de Matriz | | 20 | acima de 165 | A Cegueira Divina Sigma |

Cada faixa inclui o limite de cima e exclui o de baixo (ex.: 21 é Nível 1; 21.5 é Nível 2).

### Nível Real (LR)

A fórmula não enxerga tudo — um puzzle curto pode esconder uma armadilha difícil. Por isso cada template tem um **ajuste manual** (botões − / + no Construtor Lógico):

```
LR = LC + ajuste   (limitado entre 1 e 20)
```

O Gerador e a lista de templates ordenam pelo **LR**.
