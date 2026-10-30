// Bateria 6: onde a lógica do Haiku quebra?
// A = volume puro (cadeia de 3 passos + regras de ruído)
// B = o MESMO texto, letra por letra, exceto as 4 iscas, que viram sósias das palavras
//     da cadeia (uma vogal de diferença): "o Glanol" × "o Glonol", "plevendo" × "plavendo".
// Cada isca leva a um adjetivo diferente: a resposta errada mostra onde ele se confundiu.
//
// Para reproduzir: o gerador mudou depois desta bateria (o filtro de dicionário troca as
// palavras), então rode com os arquivos do commit 1c911de:
//   git worktree add ../logigen-b6 1c911de
//   copie testes/scripts/ para ../logigen-b6/testes/scripts/ e abra gerar-b6.html no navegador
// Conferido em 30/10/2026: os 18 prompts e o gabarito saem idênticos aos da bateria.
const PONTOS = [20, 100, 300];
const POR_PONTO = 3;

function distancia(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
}

// Estrutura abstrata, igual para A e B
function montarEstrutura(N, s) {
    const nos = [];
    const no = (classe, papel, extra = {}) => { nos.push({ id: nos.length, classe, papel, ...extra }); return nos.length - 1; };
    const X1 = no('nome', 'X1'), G1 = no('substantivo', 'G1'), G2 = no('substantivo', 'G2'), V1 = no('verbo', 'V1'), A1 = no('adjetivo', 'A1');
    const X1d = no('nome', 'X1*', { sosiaDe: X1 }), Gx = no('substantivo', 'grupo da isca de X1'), Ax = no('adjetivo', 'isca de X1');
    const G1d = no('substantivo', 'G1*', { sosiaDe: G1 }), Ag1 = no('adjetivo', 'isca de G1');
    const G2d = no('substantivo', 'G2*', { sosiaDe: G2 }), Ag2 = no('adjetivo', 'isca de G2');
    const V1d = no('verbo', 'V1*', { sosiaDe: V1 }), Av1 = no('adjetivo', 'isca de V1');
    const A1d = no('adjetivo', 'A1*', { sosiaDe: A1 });
    const regras = [[G1, G2], [G2, V1], [V1, A1], [Gx, Ax], [G1d, Ag1], [G2d, Ag2], [V1d, Av1]];
    const fatos = [[X1, G1], [X1d, Gx]];

    const M = Math.max(4, Math.round((N - regras.length) * 0.7));
    const ruido = [];
    for (let i = 0; i < M; i++) {
        const r = s.numero();
        ruido.push(no(r < 0.5 ? 'substantivo' : r < 0.75 ? 'adjetivo' : 'verbo', 'ruído'));
    }
    // O ruído só aponta PARA a cadeia e as iscas; delas não sai nada além do previsto
    const alvosExtras = [G1, G2, V1, A1, G1d, G2d, V1d, A1d, Gx];
    const existe = new Set(regras.map(([a, b]) => `${a}>${b}`));
    const ligar = (a, b) => {
        const k = `${a}>${b}`;
        if (a === b || existe.has(k)) return;
        existe.add(k);
        regras.push([a, b]);
    };
    ligar(ruido[0], A1d);
    for (let i = 1; i < M && regras.length < N; i++) ligar(ruido[Math.floor(s.numero() * i)], ruido[i]);
    while (regras.length < N) {
        const i = Math.floor(s.numero() * (M - 1));
        const b = s.chance(0.15) ? s.item(alvosExtras) : ruido[i + 1 + Math.floor(s.numero() * (M - 1 - i))];
        ligar(ruido[i], b);
    }
    const K = Math.max(2, Math.round(N / 30));
    for (let k = 0; k < K; k++) fatos.push([no('nome', 'ruído'), s.item(ruido)]);
    return { nos, regras, fatos, X1, A1 };
}

