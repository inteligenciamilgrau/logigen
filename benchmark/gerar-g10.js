// BATERIA G10 — o teste do wug entre línguas
// Na G9, com palavras reais, a lógica sobreviveu à troca de língua e a forma saiu certa na
// língua pedida. Aqui as palavras são inventadas: o desafio vem em inglês e a resposta é pedida
// em português. Um glossário em cada desafio dá a forma portuguesa de cada palavra inventada
// ("to glovund = glovundar"), então a resposta fica determinada e o modelo precisa produzir a
// flexão portuguesa de uma palavra que nunca viu, a partir de uma lógica feita em inglês.
// Controle: os mesmos desafios, com o mesmo glossário, inteiros em português.
// Nomes reais (Marina, Bruno...) dão o gênero do grupo. Nos desafios de verbo, a cadeia não tem
// adjetivo no meio, para "está ___" não ficar ambíguo (lição da G9).
// Uso: node benchmark/gerar-g10.js                         → g10/prompts/*.txt e g10/gabarito.json
//      node benchmark/gerar-g10.js corrigir <gabarito> <pasta das respostas>
const fs = require('fs'), path = require('path'), vm = require('vm');
const SAIDA = path.join(__dirname, 'g10');
const sem = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

if (process.argv[2] === 'corrigir') {
    const gabarito = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const pasta = process.argv[4];
    for (const arq of fs.readdirSync(pasta).sort()) {
        const [config, versao] = arq.replace('.txt', '').split('-G10-');
        const respostas = new Map(fs.readFileSync(path.join(pasta, arq), 'utf8').split(/\r?\n/).map(l => l.match(/^\s*(\d+)\s*:\s*(.+?)\s*$/)).filter(Boolean).map(m => [+m[1], m[2]]));
        const notas = gabarito.itens.map(it => {
            const dada = sem(respostas.get(it.numero) ?? '');
            const nota = dada === sem(it.resposta) ? 'certa' : it.formasEn.includes(dada) ? 'língua errada'
                : dada.includes(it.raiz) ? 'forma errada' : 'conceito errado';
            return { ...it, dada: respostas.get(it.numero) ?? '—', nota };
        });
        const conta = (n) => notas.filter(x => x.nota === n).length;
        console.log(`\n${config} · ${versao}: certa ${conta('certa')} · forma errada ${conta('forma errada')} · língua errada ${conta('língua errada')} · conceito errado ${conta('conceito errado')}  →  lógica ${6 - conta('conceito errado')}/6`);
        notas.filter(x => x.nota !== 'certa').forEach(x => console.log(`   ${x.numero} [${x.tipo}] ${x.dada} → ${x.nota} (esperado ${x.resposta})`));
    }
    process.exit(0);
}

const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
const s = ctx.criarSorteio(10010);
const lex = ctx.criarLexico(ctx.criarSorteio(10011));

// Verbos com a conjugação pedida ("ar" ou outra), para separar o plural em -am do plural em -em
function verbo(conjugacao) {
    for (let t = 0; t < 200; t++) {
        const v = lex.verbo();
        if ((conjugacao === 'ar') === v.infinitivo.endsWith('ar')) return { ...v, base: v.infinitivo.slice(0, -2) };
    }
    throw new Error('sem verbo da conjugação ' + conjugacao);
}
const NOMES = { f: ['Marina', 'Sofia', 'Júlia', 'Clara'], m: ['Caio', 'Lucas', 'Pedro', 'Bruno'] };
const comArtigo = (n) => `${NOMES.f.includes(n) ? 'a' : 'o'} ${n}`;
const juntarPt = (ns) => ns.map(comArtigo).join(' e ').replace(/^./, c => c.toUpperCase());
const um = (a) => a.genero === 'm' ? 'um' : 'uma', Todo = (a) => a.genero === 'm' ? 'Todo' : 'Toda';
const anEn = (w) => /^[aeiou]/.test(w) ? 'an' : 'a';

