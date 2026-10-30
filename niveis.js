// LOGIGEN - NÍVEIS
// O esqueleto lógico de cada nível, escrito para ser conferido por gente.
// O gerador lê exatamente este texto: o que está aqui É a lógica dos desafios.
//
// Letras (sempre com número)
//   X1, X2...     personagens (nomes inventados)
//   G1, G2...     grupos (substantivos inventados)
//   A1, A2...     adjetivos inventados
//   V1, V2...     verbos inventados
//
// Linhas e a frase exata que cada uma vira
//   todo G1 é A1             "Todo G1 é A1."
//   todo G1 é V1             "Todo G1 V1."            (presente: "glovunda")
//   todo G1 é G2             "Todo G1 é um G2."
//   todo A1 é V1             "Quem é A1 V1."          (vale para A/V em qualquer combinação)
//   X1 é G1                  "O X1 é um G1."          (artigo o/a: o gênero do personagem fica escrito)
//   X1 e X2 são G1           "O X1 e a X2 são G1s."   (substantivo no plural)
//   X1 é A1 / X1 é V1        "O X1 é A1." / "O X1 V1."
//   X1 e X2 são A1 / V1      "O X1 e a X2 são A1s." / "O X1 e a X2 V1m."
//
// Perguntas: uma lacuna, sem opções. A classe da lacuna vem da linha "resposta:"
// (A = adjetivo, V = verbo) e a frase obriga a flexionar a resposta.
//   pergunta: X1 é ___?          "X1 é ___?"          A: no gênero de X1 · V: presente (ele)
//   pergunta: X1 e X2 são ___?   "X1 e X2 são ___?"   A: no plural        · V: "X1 e X2 ___?", presente (eles)
//   pergunta: X1 está ___?       "X1 está ___?"       só V: gerúndio
//   pergunta: X1 e X2 estão ___? "X1 e X2 estão ___?" só V: gerúndio
//                                Nada de adjetivo dedutível para o personagem: "está"
//                                também aceita adjetivo ("A Marina está zedantosa"), e a
//                                lacuna ficaria com duas respostas. O solucionador recusa.
//
//   resposta: A1             o que você espera; o solucionador confere e recusa o
//                            esqueleto se A1 não for o ÚNICO adjetivo (ou verbo)
//                            dedutível para os personagens perguntados
//   # ...                    comentário (não vai para o desafio)
//
// Operadores (níveis 4 e 5), só com grupos (G) e personagens (X):
//   nenhum G1 é G2           "Nenhum G1 é um G2."
//   todo G1 é G2 ou G3       "Todo G1 é um G2 ou um G3."   (pelo menos um dos dois)
//   X1 não é G1              "O X1 não é um G1."
//   pergunta: X1 é G2?       "O X1 é um G2?"               pergunta de sim ou não, sem lacuna
//   resposta: sim | não | não dá para saber
//                            um verificador testa todas as combinações de verdade dos grupos
//                            e recusa o esqueleto se as frases não garantirem a resposta dita
//   instrucao                frase que vai no prompt dizendo como responder (pt e en)
//
// Palavras novas (nível 6):
//   gênero: X1 f, X2 m, G1 f fixa o gênero de personagens e grupos (só em português)
//   conjugação: V1 -ir       fixa a conjugação de um verbo (-ar, -er ou -ir)
//   glossario: true          (no nível) cada desafio traz um glossário com o infinitivo de
//                            cada verbo e a forma básica de cada adjetivo, em ordem sorteada:
//                            "pavobe" não diz se o verbo é pavober ou pavobir; o glossário diz
//
// Indução (nível 7): no lugar das regras, exemplos. A regra fica escondida.
//   traços: A1 A2 A3         os adjetivos que descrevem cada personagem
//   exemplos: 6              quantos personagens de exemplo, cada um com todos os traços:
//                            "A X1 é A1, não é A2 e é A3. A X1 é uma G1." (ou "não é uma G1")
//   regra: G1 = A1 e não A2  quem é G1, com "e", "ou", "não" e parênteses
//                            Depois dos exemplos vem um personagem novo: "O X7 ... O X7 é um G1?"
//                            A resposta é sorteada (sim ou não, meio a meio), os exemplos também,
//                            e o verificador só aceita o desafio se TODAS as regras plausíveis que
//                            explicam os exemplos derem a mesma resposta: as do mesmo tamanho da
//                            escondida ou menores, "só um dos dois" e "pelo menos 2 de 3". Nenhuma
//                            regra menor que a escondida pode explicar os exemplos (a variante
//                            "dois traços" usa mesmo dois)
//
// A resposta precisa sair do texto, na lógica e na gramática. Pelo presente
// "pavobe" não dá para saber se o verbo é pavober ou pavobir, então nos desafios
// de gerúndio todos os verbos são da 1ª conjugação ("glovunda" -> "glovundando").
//
// A forma pedida nunca é a que já aparece no texto: na concordância com um personagem
// só ("X1 é ___?" com adjetivo), ele recebe o gênero oposto ao da forma escrita na
// regra ("Toda ronhilha é vesurdenta" -> "O Crodel é vesurdento"). Nas outras perguntas
// (plural, gerúndio) a forma pedida já é sempre diferente.
//
// No desafio, as regras aparecem embaralhadas e os fatos vêm depois delas.
// Cada nível pode ter variantes; cada desafio sorteia uma delas.
// "passos" é quantas regras a resposta exige; o solucionador confere em todas
// as variantes, para nenhum esqueleto ter atalho.
// "armadilhas" é quantas regras enganam quem as lê ao contrário (a recíproca:
// "todo G3 é G1" não quer dizer "todo G1 é G3"). O solucionador testa cada regra
// lida também ao contrário: se outra palavra passar a caber na lacuna, a regra é
// uma armadilha. O número achado tem que ser exatamente o declarado.

