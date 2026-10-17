# Bateria de testes — Claude Haiku 5.5, esforço low

Objetivo: achar os pontos fracos do modelo mais fraco (Haiku) no esforço mais baixo (low),
para orientar a criação dos níveis mais difíceis e de uma escala de avaliação.

## Método

- Cada desafio foi enviado para um subagente Haiku 5.5 novo (esforço low), sem histórico:
  uma pergunta por janela, sem acesso a arquivos nem aos gabaritos.
- O texto enviado é o do botão "Copiar" da página ("Responda esse desafio:" + desafio),
  mais uma linha pedindo para não usar ferramentas.
- Gabaritos gerados e guardados só do lado do avaliador.
- Correção pelo mesmo critério da página: forma exata = certo; palavra certa na forma
  errada = flexão errada; palavra da armadilha = caiu na armadilha; outra = errado.
- Início: 17/10/2026, 03:37. Limite: 30 minutos.

## Rodada 1 — níveis atuais (1, 2 e 3)

10 desafios: 3 do nível 1 (semente 101), 3 do nível 2 (semente 202), 4 do nível 3 (semente 303),
variantes de flexão diferentes.

| # | Variante | Gabarito | Haiku respondeu | Status |
|---|---|---|---|---|
| N1-1 | adjetivo · gênero | vesurdento | vesurdenta | ⚠ flexão |
| N1-2 | verbo · gerúndio | brarertando | brarerta | ⚠ flexão |
| N1-3 | verbo · plural | befanham | befanham | ✔ |
| N2-1 | adjetivo · gênero | vaglochoso | vaglochoso | ✔ (forma igual à da regra) |
| N2-2 | verbo · gerúndio | chobrolvando | chobrolva | ⚠ flexão |
| N2-3 | adjetivo · plural | jenimbosos | jenimbosos | ✔ |
| N3-1 | verbo · plural | drechobrem | drechobre | ⚠ flexão |
| N3-2 | adjetivo · plural | bruflidosos | bruflidosos | ✔ |
| N3-3 | verbo · gerúndio | blorastando | blorasta | ⚠ flexão |
| N3-4 | adjetivo · gênero | chuleflenta | chuleflento | ⚠ flexão |

**Lógica: 10/10** (palavra certa em todos; 0 armadilhas). **Forma exata: 4/10.**

### Conclusões da rodada 1

1. A lógica dos níveis 1–3 é fácil para o Haiku low: cadeias de 2 passos e a armadilha da
   recíproca não o enganaram nenhuma vez. Em todas as respostas ele explicou por que a
   regra-armadilha "não se aplica".
2. O ponto fraco é a **morfologia**: ele tende a **copiar a forma que aparece na regra**.
   - Gerúndio: 0/3. Responde "Xarice está brarerta" — trata o verbo inventado como se fosse
     adjetivo/particípio ("está aberta"). Exatamente a falha que o teste de flexão quer pegar.
   - Gênero do personagem: 0/2 nos casos em que a forma da regra difere da pedida.
   - Plural: adjetivo 2/2, verbo 1/2.
3. **Defeito do teste encontrado**: o gênero do personagem só é sinalizado pela terminação do
   nome. "-el" é ambíguo em português (Raquel, Isabel são femininos), então o erro do N1-1 pode
   ser culpa do teste. Hipótese a testar: artigo antes do nome ("O Crodel é...") resolve.
4. Limitação: não foi possível auditar as chamadas de ferramenta dos subagentes (a transcrição
   não fica disponível). Um deles (N3-1) fez 1 chamada a mais; a resposta não indica acesso a
   gabarito.

## Rodada 2 — experimentos (fora do niveis.js)

Como a lógica foi fácil, aumentei a dificuldade lógica. Para não misturar com a falha de
flexão, os experimentos de lógica usam adjetivo no plural (onde ele acertou 2/2).

| Experimento | O que muda | Passos | Armadilhas |
|---|---|---|---|
| E1 | 3 passos + recíproca (candidato a nível 4) | 3 | 1 |
| E2 | 4 passos com elo verbo + recíproca | 4 | 1 |
| E3 | dupla recíproca (duas armadilhas, respostas erradas diferentes) | 2 | 2 |
| E4 | troca de personagem: dois personagens, pergunta sobre o segundo | 1 | 0 |
| E5 | ruído: 1 passo e 5 regras de distração | 1 | 0 |
| E6 | nível 1 adjetivo · gênero **com artigo antes do nome** ("O Crodel") | 1 | 0 |

