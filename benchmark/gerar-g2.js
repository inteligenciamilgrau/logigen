// BATERIA G2 — operadores: tirar a lógica do teto
// Na G1, os quatro modelos low acertaram toda dedução com "todo A é B", até 30 passos e 500
// regras. Aqui entram negação ("nenhum"), "ou" (prova por casos), contraposição e as duas
// falácias clássicas. A resposta é "sim", "não" ou "não dá para saber".
//
// O gabarito não vem do molde: um verificador testa todas as combinações de verdade dos grupos
// ligados ao personagem e diz se as frases garantem "sim", garantem "não" ou não garantem nada.
// O molde só serve de conferência (se os dois discordam, o item é descartado).
//
// Uso: node benchmark/gerar-g2.js → benchmark/g2/prompts/OPER.txt e benchmark/g2/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g2');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { criarSorteio, criarLexico } = ctx;

// --- Frases ---
const art = (p) => p.genero === 'm' ? 'um' : 'uma';
const umA = (p) => `${art(p)} ${p.palavra}`;
const Todo = (p) => p.genero === 'm' ? 'Todo' : 'Toda';
const Nenhum = (p) => p.genero === 'm' ? 'Nenhum' : 'Nenhuma';
const oA = (x) => `${x.genero === 'm' ? 'O' : 'A'} ${x.palavra}`;
const FRASE = {
    todo: ([a, b]) => `${Todo(a)} ${a.palavra} é ${umA(b)}.`,
    nenhum: ([a, b]) => `${Nenhum(a)} ${a.palavra} é ${umA(b)}.`,
    ou: ([a, b, c]) => `${Todo(a)} ${a.palavra} é ${umA(b)} ou ${umA(c)}.`
};
const fraseFato = (x, p, sim) => `${oA(x)} ${sim ? 'é' : 'não é'} ${umA(p)}.`;

// --- Verificador: cada regra vira uma cláusula sobre os grupos do personagem ---
// todo(A,B): ¬A ∨ B · nenhum(A,B): ¬A ∨ ¬B · ou(A,B,C): ¬A ∨ B ∨ C · fato: A ou ¬A
function clausulas(regras, fatos) {
    const c = regras.map(([tipo, g]) => tipo === 'todo' ? [[g[0], false], [g[1], true]]
        : tipo === 'nenhum' ? [[g[0], false], [g[1], false]] : [[g[0], false], [g[1], true], [g[2], true]]);
    return [...c, ...fatos.map(([p, sim]) => [[p, sim]])];
}
function responder(regras, fatos, pergunta) {
    // Só os grupos ligados (por alguma regra) aos fatos do personagem e à pergunta importam
    const viz = new Map();
    const liga = (a, b) => { (viz.get(a) ?? viz.set(a, new Set()).get(a)).add(b); (viz.get(b) ?? viz.set(b, new Set()).get(b)).add(a); };
    regras.forEach(([, g]) => g.forEach((p, i) => g.slice(i + 1).forEach(q => liga(p, q))));
    const comp = new Set(), fila = [pergunta, ...fatos.map(([p]) => p)];
    while (fila.length) { const p = fila.pop(); if (comp.has(p)) continue; comp.add(p); (viz.get(p) ?? []).forEach(q => fila.push(q)); }
    const vars = [...comp];
    if (vars.length > 20) throw new Error('grupos demais para o verificador');
    const cl = clausulas(regras.filter(([, g]) => g.some(p => comp.has(p))), fatos);
    const idx = new Map(vars.map((v, i) => [v, i]));
    let podeSim = false, podeNao = false;
    for (let m = 0; m < (1 << vars.length) && !(podeSim && podeNao); m++) {
        const val = (p) => !!(m >> idx.get(p) & 1);
        if (cl.every(c => c.some(([p, s]) => val(p) === s))) { if (val(pergunta)) podeSim = true; else podeNao = true; }
    }
    if (!podeSim && !podeNao) throw new Error('frases contraditórias');
    return podeSim && podeNao ? 'não dá para saber' : podeSim ? 'sim' : 'não';
}

