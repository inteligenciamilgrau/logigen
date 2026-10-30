# Plano de testes do LogiGen

Como transformar os cinco objetivos do projeto em medidas confiáveis, com escalas de
dificuldade que apontem numa direção. É um plano vivo: cada bateria nova confirma, ajusta ou
derruba uma linha daqui.

## 1. Objetivos e como cada um vira medida

### Objetivo 1 — a IA raciocina sobre o que nunca viu

**Pergunta:** o acerto vem de lógica ou de memória?

**Medida:** o mesmo desafio em três vocabulários, com a mesma lógica e a mesma ordem.

| Vocabulário | Exemplo | O que a memória poderia ajudar |
|---|---|---|
| Real coerente | "Todo gato é felino." | muito: a conclusão já é conhecida |
| Real absurdo | "Toda baleia voa." | atrapalha: o mundo real contradiz o texto |
| Inventado | "Toda plalhoma é zedantosa." | nada: as palavras não existem |

- Se o acerto com palavras inventadas for igual ao das reais coerentes, a memória não explica
  o resultado.
- Se as reais absurdas forem **piores** que as inventadas, a IA mostra o mesmo "viés de crença"
  dos humanos: o conhecimento do mundo atrapalha a lógica.

**Controles:**
- filtro de dicionário: nenhuma palavra inventada a 1 letra de uma real;
- sementes novas a cada verificação;
- lote pareado em português e inglês: a mesma lógica nas duas línguas deve dar o mesmo acerto.

**Hipótese em teste:** os acertos com palavras inventadas apontam para um arcabouço lógico
aprendido a partir dos dados, uma possível evidência de comportamento emergente. O que já
sustenta isso, onde é preciso cuidado e os três testes que a confirmariam estão em
[HIPOTESE.md](HIPOTESE.md).

### Objetivo 2 — onde vai bem, onde vai mal, e existe um "fator G"?

**Pergunta:** os eixos medem uma capacidade só ou várias?

**Medidas:**
- o **perfil** de cada modelo: em cada eixo, o nível mais alto em que ele acerta 80% ou mais,
  ou a habilidade θ estimada pela TRI (seção 3);