No E6, só entraram desafios em que a forma pedida é diferente da que aparece na regra
(senão copiar já daria certo).

| # | Experimento | Gabarito | Haiku respondeu | Lógica | Forma |
|---|---|---|---|---|---|
| E1-1 | 3 passos + recíproca | frenechudas | frenechudas | ✔ | ✔ |
| E1-2 | 3 passos + recíproca | gladrafludos | gladrafludos | ✔ | ✔ |
| E2-1 | 4 passos + recíproca | fredrombentas | fredrombento | ✔ | ⚠ singular, copiou a regra |
| E2-2 | 4 passos + recíproca | xadalventos | xadalventos | ✔ | ✔ |
| E3-1 | dupla recíproca | drozolhudos | drozolhudo | ✔ | ⚠ singular, copiou a regra |
| E3-2 | dupla recíproca | xigrestudos | xigrestudas | ✔ | ⚠ gênero da regra |
| E4-1 | troca de personagem | dudruvudos | dudruvudas | ✔ | ⚠ gênero da regra |
| E5-1 | ruído (5 distrações) | fonutrentos | "fonutrentos (fonutrentas, se a concordância for feminina)" | ✔ | ✔ (mas hesitou no gênero) |
| E6-1 | gênero com artigo ("O Fadur") | cramascoso | cramascosa | ✔ | ⚠ gênero da regra |
| E6-2 | gênero com artigo ("A Flunice") | tatrentuda | tatrentudo | ✔ | ⚠ gênero da regra |

**Lógica: 10/10. Forma exata: 4/10.**

### Conclusões da rodada 2

1. A lógica continua intacta com 4 passos + armadilha, dupla recíproca, troca de personagem e
   ruído. As 2 armadilhas da dupla recíproca não o enganaram.
2. **A hipótese do artigo caiu**: com "O Fadur" / "A Flunice" deixando o gênero explícito, ele
   continuou copiando o gênero da regra (0/2). O erro de gênero é do modelo, não do teste.
   Mesmo assim o artigo é recomendado: no E5-1 o próprio Haiku apontou a ambiguidade do gênero
   pelo nome ("fonutrentas, se a concordância for feminina") — o teste precisa ser justo para
   qualquer modelo.
3. A cópia da forma da regra aparece em todos os tipos de flexão, inclusive no adjetivo plural,
   que na rodada 1 tinha dado 2/2. Placar acumulado do adjetivo plural: 6/10.

## Rodada 3 — estresse lógico

| Experimento | O que muda | Passos | Armadilhas |
|---|---|---|---|
| E7 | 6 passos + 2 armadilhas + 2 regras de ruído (12 regras) | 6 | 2 |
| E8 | interseção: dois personagens de grupos diferentes; a lacuna pede a única propriedade comum aos dois | 1 | 2 (achadas pelo solucionador) |
| E9 | 10 passos + 3 armadilhas + 2 regras de ruído (18 regras) | 10 | 3 |

| # | Experimento | Gabarito | Haiku respondeu | Lógica | Forma |
|---|---|---|---|---|---|
| E7-1 | 6 passos + 2 armadilhas | fretirdudos | fretirdudos (reconstruiu os 6 elos) | ✔ | ✔ |
| E7-2 | 6 passos + 2 armadilhas | glilhubosos | glilhubosas | ✔ | ⚠ gênero |
| E8-1 | interseção | zedilinos | zedilino | ✔ | ⚠ singular |
| E8-2 | interseção | treflofosas | "treflofosas (no plural misto, treflofosos)" | ✔ | ✔ (hesitou no gênero) |

**Mudança de método durante a rodada 3:** o subagente do E7-3 terminou duas vezes sem
entregar resposta. Ele interpretou "não use nenhuma ferramenta" ao pé da letra, e a entrega da
resposta ao avaliador é feita por uma ferramenta. Foi liberada só a ferramenta de entrega, e
nos desafios seguintes (E9) a instrução passou a ser "não leia arquivos nem use ferramentas
**para resolver**". O texto do desafio não mudou.

| # | Experimento | Gabarito | Haiku respondeu | Lógica | Forma |
|---|---|---|---|---|---|
| E7-3 | 6 passos + 2 armadilhas | vapachinos | — (não entregou resposta, 3 tentativas) | n/a | n/a |
| E9-1 | 10 passos + 3 armadilhas | bralhedrosos | bralhedrosas ("concorda em feminino plural com elas") | ✔ (10 elos certos) | ⚠ achou que Vrevim é feminino |
| E9-2 | 10 passos + 3 armadilhas | jidrostudos | jidrostudos (10 elos certos) | ✔ | ✔ |