// Troca as letras por palavras. A e B usam a mesma semente: as palavras que não são
// isca saem idênticas; as iscas saem novas (A) ou sósias (B).
function vestir(est, comSosias, sPal, sSos) {
    const lex = criarLexico(sPal);
    const usadas = [];
    const longe = (chave, min, exceto) => usadas.every(u => u === exceto || distancia(u, chave) >= min);
    const novo = (classe, genero) => {
        for (let t = 0; t < 5000; t++) {
            const p = classe === 'nome' ? lex.nome(genero) : lex[classe]();
            if (longe(p.chave, 3)) { usadas.push(p.chave); return p; }
        }
        throw new Error('sem palavra');
    };
    const sosia = (p) => {
        let raiz, montar;
        if (p.classe === 'substantivo') {
            raiz = p.chave;
            const fim = p.palavra.slice(raiz.length);
            montar = r => ({ ...p, chave: r, palavra: r + fim, plural: r + fim + 's' });
        } else if (p.classe === 'verbo') {
            raiz = p.chave;
            const f = (w) => w.slice(raiz.length);
            montar = r => ({ ...p, chave: r, infinitivo: r + f(p.infinitivo), presente: r + f(p.presente), plural: r + f(p.plural), gerundio: r + f(p.gerundio) });
        } else if (p.classe === 'adjetivo') {
            const suf = SUFIXOS_ADJETIVO.find(x => p.m.endsWith(x.m));
            raiz = p.m.slice(0, -suf.m.length);
            montar = r => ({ ...p, chave: r + suf.m.slice(0, -1), m: r + suf.m, f: r + suf.f, mp: r + suf.m + 's', fp: r + suf.f + 's' });
        } else {
            const fim = FINAIS_NOME[p.genero].find(f => p.chave.endsWith(f));
            raiz = p.chave.slice(0, -fim.length);
            montar = r => ({ ...p, chave: r + fim, palavra: (r + fim)[0].toUpperCase() + (r + fim).slice(1) });
        }
        const opcoes = [];
        for (let i = 0; i < raiz.length; i++) {
            if ('aeiou'.includes(raiz[i])) for (const v of 'aeiou') if (v !== raiz[i]) opcoes.push(raiz.slice(0, i) + v + raiz.slice(i + 1));
        }
        for (const r of sSos.embaralhar(opcoes)) {
            const q = montar(r);
            if (usadas.some(u => u.includes(q.chave) || q.chave.includes(u))) continue;
            if (!longe(q.chave, 2, p.chave)) continue;
            usadas.push(q.chave);
            return q;
        }
        throw new Error('sem sósia para ' + p.chave);
    };
    const palavra = [];
    for (const n of est.nos) if (n.sosiaDe === undefined) palavra[n.id] = novo(n.classe);
    for (const n of est.nos) if (n.sosiaDe !== undefined) {
        const orig = palavra[n.sosiaDe];
        palavra[n.id] = comSosias ? sosia(orig) : novo(n.classe, orig.genero);
    }
    return palavra;
}

function montar(N, i, comSosias) {
    const base = N * 10 + i;
    const est = montarEstrutura(N, criarSorteio(600000 + base));
    const palavra = vestir(est, comSosias, criarSorteio(700000 + base), criarSorteio(800000 + base));
    const modelo = {
        regras: est.regras.map(([a, b]) => ({ se: palavra[a], entao: palavra[b] })),
        fatos: est.fatos.map(([x, p]) => ({ sujeitos: [palavra[x]], predicado: palavra[p] }))
    };
    const X1 = palavra[est.X1], A1 = palavra[est.A1];
    // Solucionador: o único adjetivo dedutível para X1 é A1, em 3 passos
    const conc = deduzir(modelo, X1);
    const adjetivos = est.nos.filter(n => n.classe === 'adjetivo').map(n => palavra[n.id]);
    const achados = adjetivos.filter(a => conc.has(a.chave));
    if (achados.length !== 1 || achados[0] !== A1) throw new Error(`${N}/${i}: respostas ${achados.map(a => a.m)}`);
    if (conc.get(A1.chave).passos !== 3) throw new Error(`${N}/${i}: passos ${conc.get(A1.chave).passos}`);

    const sTexto = criarSorteio(900000 + base);
    const linhas = [...sTexto.embaralhar(modelo.regras).map(fraseRegra), ...sTexto.embaralhar(modelo.fatos).map(fraseFato)];
    const pergunta = frasePergunta([X1], 'é', 'adjetivo');
    const corpo = `${linhas.join('\n')}\n${pergunta}`;
    const { forma } = flexionar(A1, 'é', [X1]);
    const papel = {};
    est.nos.forEach(n => { if (n.classe === 'adjetivo') papel[palavra[n.id].chave] = n.papel; });
    const sosias = est.nos.filter(n => n.sosiaDe !== undefined)
        .map(n => `${n.papel}: ${formaDicionario(palavra[n.sosiaDe])} × ${formaDicionario(palavra[n.id])}`);
    return {
        id: `${comSosias ? 'B' : 'A'}${N}-${i}`, eixo: comSosias ? 'B' : 'A', N, i,
        prompt: `Responda esse desafio:\n\n${corpo}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`,
        resposta: forma, chave: A1.chave, papel, sosias, regras: est.regras.length, fatos: est.fatos.length,
        palavras: corpo.split(/\s+/).length
    };
}

const lista = [];
for (const N of PONTOS) for (let i = 1; i <= POR_PONTO; i++) for (const b of [false, true]) lista.push(montar(N, i, b));
document.getElementById('prompts').textContent = lista.map(d => `=== ${d.id} ===\n${d.prompt}`).join('\n');
document.getElementById('gabarito').textContent = JSON.stringify(lista.map(({ prompt, ...resto }) => resto), null, 1);