function desafio(tipo, numero) {
    const [A, C, D, E] = [lex.substantivo(), lex.substantivo(), lex.substantivo(), lex.substantivo()];
    const f = s.embaralhar(NOMES.f), m = s.embaralhar(NOMES.m);
    const ns = tipo === 'adjetivo, grupo misto' ? [f[0], m[0]] : tipo === 'adjetivo, grupo feminino' ? [f[0], f[1]]
        : tipo.startsWith('gerúndio') ? [s.item([f[0], m[0]])] : [m[0], f[0]];
    const outro = [m[1]];
    const conj = tipo.includes('-ar') ? 'ar' : 'outra';
    const ehAdjetivo = tipo.startsWith('adjetivo');
    // Alvo e distração: adjetivos (desafios de adjetivo) ou verbos (de verbo), sempre da mesma classe
    const alvo = ehAdjetivo ? lex.adjetivo() : verbo(conj), isca = ehAdjetivo ? lex.adjetivo() : verbo(s.item(['ar', 'outra']));
    const enPl = (p) => p.palavra + 's';
    const regrasEn = [`Every ${A.palavra} is ${anEn(C.palavra)} ${C.palavra}.`, `Every ${D.palavra} is ${anEn(E.palavra)} ${E.palavra}.`,
        ehAdjetivo ? `Every ${C.palavra} is ${alvo.m}.` : `Every ${C.palavra} ${alvo.base}s.`,
        ehAdjetivo ? `Every ${E.palavra} is ${isca.m}.` : `Every ${E.palavra} ${isca.base}s.`];
    const regrasPt = [`${Todo(A)} ${A.palavra} é ${um(C)} ${C.palavra}.`, `${Todo(D)} ${D.palavra} é ${um(E)} ${E.palavra}.`,
        ehAdjetivo ? `${Todo(C)} ${C.palavra} é ${alvo[C.genero]}.` : `${Todo(C)} ${C.palavra} ${alvo.presente}.`,
        ehAdjetivo ? `${Todo(E)} ${E.palavra} é ${isca[E.genero]}.` : `${Todo(E)} ${E.palavra} ${isca.presente}.`];
    const ordem = s.embaralhar([0, 1, 2, 3]);
    const fatosEn = [ns.length > 1 ? `${ns.join(' and ')} are ${enPl(A)}.` : `${ns[0]} is ${anEn(A.palavra)} ${A.palavra}.`, `${outro[0]} is ${anEn(D.palavra)} ${D.palavra}.`];
    const fatosPt = [ns.length > 1 ? `${juntarPt(ns)} são ${A.plural}.` : `${juntarPt(ns)} é ${um(A)} ${A.palavra}.`, `${juntarPt(outro)} é ${um(D)} ${D.palavra}.`];
    const perguntaEn = ehAdjetivo ? `${ns.join(' and ')} are ___?` : tipo.startsWith('gerúndio') ? `What is ${ns[0]} doing? ${ns[0]} is ___?` : `${ns.join(' and ')} ___?`;
    const perguntaPt = ehAdjetivo ? `${juntarPt(ns)} são ___?` : tipo.startsWith('gerúndio') ? `${juntarPt(ns)} está ___?` : `${juntarPt(ns)} ___?`;
    const glossEn = ehAdjetivo ? [alvo, isca].map(a => `${a.m} = ${a.m} (Portuguese adjective, masculine singular)`) : [alvo, isca].map(v => `to ${v.base} = ${v.infinitivo} (Portuguese verb)`);
    const glossPt = ehAdjetivo ? [alvo, isca].map(a => `${a.m} (adjetivo, masculino singular)`) : [alvo, isca].map(v => `${v.infinitivo} (verbo)`);
    const genero = ns.some(n => NOMES.m.includes(n)) ? 'm' : 'f';
    const resposta = ehAdjetivo ? alvo[genero + 'p'] : tipo.startsWith('gerúndio') ? alvo.gerundio : alvo.plural;
    return {
        numero, tipo, resposta,
        raiz: sem(ehAdjetivo ? alvo.m.slice(0, -1) : alvo.base),
        formasEn: ehAdjetivo ? [] : [alvo.base, alvo.base + 's', alvo.base + 'ing'].map(sem),
        en: [...ordem.map(i => regrasEn[i]), ...fatosEn, perguntaEn, `Glossary: ${glossEn.join('; ')}.`].join('\n'),
        pt: [...ordem.map(i => regrasPt[i]), ...fatosPt, perguntaPt, `Glossário: ${glossPt.join('; ')}.`].join('\n')
    };
}

const TIPOS = ['adjetivo, grupo misto', 'verbo no plural, -ar', 'gerúndio, -er/-ir', 'adjetivo, grupo feminino', 'verbo no plural, -er/-ir', 'gerúndio, -ar'];
const itens = TIPOS.map((t, k) => desafio(t, k + 1));
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
fs.writeFileSync(path.join(SAIDA, 'prompts', 'EN-para-PT.txt'),
    'Answer these challenges, one answer per line in the format "1: answer".\nWrite every answer in Brazilian Portuguese, using the Portuguese equivalents in each glossary.\n\n' +
    itens.map(it => `Challenge ${it.numero}\n${it.en}`).join('\n\n') + '\n\nImportant: do not read files or use tools to solve.');
fs.writeFileSync(path.join(SAIDA, 'prompts', 'PT.txt'),
    'Responda esses desafios, uma resposta por linha no formato "1: resposta".\n\n' +
    itens.map(it => `Desafio ${it.numero}\n${it.pt}`).join('\n\n') + '\n\nImportante: não leia arquivos nem use ferramentas para resolver.');
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({ itens: itens.map(({ en, pt, ...resto }) => resto) }, null, 1));
itens.forEach(it => console.log(`${it.numero} [${it.tipo}] → ${it.resposta}`));
console.log('\n' + itens[1].en + '\n\n' + itens[1].pt);
