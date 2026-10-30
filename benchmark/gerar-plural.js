// TESTE DO WUG DO PLURAL
// O mesmo desenho do teste do gerúndio (gerar-gerundio.js), agora com plural:
//   2 adjetivos no plural com grupo misto ("A X e o Y são ___?" pede o masculino plural)
//   2 adjetivos no feminino plural ("A X e a Y são ___?")
//   2 verbos no plural ("A X e o Y ___?" → "-am", "-em")
// Três versões dos mesmos 6 desafios: palavras inventadas, palavras reais (palavras-reais.js)
// e inventadas com dois exemplos resolvidos no topo (com outras palavras inventadas).
// Uso: node benchmark/gerar-plural.js → benchmark/g6/prompts/PLU-*.txt e benchmark/g6/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g6');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { gerarLote, versaoComPalavrasReais } = ctx;

const todos = [1, 2, 3].flatMap(n => gerarLote(n, 60, 96000 + n));
const misto = (d) => /^(A .+ e o |O .+ e a )/.test(d.pergunta.texto);
const TIPOS = [
    ['masculino plural (grupo misto)', d => d.flexao === 'masculino plural' && misto(d)],
    ['feminino plural', d => d.flexao === 'feminino plural'],
    ['verbo no plural', d => d.flexao === 'presente, eles']
];
const escolhidos = TIPOS.flatMap(([tipo, filtro]) => {
    const ok = todos.filter(filtro);
    return [ok[0], ok[Math.floor(ok.length / 2)]].map(d => ({ tipo, d }));
});
const ordem = [0, 2, 4, 1, 3, 5].map(i => escolhidos[i]);   // tipos alternados

const EXEMPLOS = [
    'Exemplos de como responder:',
    '- no desafio "Todo plimbo é zarfoso. O Tilo e a Lena são plimbos. O Tilo e a Lena são ___?", a resposta seria "zarfosos";',
    '- no desafio "Todo plimbo zarfa. A Lena e o Tilo são plimbos. A Lena e o Tilo ___?", a resposta seria "zarfam".'
].join('\n');
// Segunda leva (H10): os exemplos da primeira não mostravam troca de gênero nem a conjugação
// em -em. Estes mostram as duas coisas.
const EXEMPLOS2 = [
    'Exemplos de como responder:',
    '- no desafio "Toda plimba é zarfosa. O Tilo e a Lena são plimbas. O Tilo e a Lena são ___?", a resposta seria "zarfosos";',
    '- no desafio "Quem é plimbo é bolento. A Lena e a Rita são plimbos. A Lena e a Rita são ___?", a resposta seria "bolentas";',
    '- no desafio "Todo plimbo zarfe. O Tilo e a Lena são plimbos. O Tilo e a Lena ___?", a resposta seria "zarfem".'
].join('\n');

// H11: de onde vem o gênero do grupo? Versões híbridas, trocando só os nomes dos personagens
// (o gênero de cada nome é mantido): palavras reais com nomes inventados, e o contrário.
const { trocasDoDesafio } = ctx;
const trocarNomes = (texto, mapa) => mapa.reduce((t, [de, para]) => t.replace(new RegExp(`(?<![\\wÀ-ÿ])${de}(?![\\wÀ-ÿ])`, 'g'), para), texto);
function comNomes(d, base, sentido) {
    const { reais } = trocasDoDesafio(d);
    const pares = Object.entries(d.palavras).filter(([, p]) => p.classe === 'nome').map(([l, p]) => sentido === 'inventados' ? [reais[l].palavra, p.palavra] : [p.palavra, reais[l].palavra]);
    return { ...base, linhas: base.linhas.map(l => ({ ...l, texto: trocarNomes(l.texto, pares) })), pergunta: { ...base.pergunta, texto: trocarNomes(base.pergunta.texto, pares) } };
}

const corpo = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}`;
const VERSOES = [
    ['inventadas', d => d, ''],
    ['reais', versaoComPalavrasReais, ''],
    ['exemplo', d => d, EXEMPLOS],
    ['exemplo2', d => d, EXEMPLOS2],
    ['nomes-inventados', d => comNomes(d, versaoComPalavrasReais(d), 'inventados'), ''],
    ['nomes-reais', d => comNomes(d, d, 'reais'), '']
];
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
const gabarito = {};
for (const [nome, versao, extra] of VERSOES) {
    const itens = ordem.map(({ tipo, d }, k) => ({ numero: k + 1, tipo, d: versao(d) }));
    const textos = itens.map(({ numero, d }) => `Desafio ${numero}\n${corpo(d)}`).join('\n\n');
    if (extra && /plimb|zarf|bolent|Tilo|Lena|Rita/.test(textos)) throw new Error('as palavras do exemplo aparecem nos desafios');
    const prompt = ['Responda esses desafios, uma resposta por linha no formato "1: resposta":', extra].filter(Boolean).join('\n') +
        `\n\n${textos}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`;
    fs.writeFileSync(path.join(SAIDA, 'prompts', `PLU-${nome}.txt`), prompt);
    gabarito[nome] = itens.map(({ numero, tipo, d }) => ({ numero, tipo, resposta: d.resposta, pergunta: d.pergunta.texto }));
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
for (let k = 0; k < 6; k++) console.log(`${k + 1} [${gabarito.inventadas[k].tipo}] ${gabarito.inventadas[k].pergunta} → ${gabarito.inventadas[k].resposta}   |   ${gabarito.reais[k].pergunta} → ${gabarito.reais[k].resposta}`);
