# Bateria 3 — Claude Sonnet 5.5 (esforço low e max), comparado ao Haiku 5.5

17/10/2026. Mesmo protocolo e **os mesmos 10 prompts** da bateria 2 do Haiku
(ver `haiku-5.5.md`): sementes 1101, 1202 e 1303, gerador corrigido (artigo antes do nome,
forma pedida nunca escrita no texto), um desafio por janela, sem acesso a gabarito, instrução
extra "não leia arquivos nem use ferramentas para resolver". 10 Sonnet low + 10 Sonnet max.
Correção com o corretor oficial do projeto (`corrigir` + `placarDosEixos`). Critério: conta a
palavra posta na lacuna; outra forma oferecida para a lacuna = flexão ambígua.

## Desafio a desafio (as quatro configurações)

| # | Nível · variante | Gabarito | Haiku low | Haiku max | Sonnet low | Sonnet max |
|---|---|---|---|---|---|---|
| B1 | 1 · adj. gênero | doglepento | doglepenta ⚠ | doglepenta ⚠ | doglepenta ⚠ | doglepenta ⚠ |
| B2 | 1 · gerúndio | globrepando | globrepa ⚠ | ✔ | ✔ | ✔ |
| B3 | 1 · verbo plural | fozimbem | fozimbe ⚠ | ✔ | fozimbam ⚠ | ✔ |
| B4 | 2 · adj. gênero | zetescina | ✔ | zetescino (… zetescina) ≈ | zetescino ⚠ | zetescino ⚠ |
| B5 | 2 · gerúndio | gladobrando | gladobra ⚠ | gladobra ⚠ | gladobra ⚠ | ✔ |
| B6 | 2 · adj. plural | plugromentos | ✔ | ✔ | ✔ | ✔ |
| B7 | 3 · adj. gênero | grovradrenta | grovradrento ⚠ | grovradrento (… grovradrenta) ≈ | grovradrento ⚠ | grovradrento ⚠ |
| B8 | 3 · gerúndio | gredrombando | gredromba ⚠ | ✔ | gredromba ⚠ | ✔ |
| B9 | 3 · adj. plural | vraflaventos | vraflavento ⚠ | vraflavento ⚠ | vraflavento ⚠ | vraflavento ⚠ |
| B10 | 3 · verbo plural | brenobem | brenobe ⚠ | ✔ | ✔ | ✔ |

## Placar nos dois eixos

| | Haiku low | Sonnet low | Haiku max | Sonnet max |
|---|---|---|---|---|
| **Lógica** | 100% | 100% | 100% | 100% |
| Armadilhas (B7–B10) | 0/4 quedas | 0/4 | 0/4 | 0/4 |
| **Morfologia** | **20%** | **30%** | **50%** (+2 ambíguas) | **60%** |
| — gerúndio (3) | 0 | 1 | 2 | **3** |
| — verbo no plural (2) | 0 | 1 | 2 | 2 |
| — gênero do personagem (3) | 1 | 0 | 0 (2 ambíguas) | 0 |
| — adjetivo no plural (2) | 1 | 1 | 1 | 1 |
| Tempo por resposta | 6–13 s | 5–9 s | 26–55 s | 16–55 s |
| Tokens por resposta | ~33–37 mil | ~33 mil | ~38–44 mil | ~35–39 mil |

## Conclusões

1. **A lógica dos níveis 1–3 não separa nada.** 40/40 nas quatro configurações, nenhuma queda
   nas 16 armadilhas da recíproca. Os dois modelos, nos dois esforços, explicam a cadeia e
   nomeiam a armadilha.
2. **A morfologia faz uma escada limpa:** Haiku low 20% < Sonnet low 30% < Haiku max 50% <
   Sonnet max 60%. **O esforço pesou mais que o tamanho do modelo**: o Haiku no max foi melhor
   que o Sonnet no low.
3. **O gerúndio é o melhor separador:** 0 → 1 → 2 → 3 acertos, na mesma ordem da escada. Quem
   acerta explica a forma ("depois de 'está' o verbo vai para o gerúndio; 'globrepa' é presente
   de um verbo em -ar"). O Sonnet max acertou os três, inclusive o B5, que todos os outros
   erraram.
4. **A concordância de gênero com o personagem derrubou todo mundo.** Nenhuma configuração passou
   de 1/3. O Sonnet max errou os três — e no B4, na mesma resposta, escreveu "não dá para concluir
   que a Glanhira é flovrodros**a**" (concordando certo, ao falar da regra que não se aplica) e
   respondeu "zetescin**o**" na lacuna. Ele sabe concordar; na lacuna, prefere copiar a forma da
   regra. É o item mais difícil do LogiGen até agora.
5. **O B9 também derrubou todo mundo** (plural vindo de "Quem fledola é vraflavento", com
   personagens de gêneros diferentes, num desafio com armadilha). O B6, parecido mas sem
   armadilha e com dois personagens masculinos, todos acertaram. Hipótese a testar: **carga
   lógica (armadilha) rouba atenção da morfologia**, e/ou o plural misto (masculino) aumenta a
   hesitação. Com um desafio de cada, ainda não dá para separar as duas causas.
6. **Um erro de tipo novo:** o Sonnet low tentou flexionar o B3 e errou a conjugação
   ("fozimb**am**", terminação de -ar, quando "fozimbe" no plural é "fozimb**em**"). Não foi cópia,
   foi flexão errada — sinal de que ele percebeu a função de verbo.
7. **Custo:** no max, cada resposta levou de 3 a 8 vezes mais tempo, com ~10–20% mais tokens.

## Escala (v0) aplicada às quatro configurações

| Configuração | Lógica (níveis 1–3) | Morfologia |
|---|---|---|
| Haiku 5.5 low | 100% | 20% |
| Sonnet 5.5 low | 100% | 30% |
| Haiku 5.5 max | 100% | 50% (+20% ambígua) |
| Sonnet 5.5 max | 100% | 60% |

## Próximos passos sugeridos

- Repetir com o Opus 5.5 para ver se a morfologia satura e se o gênero finalmente cai.
- Testar a hipótese do item 5: o mesmo desafio de plural com e sem armadilha, e com
  personagens do mesmo gênero e de gêneros diferentes.
- Gênero como eixo de dificuldade dos próximos níveis: é o ponto em que até o Sonnet max falha.
- Amostra ainda pequena (10 desafios por configuração); para a escala valer, o ideal é 30+.
