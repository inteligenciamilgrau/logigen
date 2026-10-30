// TESTE DO WUG DO GERÚNDIO
// Com a dica de flexão, Haiku e Sonnet low acertaram o gênero mas continuaram respondendo o
// presente ("bronhanda") onde a frase pede o gerúndio ("A X está ___?" → "bronhandando").
// Pergunta: é porque o verbo é inventado, ou porque a construção "está ___" é lida de outro jeito?
// Os mesmos 6 desafios de gerúndio em duas versões: palavras inventadas e palavras reais
// (o modo "Palavras reais" do site, palavras-reais.js). Nenhuma dica de flexão nas duas.
// Uso: node benchmark/gerar-gerundio.js → benchmark/g5/prompts/GER-inventadas.txt, GER-reais.txt
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'g5');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
const { gerarLote, versaoComPalavrasReais } = ctx;

const todos = [1, 2, 3].flatMap(n => gerarLote(n, 40, 95000 + n));
const gerundios = todos.filter(d => d.flexao === 'gerúndio');
const escolhidos = Array.from({ length: 6 }, (_, k) => gerundios[Math.floor(k * gerundios.length / 6)]);
const corpo = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}`;
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
const gabarito = {};
for (const [nome, versao] of [['inventadas', d => d], ['reais', versaoComPalavrasReais]]) {
    const itens = escolhidos.map((d, k) => ({ numero: k + 1, d: versao(d) }));
    const prompt = 'Responda esses desafios, uma resposta por linha no formato "1: resposta":\n\n' +
        itens.map(({ numero, d }) => `Desafio ${numero}\n${corpo(d)}`).join('\n\n') +
        '\n\nImportante: não leia arquivos nem use ferramentas para resolver.';
    fs.writeFileSync(path.join(SAIDA, 'prompts', `GER-${nome}.txt`), prompt);
    gabarito[nome] = itens.map(({ numero, d }) => ({ numero, resposta: d.resposta, pergunta: d.pergunta.texto }));
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
console.log(`${escolhidos.length} desafios de gerúndio (de ${gerundios.length} no lote)`);
for (const k of [0, 1]) console.log(`  ${gabarito.inventadas[k].pergunta} → ${gabarito.inventadas[k].resposta}   |   ${gabarito.reais[k].pergunta} → ${gabarito.reais[k].resposta}`);
