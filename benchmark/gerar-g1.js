// BATERIA G1 — piloto do "fator G"
// Seis eixos de tipos diferentes, cada um com 3 níveis de dificuldade e 3 desafios por nível.
// Uma IA recebe um eixo por janela (9 desafios num prompt só). Se existe uma capacidade geral,
// os modelos ficam na mesma ordem em todos os eixos e os eixos se correlacionam entre si.
//
//   PROF  dedução em cadeia: 3, 6 e 12 passos, com uma cadeia paralela de distração
//   VOL   memória de trabalho: cadeia de 3 passos entre 20, 80 e 200 regras
//   SOS   atenção: o mesmo com 4 iscas sósias (uma vogal de diferença), em 20, 40 e 80 regras
//   MORF  morfologia: flexão fácil (masc. plural, presente), média (gerúndio, eles), difícil (gênero)
//   IND   indução: descobrir a regra escondida (1 traço, "e", "ou") e classificar 2 casos novos
//   INDET calibração: perguntas sem resposta dedutível (isolada, recíproca, recíproca + ruído)
//
// Uso: node benchmark/gerar-g1.js   → benchmark/g1/prompts/*.txt e benchmark/g1/gabarito.json
// Roda com os arquivos do próprio projeto (palavras.js, logica.js...) e com a montagem da bateria 6.

const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g1');
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');

// --- O projeto, carregado como no navegador ---
const ctx = vm.createContext({ console, document: { getElementById: () => ({}) } });
ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js', 'niveis.js', 'logica.js']) vm.runInContext(ler(f), ctx, { filename: f });
// A bateria 6 roda o próprio lote ao carregar; aqui só interessam as funções dela (montar)
try { vm.runInContext(ler('testes/scripts/gerar-b6.js'), ctx, { filename: 'gerar-b6.js' }); } catch (e) { }
// A bateria 6 é de antes do inglês: chama .map(fraseRegra), e o índice do map viraria o idioma
vm.runInContext('var fr0 = fraseRegra, ff0 = fraseFato; fraseRegra = (r) => fr0(r); fraseFato = (f) => ff0(f);', ctx);
const { criarSorteio, criarLexico, deduzir, fraseRegra, fraseFato, frasePergunta, flexionar, gerarLote, montar } = ctx;

const corpo = (linhas, pergunta) => `${linhas.join('\n')}\n${pergunta}`;
const textoDe = (regras, fatos, s) => [...s.embaralhar(regras).map(r => fraseRegra(r)), ...s.embaralhar(fatos).map(f => fraseFato(f))];

// --- PROF e INDET: duas cadeias paralelas, ruído só de fora para dentro ---
function cadeias(passos, s, lex, ruido = 4) {
    const g = () => s.item(['m', 'f']);
    const X1 = lex.nome(g()), X2 = lex.nome(g());
    const C = Array.from({ length: passos }, () => lex.substantivo());
    const D = Array.from({ length: passos }, () => lex.substantivo());
    const A1 = lex.adjetivo(), A2 = lex.adjetivo();
    const regras = [];
    for (let i = 0; i < passos - 1; i++) regras.push({ se: C[i], entao: C[i + 1] }, { se: D[i], entao: D[i + 1] });
    regras.push({ se: C[passos - 1], entao: A1 }, { se: D[passos - 1], entao: A2 });
    // Da cadeia D para a C (o X2 também chega a A1; o X1 nunca chega a A2)
    regras.push({ se: s.item(D.slice(0, -1)), entao: s.item(C.slice(1)) });
    for (let k = 0; k < ruido; k++) regras.push({ se: lex.substantivo(), entao: s.item([...C, ...D]) });
    const fatos = [{ sujeitos: [X1], predicado: C[0] }, { sujeitos: [X2], predicado: D[0] }];
    return { X1, X2, C, D, A1, A2, regras, fatos };
}

