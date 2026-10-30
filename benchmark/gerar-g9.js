// BATERIA G9 — troca de língua (a "afasia" comportamental)
// O desafio vem numa língua e a resposta é pedida na outra. Se a lógica sobrevive quando a
// "saída" muda de língua, conceito e produção são separáveis, como na afasia de Broca.
// Palavras reais (só assim existe tradução), com 2 passos e regras de distração.
// Seis desafios por direção, com a mesma estrutura nas duas:
//   adjetivo com grupo misto (em português, "Marina e Caio" pede o masculino plural),
//   adjetivo com grupo feminino, 2 verbos no plural e 2 gerúndios.
// Cada resposta recebe uma de quatro notas: certa · forma errada (conceito e língua certos,
// flexão errada) · língua errada (conceito certo na língua do problema) · conceito errado.
// Uso: node benchmark/gerar-g9.js                          → g9/prompts/*.txt e g9/gabarito.json
//      node benchmark/gerar-g9.js corrigir <gabarito> <pasta das respostas>
const fs = require('fs'), path = require('path'), vm = require('vm');
const SAIDA = path.join(__dirname, 'g9');
const sem = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

if (process.argv[2] === 'corrigir') {
    const gabarito = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const pasta = process.argv[4];
    for (const arq of fs.readdirSync(pasta).sort()) {
        const [config, direcao] = arq.replace('.txt', '').split('-G9-');
        const respostas = new Map(fs.readFileSync(path.join(pasta, arq), 'utf8').split(/\r?\n/).map(l => l.match(/^\s*(\d+)\s*:\s*(.+?)\s*$/)).filter(Boolean).map(m => [+m[1], m[2]]));
        const notas = gabarito[direcao].map(it => {
            const dada = sem(respostas.get(it.numero) ?? '');
            const nota = dada === sem(it.resposta) ? 'certa' : dada.includes(it.raizAlvo) ? 'forma errada'
                : dada.includes(it.raizOutra) ? 'língua errada' : 'conceito errado';
            return { ...it, dada: respostas.get(it.numero) ?? '—', nota };
        });
        const conta = (n) => notas.filter(x => x.nota === n).length;
        console.log(`\n${config} · ${direcao}: certa ${conta('certa')} · forma errada ${conta('forma errada')} · língua errada ${conta('língua errada')} · conceito errado ${conta('conceito errado')}  →  lógica ${6 - conta('conceito errado')}/6`);
        notas.filter(x => x.nota !== 'certa').forEach(x => console.log(`   ${x.numero} [${x.tipo}] ${x.dada} → ${x.nota} (esperado ${x.resposta})`));
    }
    process.exit(0);
}

const ctx = vm.createContext({ console }); ctx.window = ctx;
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'palavras.js'), 'utf8'), ctx);
const s = ctx.criarSorteio(9090);

const ANIMAIS = [
    { pt: 'coelho', ptPl: 'coelhos', g: 'm', en: 'rabbit', enPl: 'rabbits' }, { pt: 'abelha', ptPl: 'abelhas', g: 'f', en: 'bee', enPl: 'bees' },
    { pt: 'pato', ptPl: 'patos', g: 'm', en: 'duck', enPl: 'ducks' }, { pt: 'coruja', ptPl: 'corujas', g: 'f', en: 'owl', enPl: 'owls' },
    { pt: 'gato', ptPl: 'gatos', g: 'm', en: 'cat', enPl: 'cats' }, { pt: 'tartaruga', ptPl: 'tartarugas', g: 'f', en: 'turtle', enPl: 'turtles' },
    { pt: 'cavalo', ptPl: 'cavalos', g: 'm', en: 'horse', enPl: 'horses' }, { pt: 'raposa', ptPl: 'raposas', g: 'f', en: 'fox', enPl: 'foxes' }
];
const ADJETIVOS = [
    { m: 'listrado', f: 'listrada', en: 'striped' }, { m: 'famoso', f: 'famosa', en: 'famous' }, { m: 'sonolento', f: 'sonolenta', en: 'sleepy' },
    { m: 'faminto', f: 'faminta', en: 'hungry' }, { m: 'pintado', f: 'pintada', en: 'spotted' }, { m: 'cansado', f: 'cansada', en: 'tired' }
];
const VERBOS = [
    { pres: 'pula', pl: 'pulam', ger: 'pulando', raiz: 'pul', en: 'jump', en3: 'jumps', ing: 'jumping' },
    { pres: 'nada', pl: 'nadam', ger: 'nadando', raiz: 'nad', en: 'swim', en3: 'swims', ing: 'swimming' },
    { pres: 'canta', pl: 'cantam', ger: 'cantando', raiz: 'cant', en: 'sing', en3: 'sings', ing: 'singing' },
    { pres: 'corre', pl: 'correm', ger: 'correndo', raiz: 'corr', en: 'run', en3: 'runs', ing: 'running' },
    { pres: 'dorme', pl: 'dormem', ger: 'dormindo', raiz: 'dorm', en: 'sleep', en3: 'sleeps', ing: 'sleeping' },
    { pres: 'dança', pl: 'dançam', ger: 'dançando', raiz: 'danc', en: 'dance', en3: 'dances', ing: 'dancing' }
];
const NOMES = { f: ['Marina', 'Sofia', 'Júlia', 'Clara'], m: ['Caio', 'Lucas', 'Pedro', 'Bruno'] };

