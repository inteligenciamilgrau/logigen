# Bateria 7 — Sósias perto do português confundem mais? (Haiku 5.5 low)

17/10/2026. Na bateria 6 (`haiku-5.5-volume-e-sosias.md`), o Haiku low leu palavras sósias uma
pela outra. A pergunta agora é de onde vem essa confusão:

- **Contaminação:** as palavras inventadas se parecem com palavras reais do português, e a IA
  lê a palavra real.
- **Atenção:** a IA confunde duas palavras inventadas parecidas entre si.

## O que motivou o teste

Uma lista de 243 mil formas do português, com plural, feminino e conjugações, sem acentos, da
[Lista de todas as palavras do português brasileiro](https://www.ime.usp.br/~pf/dicios/)
(IME-USP, CC BY 4.0), mostrou duas coisas.

**1. O gerador antigo deixava passar muita palavra perto do português.** "Perto" quer dizer que,
tirando, pondo ou trocando uma letra, a palavra vira uma palavra real.

| Classe | Perto do português | Exemplos |
|---|---|---|
| nomes | **23,5%** | Clurar → curar, Junel → túnel, Fodice → foice |
| substantivos | 7,0% | meneza → Veneza, clabresto → cabresto |
| verbos | 4,7% | vatidar → validar, plevantar → levantar |
| adjetivos | 0,5% | "juramento", que é uma palavra real inteira |
| **geral** | **8,9%** | |

Nas baterias 2 a 5 isso afetou 6 de 68 palavras (vazepo → vazemo, plevendo → prevendo,
Vanhar → banhar…). Na bateria 6, 53 de 1.150.

**2. As duas confusões da bateria 6 caíram em pares perto do português.** Dos 45 pares de
sósias da bateria 6, só 5 tinham uma palavra perto do português, e as duas confusões estavam
entre esses 5:

- "gr**o**fesca", a uma letra de "grotesca";
- "Bramar", que é o verbo "bramar", e "Bromar", a uma letra de "cromar".

Se as confusões caíssem ao acaso, a chance de as duas acertarem esses 5 pares seria de 1%. Mas
essa análise foi feita depois do teste, então precisava de um teste controlado.

## O filtro

Antes do teste, o gerador ganhou um filtro, em `palavras.js` com `dicionario.js`: toda forma
escrita de cada palavra é conferida, e a palavra que fica perto do português é sorteada de
novo. Resultados:

- 4.500 desafios gerados, nos níveis 1 a 3 e em 30 sementes, sem erro;
- nenhuma palavra perto do português escapou;
- cerca de 0,2 s por lote de 50, e o dicionário carrega em 59 ms.

## Hipótese e teste

> Sósias perto de uma palavra real confundem mais que sósias limpas.

A montagem é a mesma da bateria 6, eixo B (cadeia de 3 passos e 4 iscas sósias), com **20
regras** para o volume não interferir. Com 20 regras, a bateria 6 não teve nenhum corte de
cadeia.

| | C, limpo | D, perto |
|---|---|---|
| Sósias do personagem, G1, G2 e V1 | nenhuma forma perto do português | a forma escrita fica a uma letra ou menos de uma palavra real |
| Resto do texto | idêntico nos dois, já filtrado | idêntico nos dois, já filtrado |
| Sósia da resposta | limpa, igual nos dois | limpa, igual nos dois |

Exemplos de sósias em D:

| Par | Sósia | Palavra real por perto |
|---|---|---|
| Jilhice | Jelhice | velhice |
| Xomur | Xemur | fêmur |
| benhilta | banhilta | banhista |
| sopacho | sapacho | capacho |
| cruzutro | cruzetro | cruzeiro |
| dregosta | dregusta | degusta |

Alguns casos são fracos, perto de formas pouco comuns ("tenhambo", perto de "tenhamo").

- **Amostra:** 10 pares, 20 Haiku 5.5 low, cada um numa janela nova, sem gabarito.
- **Prompts:** os 20 enviados conferem letra por letra com os gerados.
- **Entrega:** o C-8 não achou a ferramenta de entrega, e a resposta dele foi lida da
  transcrição.

## Resultados

| Par | C (sósias limpas) | D (sósias perto do português) |
|---|---|---|
| 1 | ✔ | **✘** afirmou "runizina" lendo "trep**o**nta" (perto de "reponta") como "trepunta"; também chamou "vedembo" de erro de digitação |
| 2 | **✘** afirmou "naponhosa" lendo "p**o**zila" (limpa) como "pizila"; chamou "jovrodo" de erro de digitação | ✔ (listou as 3 sósias) |
| 3 | ✔ | ✔ |
| 4 | ✔, hesitou (disse que era "dotimposo" e depois desfez) | ✔ |
| 5 | ✔ | ✔ |
| 6 | ✔, hesitou (disse que era "fritudrina" e depois desfez) | ✔ (listou as 3 sósias, inclusive "sapacho") |
| 7 | ✔ | ✔, hesitou ("se lanape for erro de digitação, também cremazino") |
| 8 | **✘** cadeia cortada: "dronande" (verbo), em dúvida se "brevreposo" e "brevruposo" eram a mesma palavra | **✘** respondeu "brevruposo", a sósia da resposta: "tem a mesma grafia, tratei como o mesmo predicado" |
| 9 | ✔ (chamou "drogosta" de erro de digitação, sem usar) | ✔ |
| 10 | ✔ (rejeitou todas as sósias) | **✘** afirmou "drichepento": "tratei sobrarda (perto de 'sobrara') como variante de sebrarda" |

### Placar

| | C (limpo) | D (perto) |
|---|---|---|
| Lógica certa | **8/10** | **7/10** |
| Confusão numa sósia manipulada (personagem, G1, G2, V1) | 1 em 40 pares | 2 em 40 pares |
| Confusão na sósia da resposta (limpa nos dois) | 0 (mas cortou a cadeia por causa dela) | 1 |
| Hesitou e acertou | 2 | 1 |
| Tratou uma sósia como "erro de digitação" ou "a mesma palavra" | 3 respostas | 4 respostas |

Tempo por resposta: 9–20 s. Tokens por resposta: ~34–37 mil.

## Conclusões

1. **A confusão acontece com sósias limpas também.** O C-2 errou com "pozila", que está longe
   de qualquer palavra real. Então a resposta à pergunta é que a confusão é principalmente de
   atenção, entre palavras inventadas parecidas, e não só contaminação.
2. **Perto do português, a confusão foi um pouco maior, mas sem diferença conclusiva.** Foram 2
   confusões em 40 pares manipulados em D, contra 1 em 40 em C. Somando as baterias 6 e 7, os
   pares com uma palavra perto do português tiveram 4 confusões em 45 (9%), e os limpos tiveram
   2 em 100 (2%). Há um indício, mas com números tão pequenos, e com a bateria 6 analisada
   depois, não dá para afirmar.
3. **O mecanismo aparece escrito nas respostas: o hábito de corrigir erro de digitação.** Em 7
   das 20 respostas, o Haiku tratou uma sósia como "erro de digitação", "variante" ou "a mesma
   palavra". Em texto real, duas palavras quase iguais quase sempre são um erro de digitação,
   e ele traz esse hábito para um texto onde a diferença de uma vogal importa. Isso é uma forma
   de contaminação, mas de **hábito de leitura**, não de vocabulário.
4. **A sósia da resposta é perigosa nos dois sentidos.** No par 8, o mesmo par limpo
   ("brevreposo" × "brevruposo") derrubou os dois eixos:
   - o D-8 trocou a resposta pela sósia;
   - o C-8 ficou em dúvida e parou no verbo, a primeira **cadeia cortada com só 20 regras**.
   Ou seja, a dúvida sobre uma sósia também pode provocar o corte.
5. **O filtro continua valendo a pena.** Ele elimina um fator que pode somar confusão e deixa o
   teste mais limpo: quando a IA erra, sabemos que não foi por causa de uma palavra real.

## Para os próximos níveis

- **A armadilha da sósia funciona com palavras limpas.** Ela pode ser um eixo de dificuldade sem
  depender do português, e o filtro garante isso.
- A sósia da **resposta** é a variante mais forte, porque derruba por troca e por corte. Ela pode
  ser o degrau mais alto desse eixo.

## Limitações

- Foram 10 pares. Para separar um efeito de 5% contra 2% seriam precisos centenas de desafios.
- O grau de "perto" varia: há palavras perto de formas comuns (velhice, banhista) e de formas
  raras (tenhamo, xeroca).
- O dicionário tem 243 mil formas, mas não tem nomes próprios, gírias nem estrangeirismos. A
  IA conhece mais palavras que isso.
