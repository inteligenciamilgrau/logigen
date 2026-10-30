// BATERIA G8 — as duas pontas soltas do plural e do gerúndio
// H13: o plural de verbo inventado falhou em português e funcionou em inglês. É a língua ou a
//      conjugação? 6 verbos no plural, 3 em "-a" ("gletofla" → "gletoflam", só acrescentar)
//      e 3 em "-e" ("gronetre" → "gronetrem", deduzir a conjugação pela forma do singular).
// H14: o gerúndio em inglês com 6 itens (eram 2): inventados × reais.
// Uso: node benchmark/gerar-g8.js → benchmark/g8/prompts/*.txt e benchmark/g8/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g8');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'dicionario-en.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { gerarLote, versaoComPalavrasReais, montarPrompt } = ctx;

const espalhar = (lista, n) => Array.from({ length: n }, (_, k) => lista[Math.floor(k * lista.length / n)]);
const renumerar = (itens) => itens.map((d, k) => ({ ...d, numero: k + 1 }));
const fim = { pt: '\n\nImportante: não leia arquivos nem use ferramentas para resolver.', en: '\n\nImportant: do not read files or use tools to solve.' };
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
const gabarito = {};
const salvar = (arquivo, chave, itens, tipo) => {
    fs.writeFileSync(path.join(SAIDA, 'prompts', arquivo), montarPrompt(itens) + fim[itens[0].idioma]);
    gabarito[chave] = itens.map(d => ({ numero: d.numero, tipo: tipo(d), resposta: d.resposta, pergunta: d.pergunta.texto }));
};

// H13: verbos no plural em português, separados pela conjugação
const pt = [1, 2, 3].flatMap(n => gerarLote(n, 60, 98000 + n)).filter(d => d.flexao === 'presente, eles');
const emA = espalhar(pt.filter(d => d.resposta.endsWith('am')), 3), emE = espalhar(pt.filter(d => d.resposta.endsWith('em')), 3);
salvar('VERB-pt.txt', 'pt', renumerar([emA[0], emE[0], emA[1], emE[1], emA[2], emE[2]]), d => d.resposta.endsWith('am') ? 'conjugação em -a' : 'conjugação em -e');

// H14: gerúndio em inglês, inventados e reais (os mesmos desafios)
const en = espalhar([1, 2, 3].flatMap(n => gerarLote(n, 60, 99000 + n, 'en')).filter(d => d.flexao === 'gerund (-ing)'), 6);
salvar('GER-inventadas.txt', 'inventadas', renumerar(en), () => 'gerúndio');
salvar('GER-reais.txt', 'reais', renumerar(en.map(versaoComPalavrasReais)), () => 'gerúndio');

fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
for (const [chave, itens] of Object.entries(gabarito)) console.log(`${chave}: ` + itens.map(it => `${it.numero}=${it.resposta}`).join(' · '));
console.log(gabarito.pt[0].pergunta, '|', gabarito.inventadas[0].pergunta, '|', gabarito.reais[0].pergunta);
