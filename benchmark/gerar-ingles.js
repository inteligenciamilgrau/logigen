// TESTE DO WUG EM INGLÊS — a concordância ao contrário
// Em português, o plural ACRESCENTA ("glovunda" → "glovundam"); em inglês, o verbo no plural
// PERDE o -s ("Every blick florps" → "Zorin and Tala florp"), e o -s marca o singular
// ("he dances"). Adjetivos não flexionam. Quem só copia a forma da regra acerta o singular e
// erra o plural e o gerúndio; quem aplica "plural leva S" erra o plural ao contrário.
//   2 verbos no singular ("Zorin ___?" → "florps")
//   2 verbos no plural ("Zorin and Tala ___?" → "florp")
//   2 gerúndios ("What is Zorin doing? Zorin is ___?" → "florping")
// Duas versões: palavras inventadas e palavras reais (palavras-reais.js, inglês).
// Uso: node benchmark/gerar-ingles.js → benchmark/g7/prompts/EN-*.txt e benchmark/g7/gabarito.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g7');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'dicionario-en.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { gerarLote, versaoComPalavrasReais } = ctx;

const todos = [1, 2, 3].flatMap(n => gerarLote(n, 60, 97000 + n, 'en'));
// O gerador não faz pergunta de verbo no singular (nem em português): o verbo só é perguntado
// com sujeito plural ("Zorin and Tala ___?") ou no gerúndio. Ficam 4 plurais e 2 gerúndios.
const pega = (flexao, n) => {
    const ok = todos.filter(d => d.flexao === flexao);
    if (ok.length < n) throw new Error(`poucos desafios de ${flexao}`);
    return Array.from({ length: n }, (_, k) => ok[Math.floor(k * ok.length / n)]);
};
const plurais = pega('present, they', 4).map(d => ({ tipo: 'plural (sem -s)', d }));
const gerundios = pega('gerund (-ing)', 2).map(d => ({ tipo: 'gerúndio (-ing)', d }));
const ordem = [plurais[0], gerundios[0], plurais[1], plurais[2], gerundios[1], plurais[3]];
const corpo = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}`;
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
const gabarito = {};
for (const [nome, versao] of [['inventadas', d => d], ['reais', versaoComPalavrasReais]]) {
    const itens = ordem.map(({ tipo, d }, k) => ({ numero: k + 1, tipo, d: versao(d) }));
    const prompt = 'Answer these challenges, one answer per line in the format "1: answer":\n\n' +
        itens.map(({ numero, d }) => `Challenge ${numero}\n${corpo(d)}`).join('\n\n') +
        '\n\nImportant: do not read files or use tools to solve.';
    fs.writeFileSync(path.join(SAIDA, 'prompts', `EN-${nome}.txt`), prompt);
    gabarito[nome] = itens.map(({ numero, tipo, d }) => ({ numero, tipo, resposta: d.resposta, pergunta: d.pergunta.texto }));
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
for (let k = 0; k < 6; k++) console.log(`${k + 1} [${gabarito.inventadas[k].tipo}] ${gabarito.inventadas[k].pergunta} → ${gabarito.inventadas[k].resposta}   |   ${gabarito.reais[k].pergunta} → ${gabarito.reais[k].resposta}`);
