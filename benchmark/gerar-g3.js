// BATERIA G3 — operadores encadeados no meio do ruído
// Na G2, desafios curtos com negação, "ou" e falácias ficaram no teto (Opus e Sonnet low 12/12).
// Aqui a prova encadeia 3, 6 ou 10 operações ("todo", prova por casos, silogismo disjuntivo)
// e termina numa pergunta que pede contraposição, afirmação direta ou "não dá para saber",
// escondida entre 10, 40 ou 100 regras de ruído e vários personagens.
//
// O gabarito vem de um resolvedor SAT (DPLL): "sim" se as frases + "X não é Q" forem
// impossíveis, "não" se as frases + "X é Q" forem impossíveis, senão "não dá para saber".
// Uso: node benchmark/gerar-g3.js → benchmark/g3/prompts/CADEIA.txt e benchmark/g3/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g3');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { criarSorteio, criarLexico } = ctx;

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
const CLAUSULA = { todo: ([a, b]) => [[a, false], [b, true]], nenhum: ([a, b]) => [[a, false], [b, false]], ou: ([a, b, c]) => [[a, false], [b, true], [c, true]] };

// --- DPLL: propagação de unidades + literais puros + divisão ---
function satisfazivel(clausulas) {
    let cls = clausulas.map(c => c.slice());
    for (;;) {
        if (cls.some(c => c.length === 0)) return false;
        if (!cls.length) return true;
        const unidade = cls.find(c => c.length === 1);
        const sinais = new Map();
        cls.forEach(c => c.forEach(([v, s]) => sinais.set(v, (sinais.get(v) ?? 0) | (s ? 1 : 2))));
        const puro = [...sinais].find(([, m]) => m !== 3);
        const lit = unidade ? unidade[0] : puro ? [puro[0], puro[1] === 1] : null;
        if (!lit) break;
        cls = atribuir(cls, lit);
    }
    const v = cls[0][0][0];
    return satisfazivel(atribuir(cls, [v, true])) || satisfazivel(atribuir(cls, [v, false]));
}
const atribuir = (cls, [v, s]) => cls.filter(c => !c.some(([w, t]) => w === v && t === s)).map(c => c.filter(([w]) => w !== v));

function responder(regras, fatos, pergunta) {
    const base = [...regras.map(([tipo, g]) => CLAUSULA[tipo](g)), ...fatos.map(([p, sim]) => [[p, sim]])];
    if (!satisfazivel(base)) throw new Error('frases contraditórias');
    const podeSim = satisfazivel([...base, [[pergunta, true]]]);
    const podeNao = satisfazivel([...base, [[pergunta, false]]]);
    return podeSim && podeNao ? 'não dá para saber' : podeSim ? 'sim' : 'não';
}

