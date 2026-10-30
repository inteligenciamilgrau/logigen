// LOGIGEN - DADOS DA PESQUISA
// O resultado de cada desafio em cada configuração testada. Os diários com o método,
// as respostas e as conclusões estão em testes/. Para uma bateria nova, basta acrescentar
// os resultados aqui: a aba Pesquisa refaz os gráficos sozinha.
//
// Status nas baterias de morfologia:  certo · ambigua · flexao
// Status nas baterias de lógica:      certo · hesitou · confusao · cortada
// null = a configuração não rodou esse desafio.

const CONFIGURACOES = {
    'haiku-low':  { nome: 'Haiku 5.5 low',  cor: '#7dd3fc' },
    'haiku-max':  { nome: 'Haiku 5.5 max',  cor: '#0284c7' },
    'sonnet-low': { nome: 'Sonnet 5.5 low', cor: '#c4b5fd' },
    'sonnet-max': { nome: 'Sonnet 5.5 max', cor: '#7c3aed' },
    'opus-low':   { nome: 'Opus 5.5 low',   cor: '#fcd34d' },
    'opus-max':   { nome: 'Opus 5.5 max',   cor: '#d97706' },
    'fable-low':  { nome: 'Fable 5.1 low',  cor: '#6ee7b7' },
    'fable-max':  { nome: 'Fable 5.1 max',  cor: '#059669' }
};

