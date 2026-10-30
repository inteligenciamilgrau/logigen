// CORREÇÃO E ANÁLISE DA BATERIA G1
// Lê benchmark/g1/respostas/<config>-<EIXO>.txt, corrige com o gabarito e mede:
//   - acerto por eixo e por nível, em cada configuração;
//   - se os modelos ficam na mesma ordem em todos os eixos (W de Kendall);
//   - a correlação entre eixos e quanto um fator só explica (1º componente principal).
// Uso: node benchmark/corrigir-g1.js <gabarito.json> [gabarito-b7.json]
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['palavras.js', 'niveis.js', 'logica.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx);
const { lerRespostas, corrigir, normalizar } = ctx;

const gabarito = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const PASTA = path.join(__dirname, 'g1', process.env.RESPOSTAS || 'respostas');
const EIXOS = (process.env.EIXOS || 'PROF,VOL,SOS,MORF,IND,INDET').split(',');
const ORDEM_CONFIGS = ['haiku-low', 'sonnet-low', 'opus-low', 'fable-low', 'haiku-max', 'sonnet-max', 'opus-max', 'fable-max'];

const NAO_DA = /nao da (para|pra) saber|nao e possivel (saber|determinar|deduzir)|impossivel (saber|determinar|deduzir)|indetermin|nao ha (como|informac)|nao se pode (saber|deduzir)/;
const palavrasDe = (t) => normalizar(t).split(/[^a-z]+/).filter(Boolean);
const cita = (palavras, chave) => palavras.some(w => w.startsWith(chave));

function corrigirItem(it, texto) {
    if (texto === undefined) return { ok: false, status: 'sem-resposta' };
    const p = palavrasDe(texto), n = normalizar(texto);
    if (it.tipo === 'cadeia') {
        const isca = it.iscas.find(k => cita(p, k));
        if (isca) return { ok: false, status: 'isca' };
        if (NAO_DA.test(n)) return { ok: false, status: 'disse-nao-da' };
        return cita(p, it.chave) ? { ok: true, status: 'certo' } : { ok: false, status: 'errado' };
    }
    if (it.tipo === 'indeterminado') {
        if (NAO_DA.test(n)) return { ok: true, status: 'certo' };
        return { ok: false, status: it.iscas.some(k => cita(p, k)) ? 'caiu-na-reciproca' : 'inventou' };
    }
    // G2: "sim", "não" ou "não dá para saber" ("não dá" vem antes, porque também começa com "não")
    if (it.tipo === 'tri') {
        const dita = NAO_DA.test(n) ? 'nao da para saber' : /^\W*sim\b/.test(n) ? 'sim' : /^\W*nao\b/.test(n) ? 'nao' : null;
        if (dita === null) return { ok: false, status: 'sem-sentido' };
        return dita === normalizar(it.resposta) ? { ok: true, status: 'certo' } : { ok: false, status: `disse-${dita.split(' ')[0]}-${dita.includes('da') ? 'da' : ''}`.replace(/-$/, '') };
    }
    if (it.tipo === 'inducao') {
        const ditos = (n.match(/\b(sim|nao)\b/g) || []).slice(0, it.resposta.split(',').length).join(', ');
        return ditos === normalizar(it.resposta) ? { ok: true, status: 'certo' } : { ok: false, status: 'errado' };
    }
    const [r] = corrigir([{ ...it, numero: 1 }], `1: ${texto}`);
    return { ok: r.status === 'certo', logica: ['certo', 'ambigua', 'flexao'].includes(r.status), status: r.status };
}

// --- Corrige tudo o que já tem resposta ---
const configs = ORDEM_CONFIGS.filter(c => EIXOS.some(e => fs.existsSync(path.join(PASTA, `${c}-${e}.txt`))));
const tabela = {};      // tabela[config][eixo] = { acertos, total, porNivel: {1: [k, n]}, status: {} }
const itens = {};       // itens[config] = vetor 0/1 de todos os itens, na ordem eixo → número
for (const c of configs) {
    tabela[c] = {}; itens[c] = [];
    for (const e of EIXOS) {
        const arq = path.join(PASTA, `${c}-${e}.txt`);
        if (!fs.existsSync(arq)) continue;
        const respostas = lerRespostas(fs.readFileSync(arq, 'utf8'));
        const t = { acertos: 0, total: 0, porNivel: {}, status: {} };
        for (const it of gabarito[e]) {
            const r = corrigirItem(it, respostas.get(it.numero));
            t.total++; t.acertos += r.ok;
            (t.porNivel[it.nivel] ??= [0, 0])[0] += r.ok; t.porNivel[it.nivel][1]++;
            t.status[r.status] = (t.status[r.status] ?? 0) + 1;
            itens[c].push({ eixo: e, numero: it.numero, nivel: it.nivel, ok: r.ok ? 1 : 0, status: r.status });
        }
        tabela[c][e] = t;
    }
}

console.log('\nACERTO POR EIXO (níveis 1 · 2 · 3)');
console.log('config'.padEnd(12) + EIXOS.map(e => e.padStart(16)).join('') + '     TOTAL');
for (const c of configs) {
    let k = 0, n = 0;
    const cel = EIXOS.map(e => {
        const t = tabela[c][e];
        if (!t) return '—'.padStart(16);
        k += t.acertos; n += t.total;
        const niv = [1, 2, 3].map(l => t.porNivel[l] ? t.porNivel[l][0] : '-').join('·');
        return `${t.acertos}/${t.total} (${niv})`.padStart(16);
    }).join('');
    console.log(c.padEnd(12) + cel + `   ${k}/${n}`);
}
console.log('\nERROS POR TIPO');
for (const c of configs) console.log(c.padEnd(12) + EIXOS.filter(e => tabela[c][e]).map(e => `${e}: ${Object.entries(tabela[c][e].status).filter(([s]) => s !== 'certo').map(([s, q]) => `${s} ${q}`).join(', ') || '—'}`).join(' | '));

// --- Estrutura: uma capacidade geral? ---
const completos = configs.filter(c => EIXOS.every(e => tabela[c][e]));
if (completos.length >= 3) {
    const X = completos.map(c => EIXOS.map(e => tabela[c][e].acertos / tabela[c][e].total));
    // W de Kendall: cada eixo ordena as configurações; W = 1 se a ordem é a mesma em todos
    const postos = (v) => { const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = Array(v.length); for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
    const m = EIXOS.length, nC = completos.length;
    const R = completos.map(() => 0);
    const variaveis = EIXOS.filter((e, j) => new Set(X.map(l => l[j])).size > 1);
    EIXOS.forEach((e, j) => postos(X.map(l => l[j])).forEach((r, i) => R[i] += r));
    const media = R.reduce((a, b) => a + b, 0) / nC;
    const S = R.reduce((a, r) => a + (r - media) ** 2, 0);
    const W = 12 * S / (m * m * (nC ** 3 - nC));
    console.log(`\nORDEM DOS MODELOS: W de Kendall = ${W.toFixed(2)} (${nC} configurações × ${m} eixos; 1 = mesma ordem em todos os eixos)`);
    console.log('soma dos postos: ' + completos.map((c, i) => `${c} ${R[i]}`).join(' · '));
    console.log(`eixos com variação entre configurações: ${variaveis.join(', ') || 'nenhum'}`);

    // Correlações de Spearman entre eixos (só os que variam) e 1º componente principal
    const pearson = (a, b) => { const ma = a.reduce((x, y) => x + y) / a.length, mb = b.reduce((x, y) => x + y) / b.length; let s = 0, sa = 0, sb = 0; a.forEach((x, i) => { s += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return s / Math.sqrt(sa * sb); };
    const col = (e) => X.map(l => l[EIXOS.indexOf(e)]);
    if (variaveis.length >= 2) {
        console.log('\nCORRELAÇÃO DE SPEARMAN ENTRE EIXOS (entre configurações)');
        const M = variaveis.map(a => variaveis.map(b => pearson(postos(col(a)), postos(col(b)))));
        console.log(''.padEnd(7) + variaveis.map(e => e.padStart(7)).join(''));
        variaveis.forEach((a, i) => console.log(a.padEnd(7) + M[i].map(v => v.toFixed(2).padStart(7)).join('')));
        const fora = M.flatMap((l, i) => l.filter((v, j) => j > i));
        console.log(`correlações positivas: ${fora.filter(v => v > 0).length} de ${fora.length} (média ${(fora.reduce((a, b) => a + b, 0) / fora.length).toFixed(2)})`);
        // Autovalor dominante da matriz de correlação (Pearson) por iteração de potência
        const C = variaveis.map(a => variaveis.map(b => pearson(col(a), col(b))));
        let v = variaveis.map(() => 1), lambda = 0;
        for (let it = 0; it < 200; it++) { const w = C.map(l => l.reduce((s, x, j) => s + x * v[j], 0)); lambda = Math.sqrt(w.reduce((s, x) => s + x * x, 0)); v = w.map(x => x / lambda); }
        console.log(`1º componente principal: ${(100 * lambda / variaveis.length).toFixed(0)}% da variância · cargas ${variaveis.map((e, j) => `${e} ${v[j].toFixed(2)}`).join(', ')}`);
    }
    // Dominância: num fator só, quem é melhor no total não deveria perder em nenhum eixo
    console.log('\nDOMINÂNCIA (A ≥ B em todos os eixos?)');
    for (let i = 0; i < nC; i++) for (let j = i + 1; j < nC; j++) {
        const a = X[i], b = X[j];
        const aGanha = a.filter((x, k) => x > b[k]).length, bGanha = b.filter((x, k) => x > a[k]).length;
        console.log(`  ${completos[i]} × ${completos[j]}: ${aGanha} eixos a favor do primeiro, ${bGanha} do segundo` + (aGanha && bGanha ? '  ← cruzamento' : ''));
    }
}

// --- Controle de lote: bateria 7 em lotes de 10 × uma janela por desafio ---
if (process.argv[3]) {
    const b7 = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const JANELA = { // resultado do Haiku low, um desafio por janela (pesquisa-dados.js, bateria 7)
        C: ['certo', 'confusao', 'certo', 'hesitou', 'certo', 'hesitou', 'certo', 'cortada', 'certo', 'certo'],
        D: ['confusao', 'certo', 'certo', 'certo', 'certo', 'certo', 'hesitou', 'confusao', 'certo', 'confusao']
    };
    for (const eixo of ['C', 'D']) {
        const arq = path.join(PASTA, `haiku-low-LOTE-${eixo}.txt`);
        if (!fs.existsSync(arq)) continue;
        const respostas = lerRespostas(fs.readFileSync(arq, 'utf8'));
        const res = Array.from({ length: 10 }, (_, k) => {
            const d = b7.find(x => x.id === `${eixo}-${k + 1}`);
            return corrigirItem({ tipo: 'cadeia', chave: d.chave, iscas: Object.keys(d.papel).filter(x => x !== d.chave) }, respostas.get(k + 1));
        });
        const janela = JANELA[eixo].map(s => s === 'certo' || s === 'hesitou');
        const iguais = res.filter((r, k) => r.ok === janela[k]).length;
        console.log(`\nLOTE ${eixo} (Haiku low): 10 num prompt ${res.filter(r => r.ok).length}/10 · um por janela ${janela.filter(Boolean).length}/10 · mesmo resultado em ${iguais} de 10`);
        console.log(`  lote:   ${res.map(r => r.status).join(' ')}\n  janela: ${JANELA[eixo].join(' ')}`);
    }
}

fs.writeFileSync(path.join(__dirname, 'g1', 'resultado.json'), JSON.stringify({ tabela, itens }, null, 1));
