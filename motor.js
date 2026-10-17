// LOGIGEN - MOTOR DE DIFICULDADE
// -------------------------------------------------
// Calcula a carga cognitiva de um puzzle, mapeia os elos entre variáveis
// e determina o nível de dificuldade (1-20).
// Centralize aqui qualquer alteração na régua de dificuldade.

const LEVEL_NAMES = {
    1: 'Básico', 2: 'Interm.', 3: 'Dupla Condição', 4: 'Inversores', 5: 'Ramificação',
    6: 'Multi-Excludente', 7: 'Efeito Borboleta', 8: 'Lógica Excludente Tardia', 9: 'Anomalia Cíclica e Ruído', 10: 'Causalidade Divina de Matriz',
    11: 'Distorção Quântica', 12: 'Labirinto Abissal', 13: 'Sobreposição 3D', 14: 'Grafo Oculto Inverso', 15: 'Nó Oculto Recíproco',
    16: 'Teia Fractal de Tormenta', 17: 'Retrocausalidade Sombria', 18: 'Espiral Infinita Densa', 19: 'Colapso Assintótico Mortal', 20: 'A Cegueira Divina Sigma'
};

// Palavras que dificultam a leitura. Os lookarounds fazem o papel do \b,
// que no JavaScript não reconhece letras acentuadas (o "ã" de "não").
const HARD_WORDS = /(?<![\p{L}\p{N}_])(não|nem|exceto|falha|apenas)(?![\p{L}\p{N}_])/giu;

const Motor = {
    // Destrincha o puzzle e calcula o score.
    calculateScore(premises, question, answer) {
        const allText = premises.join(' ') + ' ' + question + ' ' + answer;
        const uniqueVars = [...new Set([...allText.matchAll(/\{([A-Z]\d+)\}/g)].map(m => m[1]))];

        // Mapeamento de Pontes/Elos: onde cada variável aparece
        const bridgeVars = [];
        const varCounts = {};
        const bridgeMap = {};

        for (const v of uniqueVars) {
            const tag = `{${v}}`;
            const places = [];
            premises.forEach((p, i) => { if (p.includes(tag)) places.push(`Regra ${i + 1}`); });
            if (question.includes(tag)) places.push('Pergunta (Q)');
            if (answer.includes(tag)) places.push('Resposta (Ans)');

            varCounts[v] = places.length;
            bridgeMap[v] = places;
            if (places.length > 1) bridgeVars.push(v);
        }

        // Carga Cognitiva Oculta
        const hardWords = allText.match(HARD_WORDS) || [];
        let cogLoad = hardWords.length * 1.5;
        if (allText.toLowerCase().includes('em seguida')) cogLoad += 3.5;

        // FÓRMULA MESTRE: Premissas 1.0 | Variáveis 1.5 | Elos 2.5 | Carga 1.0
        const score = (premises.length * 1.0) + (uniqueVars.length * 1.5) + (bridgeVars.length * 2.5) + cogLoad;

        return {
            score: round2(score),
            premises: premises.length,
            vars: uniqueVars.length,
            elos: bridgeVars.length,
            uniqueVars: uniqueVars.sort(),
            bridgeVars: bridgeVars.sort(),
            bridgeMap,
            varCounts,
            cognitiveLoad: round2(cogLoad)
        };
    },

    // Régua Oficial de Dificuldade (Ponto de Corte)
    getLevelFromScore(score) {
        const cuts = [165, 156, 146, 132, 118, 105, 94, 84, 74, 66, 60, 53, 44, 38, 34, 31, 28, 26, 21];
        for (let i = 0; i < cuts.length; i++) {
            if (score > cuts[i]) return 20 - i;
        }
        return 1;
    },

    // Métricas + nível calculado (LC) + nível real com ajuste manual (LR)
    analyze(premises, question, answer, adjustment = 0) {
        const metrics = this.calculateScore(premises, question, answer);
        const baseLevel = this.getLevelFromScore(metrics.score);
        const level = Math.max(1, Math.min(20, baseLevel + (adjustment || 0)));
        return { ...metrics, level, baseLevel };
    }
};

function round2(n) { return Math.round(n * 100) / 100; }