const BATERIAS = {
    // Baterias 2 a 5: os mesmos 10 desafios (níveis 1 a 3) em oito configurações
    morfologia: {
        titulo: 'Baterias 2 a 5 · Morfologia',
        diario: 'testes/fable-5.1.md',
        desafios: [
            { id: 'B1',  nivel: 1, tipo: 'genero',       gabarito: 'doglepento' },
            { id: 'B2',  nivel: 1, tipo: 'gerundio',     gabarito: 'globrepando' },
            { id: 'B3',  nivel: 1, tipo: 'verbo-plural', gabarito: 'fozimbem' },
            { id: 'B4',  nivel: 2, tipo: 'genero',       gabarito: 'zetescina' },
            { id: 'B5',  nivel: 2, tipo: 'gerundio',     gabarito: 'gladobrando' },
            { id: 'B6',  nivel: 2, tipo: 'adj-plural',   gabarito: 'plugromentos' },
            { id: 'B7',  nivel: 3, tipo: 'genero',       gabarito: 'grovradrenta' },
            { id: 'B8',  nivel: 3, tipo: 'gerundio',     gabarito: 'gredrombando' },
            { id: 'B9',  nivel: 3, tipo: 'adj-plural',   gabarito: 'vraflaventos' },
            { id: 'B10', nivel: 3, tipo: 'verbo-plural', gabarito: 'brenobem' }
        ],
        resultados: {
            'haiku-low':  ['flexao', 'flexao', 'flexao', 'certo', 'flexao', 'certo', 'flexao', 'flexao', 'flexao', 'flexao'],
            'sonnet-low': ['flexao', 'certo', 'flexao', 'flexao', 'flexao', 'certo', 'flexao', 'flexao', 'flexao', 'certo'],
            'haiku-max':  ['flexao', 'certo', 'certo', 'ambigua', 'flexao', 'certo', 'ambigua', 'certo', 'flexao', 'certo'],
            'sonnet-max': ['flexao', 'certo', 'certo', 'flexao', 'certo', 'certo', 'flexao', 'certo', 'flexao', 'certo'],
            'opus-low':   ['flexao', 'ambigua', 'certo', 'certo', 'certo', 'certo', 'flexao', 'certo', 'certo', 'certo'],
            'fable-low':  ['flexao', 'ambigua', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo'],
            'fable-max':  ['ambigua', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo'],
            'opus-max':   ['certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo']
        }
    },

    // Bateria 6: cadeia de 3 passos com 20, 100 e 300 regras.
    // A = volume puro · B = o mesmo texto com 4 iscas sósias (uma vogal de diferença)
    volume: {
        titulo: 'Bateria 6 · Volume e sósias',
        diario: ['testes/haiku-5.5-volume-e-sosias.md', 'testes/sonnet-5.5-volume-e-sosias.md'],
        desafios: ['A', 'B'].flatMap(eixo => [20, 100, 300].flatMap(regras =>
            [1, 2, 3].map(i => ({ id: `${eixo}${regras}-${i}`, eixo, regras })))),
        // Ordem: A20-1..3, A100-1..3, A300-1..3, B20-1..3, B100-1..3, B300-1..3
        resultados: {
            'haiku-low': [
                'certo', 'certo', 'certo',          'cortada', 'certo', 'certo',      'certo', 'cortada', 'certo',
                'hesitou', 'certo', 'confusao',     'certo', 'cortada', 'certo',      'confusao', 'cortada', 'certo'
            ],
            'sonnet-low': [
                'certo', 'certo', 'certo',          'certo', 'certo', 'certo',        'certo', 'certo', 'certo',
                'certo', 'certo', 'certo',          'certo', 'certo', 'certo',        'confusao', 'certo', 'confusao'
            ],
            // No max, só os desafios de 300 regras: com 20 e 100 o low já tinha acertado tudo
            'sonnet-max': [
                null, null, null,                   null, null, null,                 'certo', 'certo', 'certo',
                null, null, null,                   null, null, null,                 'certo', 'certo', 'certo'
            ]
        }
    },

    // Bateria 7: 20 regras, sósias limpas (C) contra sósias perto do português (D).
    // Mesmo texto nos dois, exceto as 4 sósias.
    contaminacao: {
        titulo: 'Bateria 7 · Contaminação',
        diario: ['testes/haiku-5.5-contaminacao.md', 'testes/sonnet-5.5-volume-e-sosias.md'],
        desafios: ['C', 'D'].flatMap(eixo => Array.from({ length: 10 }, (_, i) => ({ id: `${eixo}-${i + 1}`, eixo, par: i + 1 }))),
        // Ordem: C-1..C-10, D-1..D-10
        resultados: {
            'haiku-low': [
                'certo', 'confusao', 'certo', 'hesitou', 'certo', 'hesitou', 'certo', 'cortada', 'certo', 'certo',
                'confusao', 'certo', 'certo', 'certo', 'certo', 'certo', 'hesitou', 'confusao', 'certo', 'confusao'
            ],
            'sonnet-low': [
                'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo',
                'hesitou', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo', 'certo'
            ]
        },
        // Pares de sósias somando as baterias 6 e 7: com uma palavra perto do português × limpos
        pares: {
            'haiku-low':  { perto: { confusoes: 4, pares: 45 }, limpos: { confusoes: 2, pares: 100 } },
            'sonnet-low': { perto: { confusoes: 1, pares: 45 }, limpos: { confusoes: 1, pares: 100 } }
        }
    }
};

// Baterias G1 a G10 (pasta benchmark/, 30/10): placares agregados, [acertos, total], por
// configuração. Método, prompts, respostas e gabaritos em benchmark/RELATORIO-G1.md e G2.md.
// Aqui não há resultado desafio a desafio: cada número é copiado das tabelas dos relatórios.
const BATERIAS_G = {
    diario: ['benchmark/RELATORIO-G1.md', 'benchmark/RELATORIO-G2.md'],
    modelos: ['haiku-low', 'sonnet-low', 'opus-low', 'fable-low'],
    // Lógica certa (a palavra certa, em qualquer forma) em cada eixo; na morfologia, a forma exata
    teto: [
        { eixo: 'prof',  fonte: 'G1', placar: { 'haiku-low': [9, 9],   'sonnet-low': [9, 9],   'opus-low': [9, 9],   'fable-low': [9, 9] } },
        { eixo: 'vol',   fonte: 'G1', placar: { 'haiku-low': [9, 9],   'sonnet-low': [9, 9],   'opus-low': [9, 9],   'fable-low': [9, 9] } },
        { eixo: 'sos',   fonte: 'G1', placar: { 'haiku-low': [8, 9],   'sonnet-low': [9, 9],   'opus-low': [9, 9],   'fable-low': [9, 9] } },
        { eixo: 'indet', fonte: 'G1', placar: { 'haiku-low': [9, 9],   'sonnet-low': [9, 9],   'opus-low': [9, 9],   'fable-low': [9, 9] } },
        { eixo: 'duro',  fonte: 'G1', placar: { 'haiku-low': [6, 6],   'sonnet-low': [6, 6],   'opus-low': [6, 6],   'fable-low': [6, 6] } },
        { eixo: 'op',    fonte: 'G2', placar: { 'haiku-low': [12, 12], 'sonnet-low': [12, 12], 'opus-low': [12, 12], 'fable-low': [12, 12] } },
        { eixo: 'op3',   fonte: 'G3', placar: { 'haiku-low': [12, 12], 'sonnet-low': [11, 12], 'opus-low': [12, 12], 'fable-low': [12, 12] } },
        { eixo: 'ind',   fonte: 'G1', placar: { 'haiku-low': [9, 9],   'sonnet-low': [7, 9],   'opus-low': [9, 9],   'fable-low': [9, 9] } },
        // Um dos 9 itens tinha outra regra do mesmo tamanho que também explicava os exemplos
        { eixo: 'ind2',  fonte: 'H4', placar: { 'haiku-low': [9, 9],   'sonnet-low': [8, 9],   'opus-low': [8, 9],   'fable-low': [8, 9] } },
        { eixo: 'morf',  fonte: 'G1', placar: { 'haiku-low': [3, 9],   'sonnet-low': [4, 9],   'opus-low': [7, 9],   'fable-low': [9, 9] } }
    ],
    // O mesmo teste sem e com ajuda: a dica "escreva já flexionada" (H6, sem dica em 2 rodadas
    // somadas) ou um exemplo resolvido (H9, H10)
    dica: [
        { item: 'morf', fonte: 'H6', placar: {
            'haiku-low': { sem: [6, 18], com: [7, 9] }, 'sonnet-low': { sem: [7, 18], com: [5, 9] },
            'opus-low': { sem: [16, 18], com: [9, 9] }, 'fable-low': { sem: [16, 18], com: [9, 9] } } },
        { item: 'gerundio', fonte: 'H9', placar: { 'haiku-low': { sem: [0, 6], com: [6, 6] }, 'sonnet-low': { sem: [0, 6], com: [6, 6] } } },
        { item: 'plural', fonte: 'H10', placar: { 'haiku-low': { sem: [2, 6], com: [6, 6] }, 'sonnet-low': { sem: [3, 6], com: [6, 6] } } }
    ],
    // Forma exata em duas línguas. Na troca de língua a lógica acertou todos (H15 e H16): os
    // erros abaixo são de forma, ou leituras que o item permitia (H15, Opus)
    lingua: [
        { item: 'troca', fonte: 'H16', condicoes: ['en-pt', 'so-pt'], placar: {
            'haiku-low': { 'en-pt': [6, 6], 'so-pt': [5, 6] }, 'sonnet-low': { 'en-pt': [5, 6], 'so-pt': [6, 6] }, 'opus-low': { 'en-pt': [6, 6], 'so-pt': [6, 6] } } },
        { item: 'reais', fonte: 'H15', condicoes: ['en-pt', 'pt-en'], placar: {
            'haiku-low': { 'en-pt': [6, 6], 'pt-en': [4, 6] }, 'sonnet-low': { 'en-pt': [6, 6], 'pt-en': [6, 6] }, 'opus-low': { 'en-pt': [6, 6], 'pt-en': [4, 6] } } },
        { item: 'plural', fonte: 'H12 e H13', condicoes: ['en', 'pt'], placar: {
            'haiku-low': { en: [4, 4], pt: [0, 6] }, 'sonnet-low': { en: [4, 4], pt: [5, 6] }, 'opus-low': { en: [4, 4] }, 'fable-low': { en: [4, 4] } } }
    ]
};

// Antes do filtro de dicionário: % das palavras inventadas a 1 letra de uma palavra real
// (1.000 palavras de cada classe)
const PERTO_DO_PORTUGUES = [
    { classe: 'nome', pct: 23.5, exemplos: 'Clurar → curar, Junel → túnel' },
    { classe: 'substantivo', pct: 7.0, exemplos: 'meneza → Veneza, clabresto → cabresto' },
    { classe: 'verbo', pct: 4.7, exemplos: 'vatidar → validar' },
    { classe: 'adjetivo', pct: 0.5, exemplos: '"juramento", palavra real' }
];