const adjetivosDeduzidos = (modelo, x, adjetivos) => { const c = deduzir(modelo, x); return adjetivos.filter(a => c.has(a.chave)).map(a => [a, c.get(a.chave).passos]); };

function itemProfundidade(passos, semente) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const m = cadeias(passos, s, lex);
    const achados = adjetivosDeduzidos(m, m.X1, [m.A1, m.A2]);
    if (achados.length !== 1 || achados[0][0] !== m.A1 || achados[0][1] !== passos) throw new Error('PROF inválido');
    return { corpo: corpo(textoDe(m.regras, m.fatos, s), frasePergunta([m.X1], 'é', 'adjetivo')), tipo: 'cadeia', chave: m.A1.chave, iscas: [m.A2.chave], resposta: flexionar(m.A1, 'é', [m.X1]).forma };
}

// nivel 1: grupo isolado · 2: o grupo só aparece depois do "é" (quem lê ao contrário chega a A1)
// nivel 3: duas regras ao contrário e mais ruído. "respondivel" = pergunta de controle sobre o X1
function itemIndeterminado(nivel, semente, respondivel) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const m = cadeias(3, s, lex, nivel === 3 ? 12 : 4);
    const X3 = lex.nome(s.item(['m', 'f'])), E = lex.substantivo();
    if (nivel >= 2) m.regras.push({ se: m.C[1], entao: E });
    if (nivel === 3) m.regras.push({ se: m.D[0], entao: E }, { se: m.C[0], entao: E });
    m.fatos.push({ sujeitos: [X3], predicado: E });
    if (adjetivosDeduzidos(m, X3, [m.A1, m.A2]).length) throw new Error('INDET dedutível');
    const x1 = adjetivosDeduzidos(m, m.X1, [m.A1, m.A2]);
    if (x1.length !== 1 || x1[0][0] !== m.A1) throw new Error('INDET controle inválido');
    const alvo = respondivel ? m.X1 : X3;
    return {
        corpo: corpo(textoDe(m.regras, m.fatos, s), frasePergunta([alvo], 'é', 'adjetivo')),
        tipo: respondivel ? 'cadeia' : 'indeterminado', chave: respondivel ? m.A1.chave : null,
        iscas: respondivel ? [m.A2.chave] : [m.A1.chave, m.A2.chave],
        resposta: respondivel ? flexionar(m.A1, 'é', [m.X1]).forma : 'não dá para saber'
    };
}

// --- VOL e SOS: a montagem da bateria 6 (eixo A sem sósias, eixo B com sósias) ---
function itemBateria6(N, i, comSosias) {
    const d = montar(N, i, comSosias);
    const texto = d.prompt.replace(/^Responda esse desafio:\n\n/, '').replace(/\n\nImportante:[\s\S]*$/, '');
    const iscas = Object.keys(d.papel).filter(k => k !== d.chave);
    return { corpo: texto, tipo: 'cadeia', chave: d.chave, iscas, resposta: d.resposta };
}

