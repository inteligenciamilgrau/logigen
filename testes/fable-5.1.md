# Bateria 5 — Claude Fable 5.1 (esforço low e max), comparado às seis configurações anteriores

17/10/2026. Mesmo protocolo e **os mesmos 10 prompts** das baterias 2, 3 e 4 (ver
`haiku-5.5.md`, `sonnet-5.5.md` e `opus-5.5.md`): sementes 1101, 1202 e 1303, um desafio por
janela, sem acesso a gabarito, instrução extra "não leia arquivos nem use ferramentas para
resolver". 10 Fable low + 10 Fable max. Correção com o corretor oficial do projeto. Critério:
conta a palavra posta na lacuna; outra forma oferecida para a lacuna = flexão ambígua.

## Desafio a desafio (as oito configurações)

| # | Variante | Gabarito | Haiku low | Sonnet low | Haiku max | Sonnet max | Opus low | Fable low | Fable max | Opus max |
|---|---|---|---|---|---|---|---|---|---|---|
| B1 | adj. gênero | doglepento | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ≈ (+ "doglepenta") | **✔** |
| B2 | gerúndio | globrepando | ⚠ | ✔ | ✔ | ✔ | ≈ | ≈ (+ "globrepado") | ✔ | ✔ |
| B3 | verbo plural | fozimbem | ⚠ | ⚠ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| B4 | adj. gênero | zetescina | ✔ | ⚠ | ≈ | ⚠ | ✔ | ✔ | ✔ | ✔ |
| B5 | gerúndio | gladobrando | ⚠ | ⚠ | ⚠ | ✔ | ✔ | ✔ | ✔ | ✔ |
| B6 | adj. plural | plugromentos | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| B7 | adj. gênero | grovradrenta | ⚠ | ⚠ | ≈ | ⚠ | ⚠ | **✔** | **✔** | ✔ |
| B8 | gerúndio | gredrombando | ⚠ | ⚠ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| B9 | adj. plural | vraflaventos | ⚠ | ⚠ | ⚠ | ⚠ | ✔ | ✔ | ✔ | ✔ |
| B10 | verbo plural | brenobem | ⚠ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

As respostas do Fable no B1:

- **low:** "o Glanol é doglepenta". Na mesma resposta, ao falar do distrator, concordou certo
  ("não se pode concluir que ele seja croplalhos**o**"). É o mesmo padrão do Sonnet max no B4.
- **max:** respondeu "doglepento", mas condicionou: "se for invariável em -a (como 'hipócrita',
  'poliglota'), fica 'doglepenta'". A hesitação é defensável em português, porque esses
  adjetivos existem, mas pelo critério da bateria conta como ambígua.

## A escala (v0) com as oito configurações

| Configuração | Lógica | Morfologia | Gerúndio | Verbo plural | Gênero | Adj. plural |
|---|---|---|---|---|---|---|
| Haiku 5.5 low | 100% | **20%** | 0/3 | 0/2 | 1/3 | 1/2 |
| Sonnet 5.5 low | 100% | **30%** | 1/3 | 1/2 | 0/3 | 1/2 |
| Haiku 5.5 max | 100% | **50%** (+2 ambíguas) | 2/3 | 2/2 | 0/3 | 1/2 |
| Sonnet 5.5 max | 100% | **60%** | 3/3 | 2/2 | 0/3 | 1/2 |
| Opus 5.5 low | 100% | **70%** (+1 ambígua) | 2/3 | 2/2 | 1/3 | 2/2 |
| Fable 5.1 low | 100% | **80%** (+1 ambígua) | 2/3 | 2/2 | 2/3 | 2/2 |
| Fable 5.1 max | 100% | **90%** (+1 ambígua) | 3/3 | 2/2 | 2/3 | 2/2 |
| Opus 5.5 max | 100% | **100%** | 3/3 | 2/2 | **3/3** | 2/2 |

Tempo e tokens por resposta:

| Configuração | Tempo | Tokens |
|---|---|---|
| Fable low | 11–17 s | ~33 mil |
| Fable max | 27–52 s | ~34–36 mil |

## Conclusões

1. **A lógica segue saturada:** 80/80 nas oito configurações e nenhuma queda nas 32 armadilhas
   da recíproca. O Fable dá nome técnico ao erro que a armadilha provoca: "afirmar o
   consequente", "conversão ilícita da universal afirmativa" e "falácia do meio não
   distribuído".
2. **No low, o Fable venceu o Opus** (80% × 70%). A diferença está no B7, o gênero com
   armadilha: o Fable low acertou e o Opus low errou.
3. **No max, o Opus manteve o topo** (100% × 90%). A diferença é uma hesitação só, no B1: o
   Fable max pôs a forma certa na lacuna, mas ofereceu a forma da regra como alternativa.
4. **Com 10 desafios, nenhuma das duas diferenças é conclusiva.** Cada uma depende de um item.
   Para dizer quem é melhor no topo, é preciso uma amostra maior e itens mais difíceis.
5. **O B1 virou o item mais difícil da bateria:** nível 1, sem armadilha, e só o Opus max
   acertou sem hesitar. Isso enfraquece a hipótese da bateria 3 de que a carga lógica
   (armadilha) rouba atenção da morfologia: o B7, de gênero com armadilha, foi acertado pelos
   dois Fables. Hipótese nova: no nível 1 a resposta parece óbvia demais, e o modelo copia a
   forma da regra sem parar para concordar.
6. **"Isca fonética" (Fable max, B9):** o modelo notou que o nome "Vanhar" se parece com
   "vanhafuda", a palavra da armadilha. Foi coincidência do gerador: a checagem de unicidade
   garante que uma chave não contenha a outra, mas não impede começos parecidos. Um nome
   parecido com uma palavra do desafio pode puxar a resposta para um lado sem querer.

## Próximos passos sugeridos

- Ampliar a checagem de unicidade para que um nome não comece como outra palavra do mesmo
  desafio (por exemplo, sem prefixo comum de 4 letras).
- Testar a hipótese do item 5 com vários desafios de gênero no nível 1, com e sem armadilha.
- Amostra maior (30+ por configuração) e níveis mais difíceis para separar Opus max de Fable max.
