// CORREÇÃO DOS TESTES DE FLEXÃO (gerúndio, plural): forma exata, lado a lado com o gabarito.
// Lê <pasta>/<config>-<PREFIXO>-<versão>.txt; a versão escolhe a parte do gabarito
// ("exemplo" usa o gabarito das inventadas, porque os desafios são os mesmos).
// Uso: node benchmark/corrigir-formas.js <gabarito.json> <pasta das respostas> <PREFIXO>
const fs = require('fs'), path = require('path');
const [arqGabarito, pasta, prefixo] = process.argv.slice(2);
const gabarito = JSON.parse(fs.readFileSync(arqGabarito, 'utf8'));
const lerRespostas = (texto) => new Map(texto.split(/\r?\n/).map(l => l.match(/^\s*(\d+)\s*:\s*(.+?)\s*$/)).filter(Boolean).map(m => [+m[1], m[2]]));
const arquivos = fs.readdirSync(pasta).filter(a => a.includes(`-${prefixo}-`)).sort();
for (const arq of arquivos) {
    const [config, versao] = arq.replace('.txt', '').split(`-${prefixo}-`);
    const itens = gabarito[versao.startsWith('exemplo') ? 'inventadas' : versao];
    const respostas = lerRespostas(fs.readFileSync(path.join(pasta, arq), 'utf8'));
    const linhas = itens.map(it => {
        const dada = respostas.get(it.numero) ?? '—';
        return { ok: dada.toLowerCase() === it.resposta.toLowerCase(), texto: `${it.numero} ${it.tipo ?? ''}: ${dada} ${dada.toLowerCase() === it.resposta.toLowerCase() ? '✓' : `✗ (esperado ${it.resposta})`}` };
    });
    console.log(`\n${config} · ${versao}: ${linhas.filter(l => l.ok).length}/${linhas.length}`);
    linhas.filter(l => !l.ok).forEach(l => console.log(`   ${l.texto}`));
}