// --- IND: conceito escondido em 3 traços inventados ---
function itemInducao(nivel, semente) {
    const s = criarSorteio(semente), lex = criarLexico(criarSorteio(semente + 7));
    const tracos = [lex.adjetivo(), lex.adjetivo(), lex.adjetivo()];
    const cat = lex.substantivo();
    const literais = [0, 1, 2].flatMap(f => [{ f, v: true }, { f, v: false }]);
    const lit = (l) => (x) => x[l.f] === l.v;
    const H = literais.map(l => ({ c: 1, ok: lit(l) }));
    const pares = [];
    for (const a of literais) for (const b of literais) if (a.f < b.f) pares.push([a, b]);
    pares.forEach(([a, b]) => H.push({ c: 2, e: true, ok: x => lit(a)(x) && lit(b)(x) }, { c: 2, ou: true, ok: x => lit(a)(x) || lit(b)(x) }));
    const regra = nivel === 1 ? s.item(H.filter(h => h.c === 1)) : nivel === 2 ? s.item(H.filter(h => h.e)) : s.item(H.filter(h => h.ou));
    const seres = [0, 1, 2, 3, 4, 5, 6, 7].map(n => [!!(n & 1), !!(n & 2), !!(n & 4)]);
    for (let t = 0; t < 500; t++) {
        const ordem = s.embaralhar(seres), ex = ordem.slice(0, 6), teste = ordem.slice(6);
        if (!ex.some(regra.ok) || ex.every(regra.ok)) continue;
        const consistentes = H.filter(h => ex.every(x => h.ok(x) === regra.ok(x)));
        if (!consistentes.every(h => teste.every(x => h.ok(x) === regra.ok(x)))) continue;
        const nomes = ordem.map(() => lex.nome('m').palavra);
        const descr = (x, k) => `O ${nomes[k]} ` + x.map((v, f) => `${v ? '' : 'não '}é ${tracos[f].m}`).join(', ').replace(/, ([^,]*)$/, ' e $1');
        const art = cat.genero === 'm' ? 'um' : 'uma';
        const linhas = [`Alguns seres são ${cat.plural}, outros não. Veja:`,
            ...ex.map((x, k) => `${descr(x, k)}: ${regra.ok(x) ? '' : 'não '}é ${art} ${cat.palavra}.`),
            `Agora: ${descr(teste[0], 6)}. ${descr(teste[1], 7)}.`];
        const pergunta = `O ${nomes[6]} é ${art} ${cat.palavra}? E o ${nomes[7]}?`;
        return { corpo: corpo(linhas, pergunta), tipo: 'inducao', resposta: teste.map(x => regra.ok(x) ? 'sim' : 'não').join(', ') };
    }
    throw new Error('IND sem exemplos que fixem a regra');
}

// --- MORF: o gerador do site, separado pelo tipo de flexão ---
const FLEXOES = { 1: ['masculino plural', 'presente, ele'], 2: ['gerúndio', 'presente, eles'], 3: ['feminino singular', 'feminino plural'] };
function itensMorfologia() {
    const todos = [1, 2, 3].flatMap(n => gerarLote(n, 40, 91000 + n));
    return [1, 2, 3].flatMap(nivel => {
        const ok = todos.filter(d => FLEXOES[nivel].includes(d.flexao));
        const escolhidos = [ok[0], ok[Math.floor(ok.length / 2)], ok[ok.length - 1]];
        return escolhidos.map(d => ({ nivel, corpo: corpo(d.linhas.map(l => l.texto), d.pergunta.texto), tipo: 'morf', flexao: d.flexao,
            chave: d.chave, resposta: d.resposta, distratores: d.distratores, chavesArmadilha: d.chavesArmadilha }));
    });
}

// Tenta sementes seguidas até o item sair válido
function primeiroValido(fazer, semente) {
    for (let k = 0; k < 50; k++) { try { return fazer(semente + k * 97); } catch (e) { } }
    throw new Error('nenhuma semente válida');
}

const EIXOS = {
    PROF: [3, 6, 12].flatMap((p, n) => [0, 1, 2].map(i => ({ nivel: n + 1, ...primeiroValido(sem => itemProfundidade(p, sem), 10000 + p * 100 + i * 10) }))),
    VOL: [20, 80, 200].flatMap((N, n) => [0, 1, 2].map(i => ({ nivel: n + 1, ...itemBateria6(N, 101 + i, false) }))),
    SOS: [20, 40, 80].flatMap((N, n) => [0, 1, 2].map(i => ({ nivel: n + 1, ...itemBateria6(N, 111 + i, true) }))),
    MORF: itensMorfologia(),
    IND: [1, 2, 3].flatMap(n => [0, 1, 2].map(i => ({ nivel: n, ...primeiroValido(sem => itemInducao(n, sem), 30000 + n * 100 + i * 10) }))),
    INDET: [1, 2, 3].flatMap(n => [0, 1, 2].map(i => ({ nivel: n, ...primeiroValido(sem => itemIndeterminado(n, sem, i === 2), 40000 + n * 100 + i * 10) })))
};