// --- Montagem: a prova é uma sequência de operações sobre o grupo "atual" do personagem ---
function montarItem(ops, ruido, final, semente) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const novo = () => lex.substantivo();
    const regras = [], fatos = [], provados = [];
    const X = lex.nome(s.item(['m', 'f']));
    let atual = novo();
    fatos.push([atual, true]);
    provados.push(atual);
    for (let k = 0; k < ops; k++) {
        const op = s.item(['todo', 'casos', 'disjuntivo']);
        const prox = novo();
        if (op === 'todo') regras.push(['todo', [atual, prox]]);
        if (op === 'casos') { const b = novo(), c = novo(); regras.push(['ou', [atual, b, c]], ['todo', [b, prox]], ['todo', [c, prox]]); }
        if (op === 'disjuntivo') { const b = novo(); regras.push(['ou', s.chance(0.5) ? [atual, b, prox] : [atual, prox, b]]); fatos.push([b, false]); }
        atual = prox;
        provados.push(atual);
    }
    // Final: "sim" (o último grupo), "não" (contraposição por "nenhum") ou "não dá" (consequente afirmado / ramo aberto)
    let pergunta, esperado;
    if (final === 'sim') { pergunta = atual; esperado = 'sim'; }
    if (final === 'nao') { const z = novo(), w = novo(); regras.push(['nenhum', [atual, z]], ['todo', [w, z]]); pergunta = w; esperado = 'não'; }
    if (final === 'nao-da') {
        const q = novo();
        if (s.chance(0.5)) { regras.push(['todo', [q, atual]]); } else { const b = novo(); regras.push(['ou', [atual, b, q]]); }
        pergunta = q; esperado = 'não dá para saber';
    }
    // Ruído: grupos novos que só entram na cadeia (nunca saem dela), mais ruído entre si e outros personagens
    const soltos = Array.from({ length: Math.max(3, Math.round(ruido * 0.6)) }, novo);
    const cadeia = [...provados];
    while (regras.length < ops * 2 + ruido) {
        const r = s.item(soltos), alvo = s.chance(0.6) ? s.item(cadeia) : s.item(soltos);
        if (r === alvo) continue;
        const tipo = s.item(['todo', 'todo', 'todo', 'nenhum', 'ou']);
        regras.push(tipo === 'ou' ? ['ou', [r, alvo, s.item(soltos)]] : [tipo, [r, alvo]]);
    }
    const outros = Array.from({ length: 2 + Math.round(ruido / 30) }, () => [lex.nome(s.item(['m', 'f'])), s.item([...soltos, ...cadeia]), s.chance(0.8)]);
    const resposta = responder(regras, fatos, pergunta);
    if (resposta !== esperado) throw new Error(`verificador diz ${resposta}, molde ${esperado}`);
    const linhas = [
        ...s.embaralhar(regras).map(([tipo, g]) => FRASE[tipo](g)),
        ...s.embaralhar([...fatos.map(([p, sim]) => `${oA(X)} ${sim ? 'é' : 'não é'} ${umA(p)}.`), ...outros.map(([y, p, sim]) => `${oA(y)} ${sim ? 'é' : 'não é'} ${umA(p)}.`)])
    ];
    return { corpo: `${linhas.join('\n')}\n${oA(X)} é ${umA(pergunta)}?`, ops, ruido, final, resposta };
}

function primeiroValido(fazer, semente) {
    let ultimo;
    for (let k = 0; k < 50; k++) { try { return fazer(semente + k * 97); } catch (e) { ultimo = e; } }
    throw ultimo;
}

const NIVEIS = [{ nivel: 1, ops: 3, ruido: 10 }, { nivel: 2, ops: 6, ruido: 40 }, { nivel: 3, ops: 10, ruido: 100 }];
const FINAIS = ['sim', 'nao', 'nao-da', 'nao'];
const itens = NIVEIS.flatMap(({ nivel, ops, ruido }) => FINAIS.map((final, i) => ({ nivel, ...primeiroValido(sem => montarItem(ops, ruido, final, sem), 70000 + nivel * 1000 + i * 10) })));
const ordem = criarSorteio(3033).embaralhar(itens).map((it, k) => ({ numero: k + 1, ...it }));
const cabecalho = [
    'Responda esses desafios, uma resposta por linha no formato "1: resposta".',
    'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem.',
    'Em "Todo A é um B ou um C", cada A é pelo menos um dos dois.'
].join('\n');
const prompt = `${cabecalho}\n\n${ordem.map(it => `Desafio ${it.numero}\n${it.corpo}`).join('\n\n')}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'prompts', 'CADEIA.txt'), prompt);
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({ CADEIA: ordem.map(({ corpo, ...resto }) => ({ tipo: 'tri', ...resto })) }, null, 1));
console.log(`CADEIA ${ordem.length} desafios · ${prompt.split('\n').length} linhas · ${prompt.length} caracteres`);
console.log(ordem.map(it => `${it.numero}:n${it.nivel}/${it.resposta}`).join(' '));
