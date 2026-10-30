// BATERIA G4 — indução dura (a tarefa que mais carrega o fator G nos humanos, como as
// matrizes de Raven). Na G1 a indução tinha 3 traços e regras de 1 ou 2 condições; só o
// Sonnet low errou (7/9). Aqui: 4 traços inventados, 10 exemplos, 3 casos novos, e regras
// escondidas mais difíceis:
//   nível 1: "A e B"          nível 2: "A ou B, mas não os dois"     nível 3: "pelo menos 2 de A, B, C"
// O gerador só aceita exemplos em que TODAS as regras compatíveis de um espaço de ~230
// (traço, "e", "ou", "ou exclusivo", "e" de três, "2 de 3", "(A e B) ou C") concordam nos
// 3 casos novos: o gabarito não depende de qual regra a IA escolher dentro desse espaço.
// Uso: node benchmark/gerar-g4.js → benchmark/g4/prompts/INDUCAO.txt e benchmark/g4/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g4');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { criarSorteio, criarLexico } = ctx;

const F = 4;
const lits = [];
for (let f = 0; f < F; f++) for (const v of [true, false]) lits.push({ f, v });
const L = (l) => (x) => x[l.f] === l.v;
const H = [];
lits.forEach(l => H.push({ tipo: 'traço', ok: L(l) }));
for (const a of lits) for (const b of lits) if (a.f < b.f) {
    H.push({ tipo: 'e', ok: x => L(a)(x) && L(b)(x) }, { tipo: 'ou', ok: x => L(a)(x) || L(b)(x) });
    if (a.v && b.v) H.push({ tipo: 'xor', ok: x => x[a.f] !== x[b.f] }, { tipo: 'xnor', ok: x => x[a.f] === x[b.f] });
    for (const c of lits) if (c.f !== a.f && c.f !== b.f) H.push({ tipo: '(e) ou', ok: x => (L(a)(x) && L(b)(x)) || L(c)(x) });
}
for (const a of lits) for (const b of lits) for (const c of lits) if (a.f < b.f && b.f < c.f) {
    H.push({ tipo: 'e3', ok: x => L(a)(x) && L(b)(x) && L(c)(x) }, { tipo: '2de3', ok: x => [a, b, c].filter(l => L(l)(x)).length >= 2 });
}

// Família que ficou de fora do espaço H na primeira versão: "A e (B ou C)". Opus, Sonnet e
// Fable chegaram a ela no desafio 8, cada um por conta própria. Aqui ela só serve de
// conferência (não muda os itens): conta quantas regras dela explicam os exemplos e
// discordam do gabarito nos casos novos.
const H_FORA = [];
for (const a of lits) for (const b of lits) for (const c of lits) if (b.f < c.f && a.f !== b.f && a.f !== c.f) {
    H_FORA.push({ tipo: 'e (ou)', ok: x => L(a)(x) && (L(b)(x) || L(c)(x)) });
}

const REGRA = {
    1: (s) => { const [a, b] = s.embaralhar([0, 1, 2, 3]); return { nome: 'A e B', ok: x => x[a] && x[b] }; },
    2: (s) => { const [a, b] = s.embaralhar([0, 1, 2, 3]); return { nome: 'A ou B, não os dois', ok: x => x[a] !== x[b] }; },
    3: (s) => { const [a, b, c] = s.embaralhar([0, 1, 2, 3]); return { nome: 'pelo menos 2 de A, B, C', ok: x => [a, b, c].filter(f => x[f]).length >= 2 }; }
};

function itemInducao(nivel, semente) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const tracos = Array.from({ length: F }, () => lex.adjetivo());
    const cat = lex.substantivo();
    const regra = REGRA[nivel](s);
    const seres = Array.from({ length: 16 }, (_, n) => [0, 1, 2, 3].map(f => !!(n >> f & 1)));
    for (let t = 0; t < 3000; t++) {
        const ordem = s.embaralhar(seres), ex = ordem.slice(0, 10), teste = ordem.slice(10, 13);
        const pos = ex.filter(regra.ok).length;
        if (pos < 3 || pos > 7) continue;
        const consistentes = H.filter(h => ex.every(x => h.ok(x) === regra.ok(x)));
        if (!consistentes.every(h => teste.every(x => h.ok(x) === regra.ok(x)))) continue;
        const nomes = ordem.slice(0, 13).map(() => lex.nome('m').palavra);
        const descr = (x, k) => `O ${nomes[k]} ` + x.map((v, f) => `${v ? '' : 'não '}é ${tracos[f].m}`).join(', ').replace(/, ([^,]*)$/, ' e $1');
        const art = cat.genero === 'm' ? 'um' : 'uma';
        const linhas = [`Alguns seres são ${cat.plural}, outros não. Veja:`,
            ...ex.map((x, k) => `${descr(x, k)}: ${regra.ok(x) ? '' : 'não '}é ${art} ${cat.palavra}.`),
            `Agora: ${teste.map((x, k) => descr(x, 10 + k)).join('. ')}.`];
        const pergunta = `O ${nomes[10]} é ${art} ${cat.palavra}? E o ${nomes[11]}? E o ${nomes[12]}?`;
        const alternativas = H_FORA.filter(h => ex.every(x => h.ok(x) === regra.ok(x)) && teste.some(x => h.ok(x) !== regra.ok(x))).length;
        return { corpo: `${linhas.join('\n')}\n${pergunta}`, tipo: 'inducao', regra: regra.nome, compativeis: consistentes.length, alternativas,
            resposta: teste.map(x => regra.ok(x) ? 'sim' : 'não').join(', ') };
    }
    throw new Error('sem exemplos que fixem a regra');
}

function primeiroValido(fazer, semente) {
    let ultimo;
    for (let k = 0; k < 50; k++) { try { return fazer(semente + k * 97); } catch (e) { ultimo = e; } }
    throw ultimo;
}

const itens = [1, 2, 3].flatMap(nivel => [0, 1, 2].map(i => ({ nivel, ...primeiroValido(sem => itemInducao(nivel, sem), 80000 + nivel * 1000 + i * 10) })));
const ordem = criarSorteio(4044).embaralhar(itens).map((it, k) => ({ numero: k + 1, ...it }));
const cabecalho = [
    'Responda esses desafios, uma resposta por linha no formato "1: resposta".',
    'Para cada desafio, responda sim ou não a cada pergunta, na ordem (exemplo: "1: sim, não, sim").',
    'Use a regra mais simples (com menos condições) que explica todos os exemplos.'
].join('\n');
const prompt = `${cabecalho}\n\n${ordem.map(it => `Desafio ${it.numero}\n${it.corpo}`).join('\n\n')}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'prompts', 'INDUCAO.txt'), prompt);
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({ INDUCAO: ordem.map(({ corpo, ...resto }) => resto) }, null, 1));
console.log(`INDUCAO ${ordem.length} desafios · ${prompt.split('\n').length} linhas · espaço de ${H.length} regras`);
console.log(ordem.map(it => `${it.numero}:n${it.nivel}/${it.resposta}/${it.alternativas} alternativa(s) fora do espaço`).join(' · '));