// --- Moldes: letras viram grupos inventados; "esperado" é só para conferência ---
const MOLDES = {
    1: [
        { nome: 'negação', regras: [['todo', 'AB'], ['nenhum', 'BC']], fatos: [['A', true]], q: 'C', esperado: 'não' },
        { nome: 'contraposição', regras: [['todo', 'AB']], fatos: [['B', false]], q: 'A', esperado: 'não' },
        { nome: 'afirmar o consequente', regras: [['todo', 'AB']], fatos: [['B', true]], q: 'A', esperado: 'não dá para saber' },
        { nome: 'negar o antecedente', regras: [['todo', 'AB']], fatos: [['A', false]], q: 'B', esperado: 'não dá para saber' }
    ],
    2: [
        { nome: 'prova por casos', regras: [['ou', 'ABC'], ['todo', 'BD'], ['todo', 'CD']], fatos: [['A', true]], q: 'D', esperado: 'sim' },
        { nome: 'silogismo disjuntivo', regras: [['ou', 'ABC']], fatos: [['A', true], ['B', false]], q: 'C', esperado: 'sim' },
        { nome: 'contraposição em cadeia', regras: [['todo', 'AB'], ['todo', 'BC'], ['todo', 'CD']], fatos: [['D', false]], q: 'A', esperado: 'não' },
        { nome: 'casos com um ramo aberto', regras: [['ou', 'ABC'], ['todo', 'BD']], fatos: [['A', true]], q: 'D', esperado: 'não dá para saber' }
    ],
    3: [
        { nome: 'casos + nenhum', regras: [['ou', 'ABC'], ['todo', 'BD'], ['todo', 'CD'], ['nenhum', 'DE']], fatos: [['A', true]], q: 'E', esperado: 'não' },
        { nome: 'disjuntivo + contraposição', regras: [['ou', 'ABC'], ['todo', 'CD'], ['todo', 'DE']], fatos: [['A', true], ['E', false]], q: 'B', esperado: 'sim' },
        { nome: 'nenhum + contraposição', regras: [['todo', 'AB'], ['nenhum', 'CB'], ['todo', 'DC']], fatos: [['A', true]], q: 'D', esperado: 'não' },
        { nome: 'casos com ramos diferentes', regras: [['ou', 'ABC'], ['todo', 'BD'], ['todo', 'CE'], ['todo', 'DF']], fatos: [['A', true]], q: 'F', esperado: 'não dá para saber' }
    ]
};

function montarItem(molde, semente) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const letras = [...new Set([...molde.regras.flatMap(([, g]) => [...g]), ...molde.fatos.map(([p]) => p), molde.q])];
    const grupo = Object.fromEntries(letras.map(l => [l, lex.substantivo()]));
    const regras = molde.regras.map(([tipo, g]) => [tipo, [...g].map(l => grupo[l])]);
    // Ruído: grupos novos que apontam para os do molde (nunca saem deles) e um outro personagem
    const ruido = Array.from({ length: 4 }, () => lex.substantivo());
    ruido.forEach(r => regras.push([s.item(['todo', 'todo', 'nenhum']), [r, s.item(Object.values(grupo))]]));
    regras.push(['todo', [ruido[0], ruido[1]]]);
    const X = lex.nome(s.item(['m', 'f'])), Y = lex.nome(s.item(['m', 'f']));
    const fatos = molde.fatos.map(([l, sim]) => [grupo[l], sim]);
    const resposta = responder(regras, fatos, grupo[molde.q]);
    if (resposta !== molde.esperado) throw new Error(`molde ${molde.nome}: verificador diz ${resposta}`);
    const linhas = [
        ...s.embaralhar(regras).map(([tipo, g]) => FRASE[tipo](g)),
        ...s.embaralhar([...fatos.map(([p, sim]) => fraseFato(X, p, sim)), fraseFato(Y, s.item(ruido), true)])
    ];
    return { corpo: `${linhas.join('\n')}\n${oA(X)} é ${umA(grupo[molde.q])}?`, molde: molde.nome, resposta };
}

function primeiroValido(fazer, semente) {
    let ultimo;
    for (let k = 0; k < 50; k++) { try { return fazer(semente + k * 97); } catch (e) { ultimo = e; } }
    throw ultimo;
}

const itens = [1, 2, 3].flatMap(nivel => MOLDES[nivel].map((molde, i) => ({ nivel, ...primeiroValido(sem => montarItem(molde, sem), 60000 + nivel * 1000 + i * 10) })));
const ordem = criarSorteio(2024).embaralhar(itens).map((it, k) => ({ numero: k + 1, ...it }));
const cabecalho = [
    'Responda esses desafios, uma resposta por linha no formato "1: resposta".',
    'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem.',
    'Em "Todo A é um B ou um C", cada A é pelo menos um dos dois.'
].join('\n');
const prompt = `${cabecalho}\n\n${ordem.map(it => `Desafio ${it.numero}\n${it.corpo}`).join('\n\n')}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'prompts', 'OPER.txt'), prompt);
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({ OPER: ordem.map(({ corpo, ...resto }) => ({ tipo: 'tri', ...resto })) }, null, 1));
console.log(`OPER ${ordem.length} desafios · ${prompt.split('\n').length} linhas · ` + ordem.map(it => `${it.numero}:${it.nivel}/${it.resposta}`).join(' '));
