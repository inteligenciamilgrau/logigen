# Bateria 4 — Claude Opus 5.5 (esforço low e max) e a escala completa

17/10/2026. Mesmo protocolo e **os mesmos 10 prompts** das baterias 2 e 3 (ver
`haiku-5.5.md` e `sonnet-5.5.md`): sementes 1101, 1202 e 1303, gerador corrigido, um desafio por
janela, sem acesso a gabarito. 10 Opus low + 10 Opus max. Correção com o corretor oficial do
projeto. Critério: conta a palavra posta na lacuna; outra forma oferecida para a lacuna =
flexão ambígua; um parêntese que só explica a derivação da forma certa não conta como hesitação
(Opus low B4: "zetescina (zetescino no feminino)").

## Desafio a desafio (as seis configurações)

| # | Variante | Gabarito | Haiku low | Sonnet low | Haiku max | Sonnet max | Opus low | Opus max |
|---|---|---|---|---|---|---|---|---|
| B1 | adj. gênero | doglepento | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | **✔** |
| B2 | gerúndio | globrepando | ⚠ | ✔ | ✔ | ✔ | ≈ (+ "globrepado") | ✔ |
| B3 | verbo plural | fozimbem | ⚠ | ⚠ (fozimbam) | ✔ | ✔ | ✔ | ✔ |
| B4 | adj. gênero | zetescina | ✔ | ⚠ | ≈ | ⚠ | ✔ | ✔ |
| B5 | gerúndio | gladobrando | ⚠ | ⚠ | ⚠ | ✔ | ✔ | ✔ |
| B6 | adj. plural | plugromentos | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| B7 | adj. gênero | grovradrenta | ⚠ | ⚠ | ≈ | ⚠ | ⚠ | **✔** |
| B8 | gerúndio | gredrombando | ⚠ | ⚠ | ✔ | ✔ | ✔ | ✔ |
| B9 | adj. plural | vraflaventos | ⚠ | ⚠ | ⚠ | ⚠ | **✔** | **✔** |
| B10 | verbo plural | brenobem | ⚠ | ✔ | ✔ | ✔ | ✔ | ✔ |

## A escala (v0) com as seis configurações

| Configuração | Lógica | Morfologia | Gerúndio | Verbo plural | Gênero | Adj. plural |
|---|---|---|---|---|---|---|
| Haiku 5.5 low | 100% | **20%** | 0/3 | 0/2 | 1/3 | 1/2 |
| Sonnet 5.5 low | 100% | **30%** | 1/3 | 1/2 | 0/3 | 1/2 |
| Haiku 5.5 max | 100% | **50%** (+2 ambíguas) | 2/3 | 2/2 | 0/3 | 1/2 |
| Sonnet 5.5 max | 100% | **60%** | 3/3 | 2/2 | 0/3 | 1/2 |
| Opus 5.5 low | 100% | **70%** (+1 ambígua) | 2/3 | 2/2 | 1/3 | 2/2 |
| Opus 5.5 max | 100% | **100%** | 3/3 | 2/2 | **3/3** | 2/2 |

Tempo por resposta: Opus low 6–16 s · Opus max 24–44 s.

## Conclusões

1. **A lógica dos níveis 1–3 saturou para toda a família 5.5:** 60/60 nas seis configurações, 0
   quedas em 24 armadilhas da recíproca. Ela não separa modelo nem esforço.
2. **A morfologia faz uma escada completa e monotônica:** 20 → 30 → 50 → 60 → 70 → 100%.
   Nos modelos menores, o esforço pesou mais que o tamanho (Haiku max > Sonnet low); no topo, o
   tamanho voltou a pesar (Opus low > Sonnet max).
3. **A concordância de gênero com o personagem é o divisor do topo.** Só o Opus max acertou os
   três. Ele verificou o gênero conscientemente e explicou com uma analogia ("toda baleia é
   mamífera, então o golfinho é mamífero") e com a regra de classe gramatical: "as palavras sem
   artigo são adjetivos e concordam com quem descrevem; as palavras com artigo são substantivos
   e não mudam de gênero".
4. **O B9 (plural misto vindo de "Quem fledola é vraflavento", com armadilha) só caiu para o
   Opus** (low e max). O Opus max explicou as três camadas: a armadilha, o masculino plural do
   grupo misto e que "fledola" é verbo e não serve para "são ___".
5. **O Opus max zerou a bateria.** Para os níveis seguintes medirem modelos de topo, a
   dificuldade precisa subir — na morfologia (flexões mais raras, gênero em cadeias longas,
   plural feminino, particípio concordando) e na lógica (os operadores novos: negação, "ou",
   "alguns", "exceto").

## Próximos passos sugeridos

- Aumentar a amostra (30+ desafios por configuração) para os números ficarem estáveis.
- Criar desafios de morfologia mais difíceis para separar Opus max de Opus low.
- Implementar no gerador os operadores lógicos novos, já que a lógica atual satura.