const NIVEIS = {
    1: {
        nome: 'Dedução direta',
        descricao: 'Duas regras e um fato. O fato liga o personagem a uma das regras, que dá a resposta em um passo; a outra regra é distração. A lacuna não tem opções e a resposta precisa vir flexionada.',
        passos: 1,
        armadilhas: 0,
        variantes: {
            'adjetivo · gênero': `
                todo G1 é A1      # leva à resposta
                todo G2 é A2      # distração
                X1 é G1
                pergunta: X1 é ___?
                resposta: A1
            `,
            'adjetivo · plural': `
                todo G1 é A1      # leva à resposta
                todo G2 é A2      # distração
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: A1
            `,
            'verbo · gerúndio': `
                todo G1 é V1      # leva à resposta
                todo G2 é V2      # distração
                X1 é G1
                pergunta: X1 está ___?
                resposta: V1
            `,
            'verbo · plural': `
                todo G1 é V1      # leva à resposta
                todo G2 é V2      # distração
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: V1
            `
        }
    },
    2: {
        nome: 'Cadeia de dois passos',
        descricao: 'Duas regras em cadeia levam à resposta; outra cadeia igual serve de distração. O elo do meio muda conforme a variante: um grupo, um verbo ou um adjetivo.',
        passos: 2,
        armadilhas: 0,
        variantes: {
            'adjetivo · gênero': `
                todo G1 é G2      # passo 1 (elo: grupo)
                todo G2 é A1      # passo 2
                todo G3 é G4      # distração
                todo G4 é A2      # distração
                X1 é G1
                pergunta: X1 é ___?
                resposta: A1
            `,
            'adjetivo · plural': `
                todo G1 é V1      # passo 1 (elo: verbo)
                todo V1 é A1      # passo 2
                todo G2 é V2      # distração
                todo V2 é A2      # distração
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: A1
            `,
            'verbo · gerúndio': `
                todo G1 é G2      # passo 1 (elo: grupo; com adjetivo, "está ___" teria duas respostas)
                todo G2 é V1      # passo 2
                todo G3 é G4      # distração
                todo G4 é V2      # distração
                X1 é G1
                pergunta: X1 está ___?
                resposta: V1
            `,
            'verbo · plural': `
                todo G1 é A1      # passo 1 (elo: adjetivo; "X1 e X2 ___?" não aceita adjetivo)
                todo A1 é V1      # passo 2
                todo G2 é A2      # distração
                todo A2 é V2      # distração
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: V1
            `
        }
    },
    3: {
        nome: 'Armadilha da recíproca',
        descricao: 'Cadeia de dois passos com uma regra que engana quem a lê ao contrário: "todo trovelo é um jaflecho" não quer dizer que todo jaflecho seja trovelo. A armadilha muda de lugar conforme a variante.',
        passos: 2,
        armadilhas: 1,
        variantes: {
            'adjetivo · gênero': `
                todo G1 é G2      # passo 1
                todo G2 é A1      # passo 2
                todo G3 é G1      # armadilha: ao contrário, X1 viraria G3
                todo G3 é A2      # o que a armadilha daria
                X1 é G1
                pergunta: X1 é ___?
                resposta: A1
            `,
            'adjetivo · plural': `
                todo G1 é V1      # passo 1
                todo V1 é A1      # passo 2
                todo G2 é V1      # armadilha: eles fazem V1, mas isso não os torna G2
                todo G2 é A2      # o que a armadilha daria
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: A1
            `,
            'verbo · gerúndio': `
                todo G1 é G2      # passo 1 (elo: grupo; com adjetivo, "está ___" teria duas respostas)
                todo G2 é V1      # passo 2
                todo G3 é G2      # armadilha: ao contrário, X1 viraria G3
                todo G3 é V2      # o que a armadilha daria
                X1 é G1
                pergunta: X1 está ___?
                resposta: V1
            `,
            'verbo · plural': `
                todo G1 é A1      # passo 1
                todo A1 é V1      # passo 2
                todo G2 é A1      # armadilha: eles são A1, mas isso não os torna G2
                todo G2 é V2      # o que a armadilha daria
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: V1
            `
        }
    },
    4: {
        nome: 'Negação e falácias',
        descricao: 'Regras com "nenhum" e fatos negativos ("O X1 não é um G1"). A pergunta é de sim ou não, e às vezes a resposta certa é "não dá para saber": é ali que moram as duas falácias clássicas, afirmar o consequente e negar o antecedente.',
        instrucao: {
            pt: 'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem.',
            en: 'Answer only "yes", "no" or "can\'t tell", considering only what the sentences guarantee.'
        },
        variantes: {
            'cadeia · sim': `
                todo G1 é G2      # passo 1
                todo G2 é G3      # passo 2
                todo G4 é G5      # distração
                X1 é G1
                X2 é G4
                pergunta: X1 é G3?
                resposta: sim
            `,
            'negação · não': `
                todo G1 é G2      # passo 1
                nenhum G2 é G3    # passo 2: quem é G2 não é G3
                todo G4 é G5      # distração
                X1 é G1
                X2 é G4
                pergunta: X1 é G3?
                resposta: não
            `,
            'contraposição · não': `
                todo G1 é G2      # passo 1
                todo G2 é G3      # passo 2
                todo G4 é G5      # distração
                X1 não é G3       # se fosse G1, seria G3
                X2 é G4
                pergunta: X1 é G1?
                resposta: não
            `,
            'afirmar o consequente · não dá': `
                todo G1 é G2      # a regra vale num sentido só
                todo G3 é G2      # outro caminho até G2
                todo G4 é G5      # distração
                X1 é G2           # ser G2 não diz de onde veio
                X2 é G4
                pergunta: X1 é G1?
                resposta: não dá para saber
            `,
            'negar o antecedente · não dá': `
                todo G1 é G2      # a regra não diz nada de quem não é G1
                todo G4 é G5      # distração
                X1 não é G1
                X2 é G4
                pergunta: X1 é G2?
                resposta: não dá para saber
            `
        }
    },
    5: {
        nome: 'Prova por casos',
        descricao: 'Regras com "ou": "Todo G1 é um G2 ou um G3". Para responder, é preciso examinar os dois casos, ou eliminar um deles com um fato negativo. Quando só um dos casos leva à conclusão, a resposta é "não dá para saber".',
        instrucao: {
            pt: 'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem. Em "Todo A é um B ou um C", cada A é pelo menos um dos dois.',
            en: 'Answer only "yes", "no" or "can\'t tell", considering only what the sentences guarantee. In "Every A is a B or a C", each A is at least one of the two.'
        },
        variantes: {
            'casos · sim': `
                todo G1 é G2 ou G3   # passo 1: dois casos
                todo G2 é G4         # caso G2
                todo G3 é G4         # caso G3
                todo G5 é G6         # distração
                X1 é G1
                X2 é G5
                pergunta: X1 é G4?
                resposta: sim
            `,
            'silogismo disjuntivo · sim': `
                todo G1 é G2 ou G3   # passo 1: dois casos
                todo G3 é G4         # passo 2
                todo G5 é G6         # distração
                X1 é G1
                X1 não é G2          # elimina um dos casos
                X2 é G5
                pergunta: X1 é G4?
                resposta: sim
            `,
            'casos + nenhum · não': `
                todo G1 é G2 ou G3   # passo 1: dois casos
                todo G2 é G4         # caso G2
                todo G3 é G4         # caso G3
                nenhum G4 é G5       # quem é G4 não é G5
                todo G6 é G7         # distração
                X1 é G1
                X2 é G6
                pergunta: X1 é G5?
                resposta: não
            `,
            'ramo aberto · não dá': `
                todo G1 é G2 ou G3   # passo 1: dois casos
                todo G2 é G4         # só o caso G2 leva a G4
                todo G5 é G6         # distração
                X1 é G1
                X2 é G5
                pergunta: X1 é G4?
                resposta: não dá para saber
            `
        }
    },
    6: {
        nome: 'Palavras novas (wug)',
        descricao: 'O "teste do wug": aplicar a regra da língua a uma palavra que nunca existiu. Um glossário dá o infinitivo de cada verbo e a forma básica de cada adjetivo, e o desafio pede o gerúndio e o plural de verbos em -er e -ir, ou a concordância de um grupo cujo substantivo tem outro gênero que o das pessoas.',
        passos: 2,
        armadilhas: 0,
        glossario: true,
        variantes: {
            'gerúndio · -er': `
                todo G1 é G2      # passo 1
                todo G2 é V1      # passo 2
                todo G3 é G4      # distração
                todo G4 é V2      # distração
                X1 é G1
                conjugação: V1 -er, V2 -ir
                pergunta: X1 está ___?
                resposta: V1
            `,
            'gerúndio · -ir': `
                todo G1 é G2      # passo 1
                todo G2 é V1      # passo 2
                todo G3 é G4      # distração
                todo G4 é V2      # distração
                X1 é G1
                conjugação: V1 -ir, V2 -er
                pergunta: X1 está ___?
                resposta: V1
            `,
            'plural · -e': `
                todo G1 é G2      # passo 1
                todo G2 é V1      # passo 2: o presente termina em -e, o plural em -em
                todo G3 é G4      # distração
                todo G4 é V2      # distração
                X1 e X2 são G1
                conjugação: V1 -er, V2 -ar
                pergunta: X1 e X2 são ___?
                resposta: V1
            `,
            'grupo misto · substantivo feminino': `
                todo G1 é G2      # passo 1
                todo G2 é A1      # passo 2: a regra escreve A1 no masculino singular
                todo G3 é G4      # distração
                todo G4 é A2      # distração
                X1 e X2 são G1    # G1 é feminino; as pessoas pedem o masculino
                gênero: X1 f, X2 m, G1 f, G2 m
                pergunta: X1 e X2 são ___?
                resposta: A1
            `,
            'grupo feminino · substantivo masculino': `
                todo G1 é G2      # passo 1
                todo G2 é A1      # passo 2: a regra escreve A1 no feminino singular
                todo G3 é G4      # distração
                todo G4 é A2      # distração
                X1 e X2 são G1    # G1 é masculino; as pessoas pedem o feminino
                gênero: X1 f, X2 f, G1 m, G2 f
                pergunta: X1 e X2 são ___?
                resposta: A1
            `
        }
    },
    7: {
        nome: 'Indução',
        descricao: 'No lugar das regras, exemplos: cada personagem tem alguns traços e é ou não é de um grupo. É preciso descobrir a regra escondida (um traço, dois traços com "e" ou "ou", com negação) e aplicá-la a alguém novo. O verificador só aceita o desafio se todas as regras plausíveis que explicam os exemplos derem a mesma resposta.',
        instrucao: {
            pt: 'Cada desafio mostra quem é e quem não é de um grupo. Descubra a regra mais simples que separa os dois e responda só "sim" ou "não".',
            en: 'Each challenge shows who is and who is not in a group. Find the simplest rule that separates them and answer only "yes" or "no".'
        },
        variantes: {
            'um traço': `
                traços: A1 A2 A3
                exemplos: 5
                regra: G1 = A1
            `,
            'um traço negado': `
                traços: A1 A2 A3
                exemplos: 5
                regra: G1 = não A1
            `,
            'dois traços · e': `
                traços: A1 A2 A3
                exemplos: 6
                regra: G1 = A1 e A2
            `,
            'dois traços · ou': `
                traços: A1 A2 A3
                exemplos: 6
                regra: G1 = A1 ou A2
            `,
            'e com negação': `
                traços: A1 A2 A3
                exemplos: 6
                regra: G1 = A1 e não A2
            `,
            'três traços': `
                traços: A1 A2 A3 A4
                exemplos: 10
                regra: G1 = A1 e (A2 ou A3)
            `
        }
    }
};