O E7-3 ficou fora da contagem: falha de entrega da resposta, não de raciocínio.

### Conclusões da rodada 3

1. **A lógica do tipo "todo A é B" não quebra o Haiku low**, nem com 10 passos, 3 armadilhas
   e 18 regras embaralhadas. Em todas as respostas ele reconstruiu a cadeia inteira, elo a elo,
   e explicou por que as armadilhas não se aplicam. Mesmo no esforço low ele "pensa em voz alta"
   na resposta.
2. A interseção (achar a única propriedade comum a dois personagens) também foi fácil.
3. Conclusão para o projeto: com a linguagem atual, aumentar passos/armadilhas não gera
   dificuldade lógica real para este modelo. Os próximos níveis precisam de **operadores novos**.

## Rodada 4 — protótipos de operadores novos (escritos à mão)

Escritos e conferidos à mão (ainda não existem no gerador nem no solucionador). Personagens
masculinos com artigo e resposta na mesma forma que aparece na regra, para medir **só a lógica**.

| # | Operador | Raciocínio exigido | Gabarito |
|---|---|---|---|
| P1 | "ou" + "não" | não é mozundudo → não é fatraspo → é bronimo | zedantoso |
| P2 | "alguns" | "alguns são clapascentos" não vale para o Futrar | frachebino |
| P3 | "exceto" | a exceção bloqueia "zafostino"; drumafa → tredrestudo | tredrestudo |
| P4 | "nenhum" + "ou" | grebretro nunca é blonhozoso → resta vrelantoso | vrelantoso |
| P5 | contrapositiva em 2 passos + "ou" | não gladrafludo → não filhavo → não clatrono → dretifo | vronhunoso |

| # | Haiku respondeu | Lógica |
|---|---|---|
| P1 | zedantoso — usou a contrapositiva explicitamente ("quem não é mozundudo não é fatraspo") | ✔ |
| P2 | frachebino — "ele pode estar entre os pregrevos que não são clapascentos" | ✔ |
| P3 | tredrestudo — "o Flalim está nessa exceção" | ✔ |
| P4 | vrelantoso — nenhum → não blonhozoso → resta vrelantoso | ✔ |
| P5 | vronhunoso — contrapositiva em 2 passos + eliminação | ✔ |

### Conclusões da rodada 4

Nem os operadores novos (negação, "ou", "alguns", "exceto", contrapositiva) derrubaram o
Haiku low em desafios curtos. A lógica dele é sólida nesse tamanho; o que falta descobrir é
como esses operadores se comportam **combinados e em cadeias longas** — o que exige colocá-los
no gerador e no solucionador antes de testar em escala.

## Rodada 5 — o erro de flexão é falta de conhecimento ou de atenção?

| # | Pergunta | O que mede |
|---|---|---|
| M1 | "Como 'brarertar' fica no gerúndio?" | se ele sabe formar o gerúndio quando perguntado direto |
| M2 | "O Crodel é ___ / A Crodela é ___" com o adjetivo "vesurdento" | se ele sabe fazer a concordância quando perguntado direto |
| M3 | o desafio N1-2 (onde errou o gerúndio) + "responda com a palavra que completa a frase corretamente" | se um empurrãozinho na instrução resolve |

| # | Haiku respondeu | Leitura |
|---|---|---|
| M1 (1ª tentativa) | recusou: "brarertar não aparece no texto" | sonda inválida — a frase "responda apenas com base no texto acima" o impediu de usar gramática geral |
| M1 (refeita, sem "apenas com base no texto") | "brarertando" — "1ª conjugação, troca -ar por -ando" | **sabe** formar o gerúndio quando perguntado direto |
| M2 | "O Crodel é vesurdento. / A Crodela é vesurdenta." (citou lento/lenta) | **sabe** a concordância quando perguntado direto |
| M3 | "Xarice está brarerta" | o empurrãozinho na instrução **não** resolve |

## Conclusões gerais

Tempo usado: ~03:37 a 03:55 (menos de 20 dos 30 minutos). 34 subagentes; 31 desafios de lógica
respondidos (o E7-3 não entregou resposta) e 4 sondas de morfologia.

### Placar do Haiku 5.5 low

