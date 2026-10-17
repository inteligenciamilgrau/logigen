// Dados padrão do LogiGen: templates de puzzle e dicionários de palavras.
// Este arquivo pode ser substituído pelo "Exportar dados" da aba Dados.
const DADOS_PADRAO = {
  "templates": [
    {
      "id": "tpl_1777682770625",
      "name": "Novo Experimento",
      "premises": [
        "Toda vez que um {S1} {V1} ele fica {A1}, se não fica {A2}",
        "{N1} é um {S1} e fez {V1}."
      ],
      "question": "Como {N1} ficou?",
      "answer": "{A1}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-3",
      "name": "Dupla Condição + Localização",
      "premises": [
        "Quando o {S1} sai para {V1}, ele espera que {L1} será possível {V2}.",
        "{L1} só é possível {V2} se {N1} não falhar.",
        "Se {N1} falhou."
      ],
      "question": "O que houve {L1}?",
      "answer": "{L1} não {V2}",
      "levelAdjustment": 1
    },
    {
      "id": "gen-lvl-2",
      "name": "Transição de Identidade",
      "premises": [
        "Se um {S1} {V1}, imediatamente ele {V2}.",
        "Tudo que {V2} passa a ser conhecido como o grande {N2}.",
        "{N1} é um {S1} que {V1} ontem."
      ],
      "question": "Qual é o novo nome de {N1}?",
      "answer": "{N2}",
      "levelAdjustment": 0
    },
    {
      "id": "c202f3b8-a384-405f-9e0f-9fa72778a186",
      "name": "Segurança de Dados Lvl 3",
      "premises": [
        "Se a criptografia {K1} falhar, o backup {B1} é iniciado.",
        "O backup {B1} inicia apenas se o servidor {S1} não for reiniciado.",
        "Se o firewall {F1} detectar intrusão, o servidor {S1} é reiniciado."
      ],
      "question": "O backup {B1} será iniciado se o firewall {F1} detectar intrusão?",
      "answer": "Não",
      "levelAdjustment": 2
    },
    {
      "id": "gen-lvl-1",
      "name": "Silogismo Básico Primal",
      "premises": [
        "Toda vez que o {S1} {V1}, ele fica {A1}.",
        "{N1} é um {S1} e acabou de {V1}."
      ],
      "question": "Qual é o estado atual de {N1}?",
      "answer": "{A1}",
      "levelAdjustment": 2
    },
    {
      "id": "gen-lvl-4",
      "name": "Cadeia de Estados Negativa",
      "premises": [
        "Todo {S1} que não {V1} fica {A1}, mas se {V1} fica {A2}.",
        "Aqueles que são {A2} sempre vão para {L1}.",
        "No entanto, se um {S1} for {A2} e {L1}, ele começa a {V2}.",
        "{N1} é um {S1} que hoje {V1}."
      ],
      "question": "Sendo assim, o que {N1} começará a fazer?",
      "answer": "{V2}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-5-cidadela",
      "name": "Protocolo de Segurança da Cidadela (Sobrescrita de Sinal)",
      "premises": [
        "Para entrar no {L1}, o {N1} passa por uma triagem de frequência sonora.",
        "Se a frequência for {A1}, o sensor emite automaticamente o sinal {V1}.",
        "Quando o sinal é {V1}, a porta {L2} se abre; mas se o sinal for alterado para {V2}, a porta {L3} é que se abre.",
        "{N1} emitiu a frequência {A1}, porém uma interferência não prevista converteu o sinal resultante em {V2}."
      ],
      "question": "Em qual porta o {N1} deve se posicionar para entrar?",
      "answer": "{L3}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-5",
      "name": "Estados Transitórios Ramificados",
      "premises": [
        "Para chegar em {L1}, um {S1} deve primeiro garantir estado de {A1}.",
        "Tornar-se {A1} exige que o alvo {V1} e também consiga {V2}.",
        "Se ele conseguir {V1} mas falhar na execução do {V2}, ele em vez disso fica {A2} e resvala para {L2}.",
        "{N1} é um heroico {S1} que realizou um espetacular {V1}.",
        "Infelizmente os testes mostram que {N1} não conseguiu {V2}."
      ],
      "question": "Portanto, qual é o triste destino de {N1}?",
      "answer": "{L2}",
      "levelAdjustment": 0
    },
    {
      "id": "db10f9ae-d04a-4dfd-b5ea-b8f49eee1be2",
      "name": "Módulo Causal Lvl 3 - Grade Energética",
      "premises": [
        "Se a bateria {B1} descarregar, o gerador {G1} deve ser ativado.",
        "O gerador {G1} só é ativado logo em seguida ao travamento do relé {L1}.",
        "Se o cabo {C1} não for conectado, o relé {L1} trava."
      ],
      "question": "O gerador {G1} será ativado se o cabo {C1} falhar?",
      "answer": "Sim",
      "levelAdjustment": 3
    },
    {
      "id": "real-l4-e899",
      "name": "O Enigma do Fluxo Termico",
      "premises": [
        "Se a temperatura {T1} sobe, o sensor {S1} ativa.",
        "O resfriamento {R1} inicia apenas se o sensor {S1} ativar.",
        "A ventoinha {V1} gira se o resfriamento {R1} iniciar.",
        "O alarme {A1} nao toca se a ventoinha {V1} girar.",
        "Em seguida, se o alarme {A1} tocar, o sistema {S2} desliga."
      ],
      "question": "O que acontece com o sistema {S2} se a temperatura {T1} subir?",
      "answer": "O sistema {S2} permanece ligado (pois o alarme nao toca)",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-9",
      "name": "Anomalia Cíclica Inversa",
      "premises": [
        "Sempre que {S1} faz {V1}, o ar cheira a {A1}.",
        "Zonas com cheiro de {A1} jogam moradores para {L1}.",
        "Em {L1}, o gigante {S2} acorda e resolve {V2}.",
        "Quem executa {V2} reverte tudo de {L1} de volta para {L2}.",
        "{N1} é um {S1} que acabou de fazer {V1}.",
        "{N2} é um nobre {S3} que estava dormindo na região alcançada pela anomalia."
      ],
      "question": "No que {N2} finalmente irá transfigurar-se?",
      "answer": "{A2}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-7",
      "name": "Efeito Borboleta Estendido",
      "premises": [
        "Qualquer {S1} que seja {A1} e comece a {V1} vai chamar a atenção de um {S2}.",
        "Um {S2} ao ser chamado se dirige para {L1}.",
        "Se o local {L1} for ocupado por um {S2}, o ecossistema dita que todos os {S3} ali presentes tentem {V2}.",
        "{N1} é um irresponsável {S1} que já era {A1} e acaba de realizar {V1}.",
        "{N2} é só da pacata classe {S3} e estava em {L1}."
      ],
      "question": "Em qual estado lastimável {N2} vai terminar?",
      "answer": "{A2}",
      "levelAdjustment": 0
    },
    {
      "id": "00e68cde-2e7b-418d-a81a-98806580d4f2",
      "name": "Módulo Causal Lvl 3 - Reação em Cadeia",
      "premises": [
        "Se o núcleo {N1} superaquecer, o sensor {L1} dispara logo em seguida.",
        "O sensor {L1} dispara se o resfriador {R1} não for acionado.",
        "O resfriador {R1} é acionado apenas se a energia {E1} estiver estável.",
        "A energia {E1} é estável se o disjuntor {D1} estiver ligado."
      ],
      "question": "O núcleo {N1} superaquecerá se o disjuntor {D1} for desligado?",
      "answer": "Sim",
      "levelAdjustment": 2
    },
    {
      "id": "24cc6401-14a3-4c44-966b-02598559b5fe",
      "name": "Protocolo Bio-Lógico Lvl 3",
      "premises": [
        "Se o {S1} {V1}, o {S2} deve ser {A1}",
        "O {S2} fica {A1} apenas se o {S3} não estiver {A2}.",
        "Se o {S4} {V3}, o {S3} fica {A2}"
      ],
      "question": "O {S2} ficará {A1} se o {S4} {V3}?",
      "answer": "Não",
      "levelAdjustment": 0
    },
    {
      "id": "aaf786b4-aaef-4767-8fb6-0c35add63969",
      "name": "Protocolo de Segurança Nível 3 - Deep Logic",
      "premises": [
        "Se o firewall {F1} falhar, o invasor {N2} acessa o terminal {T1}.",
        "O invasor {N2} acessa o terminal {T1} logo em seguida ao erro do log {L2}.",
        "O erro do log {L2} ocorre se a chave {K1} não for validada.",
        "A chave {K1} é validada se o token {S1} estiver ativo."
      ],
      "question": "O firewall {F1} falhará se o token {S1} estiver inativo?",
      "answer": "Sim",
      "levelAdjustment": 1
    },
    {
      "id": "gen-lvl-6",
      "name": "Ruído Multiespécies Excludente",
      "premises": [
        "Existem duas fações: {S1} e {S2}.",
        "Os {S1}s que {V1} se tornam automaticamente {A1}, a menos que haja um {S2} perto bloqueando.",
        "Se houver qualquer {S2} com menos de dois passos, o referido {S1} não consegue ficar {A1} e é forçado a {V2}.",
        "Tudo que começa a {V2} se transporta de imediato para {L1}.",
        "{N1} é um da facção {S1} e começou a {V1} há poucos segundos.",
        "{N2} é um rude soldado da {S2} e está colado em {N1}."
      ],
      "question": "Em qual reino {N1} irá acordar?",
      "answer": "{L1}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-5-manual",
      "name": "O Enigma do Mensageiro",
      "premises": [
        "O mensageiro {N1} deve entregar {S1} em {L1} ou será {A1}.",
        "Se {N1} for {A1}, ele deve procurar {S2} para {V1}.",
        "Toda vez que alguém {V1} com um {S2}, o resultado é a obtenção de {A2}.",
        "Quem possui {A2} é automaticamente levado para {L2}.",
        "Se {L2} for alcançado por um mensageiro, a missão é considerada {A3}.",
        "{N1} falhou em entregar {S1} e por isso já se encontra no estado {A1}."
      ],
      "question": "Qual o status final da missão de {N1}?",
      "answer": "{A3}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-10",
      "name": "Grafo Causal Mestre",
      "premises": [
        "Se {S1} faz {V1} gera {A1}.",
        "Se {S2} faz {V2} gera {A2}.",
        "Se {A1} e {A2} colidem fundem em {A3}.",
        "Quem faz {V3} deve estar em {A3} e ganha título {N3}.",
        "{N1} herdou {S1} e fez {V1}.",
        "{N2} herdou {S2} e fez {V2}.",
        "{N1} e {N2} se chocaram."
      ],
      "question": "Qual título será concedido?",
      "answer": "{N3}",
      "levelAdjustment": 0
    },
    {
      "id": "gen-lvl-8",
      "name": "Identidade Por Exclusão Tardia",
      "premises": [
        "{S1} ganham nova vida quando {S2} e {S3} entram em guerra em {L1}.",
        "Quando a guerra cessa, todo {S1} mais antigo deve {V1} ou se refugiar em {L2}.",
        "Quem decide {V1} e tem marcação {A1} sofre mutação para {A2}.",
        "{N2} é o nome místico de quem fica {A2}.",
        "{N1} é um antigo {S1} com marcação {A1}.",
        "A guerra em {L1} entre {S2} e {S3} acabou de parar.",
        "{N1} nunca se refugiaria em {L2}."
      ],
      "question": "Qual a nova identidade de {N1}?",
      "answer": "{N2}",
      "levelAdjustment": 0
    }
  ],
  "dicionario": {
    "ficticio": {
      "nouns": [
        "Polivature",
        "Pricolatus",
        "Gromulon",
        "Xylophig",
        "Dratini",
        "Morbalt",
        "Frelimo",
        "Quibble",
        "Zarplan"
      ],
      "verbs": [
        "glarinha",
        "mirlita",
        "frunfa",
        "zazula",
        "brolha",
        "cromita",
        "blangue",
        "vlora",
        "tropisca"
      ],
      "adjs": [
        "Vultuoso",
        "Fladim",
        "Grugulento",
        "Crispado",
        "Pluvitante",
        "Treficado",
        "Sornento",
        "Lúmbido"
      ],
      "names": [
        "Tibúrlio",
        "Gortrudes",
        "Astromildo",
        "Valdomarco",
        "Zunaide",
        "Krelm",
        "Jorla",
        "Mingu",
        "Blorx"
      ],
      "locs": [
        "no Estrombo",
        "na Fenda",
        "na Orla de Vrix",
        "em Plunio",
        "no Setor Mumbado",
        "na Zona Lúmbida"
      ]
    },
    "real": {
      "nouns": [
        "Guerreiro",
        "Mercador",
        "Alquimista",
        "Navegador",
        "Ferreiro",
        "Curandeiro",
        "Explorador",
        "Monge",
        "Caçador"
      ],
      "verbs": [
        "meditar",
        "forjar",
        "navegar",
        "caçar",
        "negociar",
        "curar",
        "escalar",
        "decifrar",
        "cultivar"
      ],
      "adjs": [
        "Corajoso",
        "Sábio",
        "Ágil",
        "Forte",
        "Astuto",
        "Paciente",
        "Feroz",
        "Sereno"
      ],
      "names": [
        "Ricardo",
        "Helena",
        "Eduardo",
        "Beatriz",
        "Marcos",
        "Sofia",
        "Pedro",
        "Ana",
        "Lucas"
      ],
      "locs": [
        "no Vale",
        "na Floresta",
        "na Montanha",
        "em Lisboa",
        "no Porto",
        "na Caverna"
      ]
    }
  }
};