// Frases nas duas línguas
const um = (a) => a.g === 'm' ? 'um' : 'uma', Todo = (a) => a.g === 'm' ? 'Todo' : 'Toda';
const anEn = (w) => /^[aeiou]/.test(w) ? 'an' : 'a';
const comArtigo = (n) => `${NOMES.f.includes(n) ? 'a' : 'o'} ${n}`;
const juntarPt = (ns) => ns.map(comArtigo).join(' e ').replace(/^./, c => c.toUpperCase());
const PT = {
    animal: (a, c) => `${Todo(a)} ${a.pt} é ${um(c)} ${c.pt}.`,
    adj: (a, j) => `${Todo(a)} ${a.pt} é ${j[a.g]}.`,
    quemVerbo: (j, v) => `Quem é ${j.m} ${v.pres}.`,
    fato: (ns, a) => ns.length > 1 ? `${juntarPt(ns)} são ${a.ptPl}.` : `${juntarPt(ns)} é ${um(a)} ${a.pt}.`,
    pergunta: (ns, tipo) => tipo === 'gerúndio' ? `${juntarPt(ns)} está ___?` : tipo.startsWith('verbo') ? `${juntarPt(ns)} ___?` : `${juntarPt(ns)} são ___?`
};
const EN = {
    animal: (a, c) => `Every ${a.en} is ${anEn(c.en)} ${c.en}.`,
    adj: (a, j) => `Every ${a.en} is ${j.en}.`,
    quemVerbo: (j, v) => `Whoever is ${j.en} ${v.en3}.`,
    fato: (ns, a) => ns.length > 1 ? `${ns.join(' and ')} are ${a.enPl}.` : `${ns[0]} is ${anEn(a.en)} ${a.en}.`,
    pergunta: (ns, tipo) => tipo === 'gerúndio' ? `What is ${ns[0]} doing? ${ns[0]} is ___?` : tipo.startsWith('verbo') ? `${ns.join(' and ')} ___?` : `${ns.join(' and ')} are ___?`
};

// Cada desafio: personagem(ns) → animal A → animal C → adjetivo J (→ verbo V), mais uma cadeia de distração
function desafio(tipo) {
    const [A, C, D, E] = s.embaralhar(ANIMAIS);
    const [J, K] = s.embaralhar(ADJETIVOS);
    const [V, W] = s.embaralhar(VERBOS);
    const f = s.embaralhar(NOMES.f), m = s.embaralhar(NOMES.m);
    const ns = tipo === 'adjetivo, grupo misto' ? [f[0], m[0]] : tipo === 'adjetivo, grupo feminino' ? [f[0], f[1]] : tipo === 'gerúndio' ? [s.item([f[0], m[0]])] : [m[0], f[0]];
    const outro = [m[1]];
    const pedeVerbo = !tipo.startsWith('adjetivo');
    const regras = (L) => [L.animal(A, C), L.adj(C, J), ...(pedeVerbo ? [L.quemVerbo(J, V)] : []),
        L.animal(D, E), L.adj(E, K), ...(pedeVerbo ? [L.quemVerbo(K, W)] : [])];
    const fatos = (L) => [L.fato(ns, A), L.fato(outro, D)];
    const generoGrupo = ns.some(n => NOMES.m.includes(n)) ? 'm' : 'f';
    const pt = { adjetivo: `${J[generoGrupo]}s`, verbo: V.pl, gerundio: V.ger };
    const en = { adjetivo: J.en, verbo: V.en, gerundio: V.ing };
    const chave = tipo.startsWith('adjetivo') ? 'adjetivo' : tipo === 'gerúndio' ? 'gerundio' : 'verbo';
    const ordem = s.embaralhar([0, 1, 2, 3, 4, 5].slice(0, regras(PT).length));
    const texto = (L) => [...ordem.map(i => regras(L)[i]), ...fatos(L), L.pergunta(ns, tipo)].join('\n');
    return {
        tipo, textoPt: texto(PT), textoEn: texto(EN),
        respostaPt: pt[chave], respostaEn: en[chave],
        raizPt: tipo.startsWith('adjetivo') ? sem(J.m).slice(0, -1) : V.raiz, raizEn: tipo.startsWith('adjetivo') ? J.en : sem(V.en).replace(/e$/, '')
    };
}

const TIPOS = ['adjetivo, grupo misto', 'verbo no plural', 'gerúndio', 'adjetivo, grupo feminino', 'verbo no plural (2)', 'gerúndio'];
const itens = TIPOS.map((t, k) => ({ numero: k + 1, ...desafio(t) }));
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
const promptEnPt = 'Answer these challenges, one answer per line in the format "1: answer".\nWrite every answer in Brazilian Portuguese.\n\n' +
    itens.map(it => `Challenge ${it.numero}\n${it.textoEn}`).join('\n\n') + '\n\nImportant: do not read files or use tools to solve.';
const promptPtEn = 'Responda esses desafios, uma resposta por linha no formato "1: resposta".\nEscreva todas as respostas em inglês.\n\n' +
    itens.map(it => `Desafio ${it.numero}\n${it.textoPt}`).join('\n\n') + '\n\nImportante: não leia arquivos nem use ferramentas para resolver.';
fs.writeFileSync(path.join(SAIDA, 'prompts', 'EN-para-PT.txt'), promptEnPt);
fs.writeFileSync(path.join(SAIDA, 'prompts', 'PT-para-EN.txt'), promptPtEn);
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({
    'EN-para-PT': itens.map(it => ({ numero: it.numero, tipo: it.tipo, resposta: it.respostaPt, raizAlvo: it.raizPt, raizOutra: it.raizEn })),
    'PT-para-EN': itens.map(it => ({ numero: it.numero, tipo: it.tipo, resposta: it.respostaEn, raizAlvo: it.raizEn, raizOutra: it.raizPt }))
}, null, 1));
itens.forEach(it => console.log(`${it.numero} [${it.tipo}] EN→PT: ${it.respostaPt} · PT→EN: ${it.respostaEn}`));
console.log('\n' + itens[0].textoEn + '\n\n' + itens[0].textoPt);