| Eixo | Resultado |
|---|---|
| **Lógica** (escolher a palavra certa) | **31/31 (100%)** — até 10 passos, 3 armadilhas, 18 regras, interseção, e os protótipos de negação, "ou", "alguns", "exceto" e contrapositiva |
| **Armadilhas** | **0 quedas** em 26 armadilhas da recíproca (+ "alguns" e "exceto") |
| **Forma exata** (desafios com flexão) | **11/26 (42%)** |
| — gerúndio | 0/3 (e 0/1 com instrução extra) |
| — gênero no singular (forma pedida ≠ forma da regra) | 0/4 (inclusive 2 com artigo explícito) |
| — adjetivo no plural | 9/16 (56%) |
| — verbo no plural | 1/2 |
| — respostas com duas formas ("hesitou") | 2 |

### O que aprendemos

1. **A lógica do LogiGen, como está, não discrimina o Haiku low.** Ele resolve tudo e explica
   cada passo, mesmo no esforço mais baixo. Aumentar passos e armadilhas na linguagem
   "todo A é B" não cria dificuldade real para ele.
2. **O ponto fraco é a morfologia, e o mecanismo é claro: ele copia a forma que aparece na
   regra.** Ele *sabe* concordar (M2) e *sabe* formar o gerúndio (M1) quando perguntado direto,
   mas dentro do desafio repete "vesurdenta" porque a regra diz "Toda ronhilha é vesurdenta",
   e responde "Xarice está brarerta" tratando o verbo inventado como adjetivo. Não é falta de
   conhecimento: é não perceber, sozinho, que precisa usá-lo.
3. **Pedir "a forma correta" na instrução não resolve** (M3). A dificuldade é perceber, sozinho,
   que a palavra tem função de verbo ou que precisa concordar com outro termo — exatamente o
   que a ideia das flexões queria medir.
4. **Defeitos do nosso teste que a bateria revelou:**
   - O gênero do personagem só aparece na terminação do nome, o que é ambíguo ("-el", "-im").
     O próprio Haiku apontou isso (E5-1, E8-2) e errou por isso (E9-1). → **pôr artigo antes do
     nome** ("O Crodel", "A Flunice").
   - Quando a forma pedida é igual à da regra, copiar acerta por sorte. → **forçar, em parte
     dos desafios, que a forma pedida seja diferente da que aparece no texto.**
   - Resposta com duas flexões ("treflofosas (ou treflofosos)") hoje conta como certa. →
     **novo status "flexão ambígua"**.

### Proposta de escala de avaliação (v0)

Dois eixos independentes, medidos no mesmo lote (mesma semente, 10 desafios por nível):

- **Eixo L — Lógica:** o maior nível em que o modelo escolhe a palavra certa (certo ou flexão
  errada) em ≥ 80% dos desafios, mais a **taxa de armadilha** (% que caiu na armadilha).
- **Eixo M — Morfologia:** % de forma exata entre os desafios em que a lógica estava certa,
  separado por tipo de flexão (gênero, número do adjetivo, número do verbo, gerúndio).

Resultado de um modelo vira algo como:
**Haiku 5.5 low → L: passa até o nível 3 (e nos experimentos até 10 passos), armadilha 0% ·
M: 42% (gerúndio 0%, gênero 0%, plural do adjetivo 56%, plural do verbo 50%).**

### Próximos passos sugeridos

1. Corrigir os defeitos do teste (artigo antes do nome, forçar forma diferente da regra,
   status "flexão ambígua").
2. Mostrar no placar da página os dois eixos (lógica e morfologia) separados.
3. Para a lógica ficar difícil, levar ao gerador e ao solucionador os operadores dos
   protótipos (negação, "ou", "alguns", "exceto") e testá-los **combinados e em cadeias longas**.
4. Morfologia como eixo próprio dos níveis: o gerúndio e a concordância com o personagem já
   derrubam o modelo mais fraco no nível 1.
5. Repetir o protocolo com Sonnet e Opus para calibrar o topo da escala, e comparar o prompt
   em lote (10 desafios numa mensagem) com um desafio por janela.

### Limitações

- Os subagentes rodam dentro do Claude Code (com instruções de programação e informações do
  projeto no contexto), não num chat puro.
- Amostras pequenas por tipo de flexão (2 a 16 casos).
- 5 subagentes fizeram 1 chamada de ferramenta a mais que não pôde ser auditada; em 2 deles a
  resposta tinha erro de flexão (o que não aconteceria se tivessem lido o gabarito).
- A frase de instrução sobre ferramentas influenciou o comportamento (E7-3 não entregou; a
  1ª M1 recusou responder).
