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
//
//   resposta: A1             o que você espera; o solucionador confere e recusa o
//                            esqueleto se A1 não for o ÚNICO adjetivo (ou verbo)
//                            dedutível para os personagens perguntados
//   # ...                    comentário (não vai para o desafio)
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
                todo G1 é A1      # passo 1 (elo: adjetivo)
                todo A1 é V1      # passo 2
                todo G2 é A2      # distração
                todo A2 é V2      # distração
                X1 é G1
                pergunta: X1 está ___?
                resposta: V1
            `,
            'verbo · plural': `
                todo G1 é G2      # passo 1 (elo: grupo)
                todo G2 é V1      # passo 2
                todo G3 é G4      # distração
                todo G4 é V2      # distração
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
                todo G1 é A1      # passo 1
                todo A1 é V1      # passo 2
                todo G2 é A1      # armadilha: X1 é A1, mas isso não o torna G2
                todo G2 é V2      # o que a armadilha daria
                X1 é G1
                pergunta: X1 está ___?
                resposta: V1
            `,
            'verbo · plural': `
                todo G1 é G2      # passo 1
                todo G2 é V1      # passo 2
                todo G3 é G2      # armadilha: ao contrário, eles virariam G3
                todo G3 é V2      # o que a armadilha daria
                X1 e X2 são G1
                pergunta: X1 e X2 são ___?
                resposta: V1
            `
        }
    }
};