- a **correlação entre eixos**: se quem vai bem num eixo vai bem nos outros (a "variedade
  positiva" que define o fator G humano), um fator geral explica boa parte dos resultados;
- a **estrutura dos itens**: se os itens ficam na mesma ordem de dificuldade para todos os
  modelos, o teste mede uma dimensão só; se a ordem muda de um eixo para outro, há mais de um
  fator.

### Objetivo 3 — a IA cria conceitos novos?

**Pergunta:** além de deduzir, a IA consegue criar algo que não estava escrito?

Para medir isso sem depender de opinião, as tarefas precisam ter gabarito verificável pelo
gerador:

| Tarefa | Exemplo | Como corrigir |
|---|---|---|
| Descoberta de regra | "Estes são glurpos: …; estes não são: …. O Xavim é um glurpo?" | o gerador sabe a regra escondida e testa a previsão em casos novos |
| Conceito novo | "Chame de *trambo* quem é peludo e voa." Depois, uma cadeia que só fecha usando *trambo* | o solucionador confere a conclusão |
| Morfologia produtiva | "Quem glovunda é um ___?" → *glovundador* | as regras de derivação do idioma (-dor, -ção, -vel, -oso) |
| Conclusão aberta | "O que mais dá para concluir sobre o Xavim?" | precisão e cobertura contra o fecho lógico completo do solucionador |

### Objetivo 4 — medir e comparar modelos diferentes

**Pergunta:** quanto um modelo é melhor que outro, e em quê?

**Medidas:**
- os **mesmos itens** para todos os modelos, tirados de bancos congelados (seção 3), com o
  mesmo prompt e o mesmo formato de resposta;
- a **habilidade θ** de cada modelo em cada eixo, estimada pela TRI: uma régua comum, em que
  "o modelo A está um ponto acima do B" tem o mesmo sentido em qualquer eixo;
- a **margem de erro** sempre junto do número: uma diferença só conta se os intervalos de
  confiança não se sobrepõem;
- a **configuração completa** de cada resultado: modelo, versão, esforço de raciocínio, data,
  versão do banco.

O resultado vai para a aba Benchmarks, que só abre quando houver um banco congelado com
amostra suficiente.

### Objetivo 5 — apontar a direção para uma IA mais robusta

**Pergunta:** o que exatamente precisa melhorar?

Este é o objetivo final, e amarra os outros: um placar diz *quem* vai melhor; um diagnóstico
diz *o que* falta. Por isso cada erro é classificado pela causa, e cada causa aponta uma
direção:

| Erro típico | Eixo onde aparece | O que indica | Direção |
|---|---|---|---|
| Cadeia cortada | volume, profundidade | perde o fio em textos longos | manter o estado do raciocínio por muitos passos |
| Confusão com sósia | sósias | lê "por cima", corrige o que parece erro de digitação | leitura exata, letra por letra, quando importa |
| Copiar a forma da regra | morfologia | trata a palavra como cópia, não como função gramatical | concordância a partir da função na frase |
| Ler ao contrário | recíproca | confunde "todo A é B" com "todo B é A" | direção das implicações |
| Inventar uma resposta | indeterminação | prefere responder a admitir que não dá para saber | calibração: dizer "não sei" quando não dá |
| Viés de crença | vocabulário | o conhecimento do mundo passa por cima do texto | separar o que o texto diz do que se sabe |

**Como apresentar:**
- para cada modelo, o **ponto de quebra** de cada eixo (onde o acerto cai abaixo de 80%) e o
  erro que aparece ali;
- os erros com exemplo real, para que quem desenvolve modelos veja o padrão, não só a
  porcentagem;
- quando um modelo novo resolve um erro antigo, o eixo sobe de nível em vez de ser
  aposentado: o teste continua apontando para a próxima fronteira.

## 2. Eixos com escala de dificuldade

Um eixo serve quando cumpre quatro condições:
1. um só "botão" muda a dificuldade sempre no mesmo sentido;
2. o solucionador continua gerando o gabarito sozinho e único;
3. separa pelo menos duas configurações de IA;
4. tem um erro típico que o corretor reconhece.

As condições 3 e 4 servem aos objetivos 4 e 5: um eixo que não separa modelos não compara
nada, e um eixo sem erro típico não diz o que melhorar. Por isso todo eixo da tabela serve
também aos objetivos 4 e 5, além do objetivo indicado na última coluna.

| # | Eixo | Botão | Escala proposta | O que já sabemos | Erro típico | Objetivo |
|---|---|---|---|---|---|---|
| 1 | Morfologia | tipo de flexão | adjetivo plural → verbo plural → gerúndio → gênero; depois concordância à distância, plural misto, derivação | escada de 20% a 100% em 8 configurações; gênero foi o mais difícil | copiar a forma da regra | 1, 2 |
| 2 | Volume | regras de ruído | 20 → 100 → 300 → 1.000 | Haiku low corta a cadeia a partir de 100; Sonnet low não corta até 300 | cadeia cortada | 2 |
| 3 | Sósias | distância e quantidade | sem sósia → 2 letras → 1 letra → sósia da resposta | Haiku confunde já com 20 regras; Sonnet low só com 300; Sonnet max nunca | confusão, "erro de digitação" | 1, 2 |
| 4 | Profundidade | passos da cadeia | 1 → 3 → 10 → 30 | Haiku low fez 10 passos com 18 regras | cadeia cortada | 2 |
| 5 | Ramificação | saídas por elo, becos sem saída | 1 → 2 → 4 | não testado | seguir o primeiro caminho | 2 |
| 6 | Recíproca | regras que enganam ao contrário | 0 → 1 → 3 | saturado: nenhuma queda em mais de 50 armadilhas | ler ao contrário | 2 |
| 7 | Operadores | tipo de quantificador | só "todo" → "nenhum" → "ou" (prova por casos) → "alguns" → combinados | só protótipos curtos; Haiku low acertou os 5 | — | 2 |
| 8 | Indeterminação | perguntas sem resposta dedutível | 0% → 25% → 50% dos desafios | não testado | inventar uma resposta | 2 |
| 9 | Vocabulário | tipo de palavra | real coerente → real absurdo → inventado → inventado com sósia | não testado; o modo "palavras reais" já permite | viés de crença | 1 |
| 10 | Idioma | português × inglês (lote pareado) | mesma lógica nas duas línguas | não testado | — | 1 |
| 11 | Descoberta de regra | tamanho da regra escondida | 1 atributo → conjunção → disjunção → exceção | não existe ainda | — | 3 |
| 12 | Conceito novo | uso do conceito | definir → nomear → usar numa cadeia | não existe ainda | — | 3 |
| 13 | Morfologia produtiva | regra de derivação | flexão → agente (-dor) → adjetivo (-vel, -oso) | não existe ainda | — | 3 |
| 14 | Operador inventado | operadores e quantificadores definidos no próprio prompt ("A é *zorva* de B quer dizer…") | 1 operador novo → 2 → combinados com os conhecidos | não existe ainda | usar o sentido de uma palavra conhecida em vez da definição | 1 |

## 3. Uma base de testes confiável

1. **Bancos congelados e versionados.** Cada banco é um arquivo fixo, por exemplo
   `testes/bancos/volume-v1.json`, com prompt, gabarito, chave, distratores, iscas, eixo,
   nível, semente e versão do gerador. O banco não muda quando o gerador muda (o filtro de
   dicionário já mudou os lotes uma vez). Corrigir um banco é criar a versão seguinte.
2. **Amostra.** Pelo menos 30 itens por ponto da escala, com as variantes balanceadas. Com 30
   itens, 80% de acerto tem intervalo de confiança de 63% a 90%; com 10 itens, de 49% a 94%.
3. **Repetição.** Cada item roda 3 vezes em cada configuração. Isso mede a consistência
   (teste-reteste) e quanto do resultado é sorte.
4. **Formato da resposta.** O prompt pede só que a resposta termine com "Resposta: …". Isso
   permite corrigir sem ler à mão e não dá dica. Vale medir uma vez se esse pedido muda o
   acerto.
5. **Correção automática ampliada.** Hoje alguns erros ainda são classificados à mão. Status
   novos para o corretor:
   - *cadeia incompleta*: citou um elo do meio da prova;
   - *confusão com sósia*: citou a palavra a que a isca sósia leva;
   - *não dá para saber*: necessário para o eixo 8.
6. **Executor.** Um script local, fora do site, roda um banco numa IA pela API e grava as
   respostas brutas e a correção em `testes/resultados/`.
   - A chave fica numa variável de ambiente, nunca no repositório.
   - A aba Pesquisa lê esses resultados.
   - Para modelos Claude, dá para continuar usando subagentes no Claude Code.
7. **Estatística.**
   - intervalo de confiança de 95% de Wilson (já usado);
   - TRI, pelo modelo de Rasch: põe a dificuldade de cada item e a habilidade de cada modelo
     na mesma régua; ela vira a escala oficial;
   - confiabilidade de cada eixo (KR-20): abaixo de 0,7, o eixo precisa de mais itens;
   - fator G: correlação entre eixos e análise de fatores.
8. **Diversidade de modelos.** Só com modelos Claude, o tamanho do modelo e o esforço dominam
   tudo. Para testar o fator G de verdade, entram modelos de outros fabricantes e modelos
   abertos. Uma família de modelos abertos de vários tamanhos (de menos de 1B a 70B
   parâmetros) também mostra se a capacidade cresce aos poucos ou aos saltos com a escala, a
   pergunta em aberto da [hipótese](HIPOTESE.md).
9. **Contaminação.** Um banco publicado pode acabar no treino de modelos futuros. Por isso
   guardamos um banco reservado, que não vai para o repositório, e sempre conferimos os
   resultados com sementes novas.

## 4. Roteiro

| Etapa | O que entra | Objetivo |
|---|---|---|
| Banco v1 | eixos que já mostraram escala: morfologia, volume, sósias e profundidade; mais vocabulário (real × inventado) | 1 e 2 |
| Banco v2 | gerador novo: operadores, operador inventado, indeterminação e ramificação | 1 e 2 |
| Escala | banco v1 numa família de modelos abertos de vários tamanhos | 1 e 4 |
| Banco v3 | descoberta de regra, conceito novo, morfologia produtiva e conclusão aberta | 3 |
| Régua | TRI com todos os bancos: escala oficial e aba Benchmarks | 2 e 4 |
| Diagnóstico | ponto de quebra e erro típico de cada modelo em cada eixo, com exemplos reais | 5 |

## 5. Custo

- **Tamanho:** 5 eixos × 4 pontos × 30 itens = 600 itens. Com 8 configurações e 3 repetições,
  são 14.400 respostas.
- **Subagentes do Claude Code:** cada resposta custa cerca de 35 mil tokens, quase todos das
  instruções do próprio Claude Code. Para um banco desse tamanho é caro demais.
- **API direta:** com um prompt curto, cada resposta custa de 1 a 5 mil tokens.
- **Caminho sugerido:**
  - começar com 2 a 4 configurações e 1 repetição;
  - medir uma vez se mandar 10 desafios por chamada muda o resultado: se não mudar, o custo
    cai dez vezes.