// Nos eixos de lógica a lacuna diz que pede um adjetivo: sem isso, num lote, o Haiku low
// respondia o substantivo do meio da cadeia (v1, respostas-v1/). A morfologia fica sem dica.
const LACUNA = 'Em cada desafio, a lacuna pede um adjetivo.';
const PEDIDO_EXTRA = {
    PROF: LACUNA, VOL: LACUNA, SOS: LACUNA,
    // Sem o princípio, os exemplos admitem mais de uma regra (a mais simples e a mais específica):
    // na v1 o Haiku escolheu a mais simples e o Sonnet não (respostas-ind-v1/)
    IND: 'Para cada desafio, responda sim ou não a cada pergunta, na ordem (exemplo: "1: sim, não"). Use a regra mais simples (com menos condições) que explica todos os exemplos.',
    INDET: `${LACUNA} Se ele não puder ser deduzido das frases, responda "não dá para saber".`
};

fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });

// node gerar-g1.js duro → um arquivo só, com os eixos de lógica levados ao extremo
// (nos níveis normais, os quatro modelos low bateram no teto). Fica abaixo das 2.000
// linhas que a ferramenta Read lê de uma vez.
if (process.argv[2] === 'duro') {
    const duro = [
        ...[0, 1].map(i => ({ nivel: 1, sub: 'PROF30', ...primeiroValido(sem => itemProfundidade(30, sem), 50000 + i * 10) })),
        ...[0, 1].map(i => ({ nivel: 2, sub: 'VOL500', ...itemBateria6(500, 121 + i, false) })),
        ...[0, 1].map(i => ({ nivel: 3, sub: 'SOS300', ...itemBateria6(300, 131 + i, true) }))
    ];
    const ordem = criarSorteio(4242).embaralhar(duro).map((it, k) => ({ numero: k + 1, ...it }));
    const prompt = `Responda esses desafios, uma resposta por linha no formato "1: resposta":\n${LACUNA}\n\n${ordem.map(it => `Desafio ${it.numero}\n${it.corpo}`).join('\n\n')}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
    fs.writeFileSync(path.join(SAIDA, 'prompts', 'DURO.txt'), prompt);
    fs.writeFileSync(path.join(SAIDA, 'gabarito-duro.json'), JSON.stringify({ DURO: ordem.map(({ corpo, ...resto }) => resto) }, null, 1));
    console.log(`DURO ${ordem.length} desafios · ${prompt.split('\n').length} linhas · ${prompt.length} caracteres · ${ordem.map(it => it.sub).join(' ')}`);
    process.exit(0);
}

const gabarito = {};
for (const [eixo, itens] of Object.entries(EIXOS)) {
    // Mesma ordem embaralhada para todas as IAs, com os níveis misturados
    const ordem = criarSorteio(777 + eixo.length).embaralhar(itens).map((it, k) => ({ numero: k + 1, ...it }));
    const cabecalho = ['Responda esses desafios, uma resposta por linha no formato "1: resposta":', PEDIDO_EXTRA[eixo]].filter(Boolean).join('\n');
    const prompt = `${cabecalho}\n\n${ordem.map(it => `Desafio ${it.numero}\n${it.corpo}`).join('\n\n')}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
    fs.writeFileSync(path.join(SAIDA, 'prompts', `${eixo}.txt`), prompt);
    gabarito[eixo] = ordem.map(({ corpo, ...resto }) => resto);
    const regras = ordem.map(it => it.corpo.split('\n').length);
    console.log(`${eixo.padEnd(6)} ${ordem.length} desafios · ${prompt.length} caracteres · linhas por desafio ${Math.min(...regras)}–${Math.max(...regras)}`);
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
