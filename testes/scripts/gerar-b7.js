// Bateria 7: sósias perto do português confundem mais que sósias limpas?
// Mesma montagem da bateria 6 (eixo B), com 20 regras. As palavras comuns já passam pelo
// filtro de dicionário do palavras.js. Pares C/D com o MESMO texto, exceto as 4 sósias
// (personagem, G1, G2, V1):
//   C = sósia limpa: nenhuma forma a 1 letra do português
//   D = sósia perto: a forma que aparece no texto fica a 1 letra (ou menos) de uma palavra real
// A sósia da resposta (A1*) é limpa e igual nos dois.
//
// Para reproduzir: rode com os arquivos do commit 31b19d8, o do filtro de dicionário. Depois
// dele o dicionário passou a se chamar DICIONARIOS.pt, e este script deixa de rodar:
//   git worktree add ../logigen-b7 31b19d8
//   copie testes/scripts/ para ../logigen-b7/testes/scripts/ e abra gerar-b7.html no navegador
// Conferido em 30/10/2026: os 20 prompts e o gabarito saem idênticos aos da bateria.
const N = 20;
const PARES = 10;

function distancia(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
}

function vizinhoReal(forma) {
    const w = forma.toLowerCase();
    if (DICIONARIO.has(w)) return w;
    for (let i = 0; i <= w.length; i++) {
        const a = w.slice(0, i), b = w.slice(i);
        if (i < w.length && DICIONARIO.has(a + b.slice(1))) return a + b.slice(1);
        for (const c of ALFABETO) {
            if (DICIONARIO.has(a + c + b)) return a + c + b;
            if (i < w.length && c !== w[i] && DICIONARIO.has(a + c + b.slice(1))) return a + c + b.slice(1);
        }
    }
    return null;
}

// A forma que aparece no texto (personagem único, regras no singular, verbo no presente)
const formaNoTexto = (p) => p.classe === 'verbo' ? p.presente : p.classe === 'adjetivo' ? p.m : p.palavra;

function montarEstrutura(s) {
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
    for (let k = 0; k < 2; k++) fatos.push([no('nome', 'ruído'), s.item(ruido)]);
    return { nos, regras, fatos, X1, A1 };
}

// Todas as sósias possíveis de uma palavra: troca de uma vogal do radical (nunca a terminação)
function opcoesDeSosia(p) {
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
        if ('aeiou'.includes(raiz[i])) for (const v of 'aeiou') if (v !== raiz[i]) opcoes.push(montar(raiz.slice(0, i) + v + raiz.slice(i + 1)));
    }
    return opcoes;
}
const ehLimpa = (q) => formasEscritas(q).every(f => !vizinhoReal(f));
const ehPerto = (q) => !!vizinhoReal(formaNoTexto(q));

function vestir(est, perto, sPal, sSos) {
    const lex = criarLexico(sPal);
    const usadas = [];
    const longe = (chave, min, exceto) => usadas.every(u => u === exceto || distancia(u, chave) >= min);
    const cabe = (q, orig) => !usadas.some(u => u !== orig.chave && (u.includes(q.chave) || q.chave.includes(u))) && longe(q.chave, 2, orig.chave);
    const novo = (classe, comSosia) => {
        for (let t = 0; t < 5000; t++) {
            const p = lex[classe]();
            if (!longe(p.chave, 3)) continue;
            // Palavra da cadeia: precisa ter sósia limpa E sósia perto, para o par C/D existir
            if (comSosia) {
                const ops = opcoesDeSosia(p);
                if (!ops.some(ehLimpa) || !ops.some(ehPerto)) continue;
            }
            usadas.push(p.chave);
            return p;
        }
        throw new Error('sem palavra');
    };
    const temSosia = new Set(est.nos.filter(n => n.sosiaDe !== undefined).map(n => n.sosiaDe));
    const palavra = [];
    for (const n of est.nos) if (n.sosiaDe === undefined) palavra[n.id] = novo(n.classe, temSosia.has(n.id) && n.papel !== 'A1');
    // Sorteio das sósias: a ordem das opções vem de sSos (igual em C e D); C pega a 1ª limpa, D a 1ª perto
    for (const n of est.nos) if (n.sosiaDe !== undefined) {
        const orig = palavra[n.sosiaDe];
        const ops = sSos.embaralhar(opcoesDeSosia(orig)).filter(q => cabe(q, orig));
        const quer = n.papel === 'A1*' || !perto ? ehLimpa : ehPerto;
        const q = ops.find(quer);
        if (!q) throw new Error('sem sósia para ' + orig.chave);
        usadas.push(q.chave);
        palavra[n.id] = q;
    }
    return palavra;
}

function montar(i, perto) {
    const est = montarEstrutura(criarSorteio(610000 + i));
    const palavra = vestir(est, perto, criarSorteio(710000 + i), criarSorteio(810000 + i));
    const modelo = {
        regras: est.regras.map(([a, b]) => ({ se: palavra[a], entao: palavra[b] })),
        fatos: est.fatos.map(([x, p]) => ({ sujeitos: [palavra[x]], predicado: palavra[p] }))
    };
    const X1 = palavra[est.X1], A1 = palavra[est.A1];
    const conc = deduzir(modelo, X1);
    const adjetivos = est.nos.filter(n => n.classe === 'adjetivo').map(n => palavra[n.id]);
    const achados = adjetivos.filter(a => conc.has(a.chave));
    if (achados.length !== 1 || achados[0] !== A1) throw new Error(`${i}: respostas ${achados.map(a => a.m)}`);
    if (conc.get(A1.chave).passos !== 3) throw new Error(`${i}: passos ${conc.get(A1.chave).passos}`);
    // As palavras comuns precisam estar todas limpas (filtro do palavras.js)
    const sujas = est.nos.filter(n => n.sosiaDe === undefined && !ehLimpa(palavra[n.id])).map(n => formaNoTexto(palavra[n.id]));
    if (sujas.length) throw new Error(`${i}: palavras comuns perto do português: ${sujas}`);

    const sTexto = criarSorteio(910000 + i);
    const linhas = [...sTexto.embaralhar(modelo.regras).map(fraseRegra), ...sTexto.embaralhar(modelo.fatos).map(fraseFato)];
    const corpo = `${linhas.join('\n')}\n${frasePergunta([X1], 'é', 'adjetivo')}`;
    const papel = {};
    est.nos.forEach(n => { if (n.classe === 'adjetivo') papel[palavra[n.id].chave] = n.papel; });
    const sosias = est.nos.filter(n => n.sosiaDe !== undefined).map(n => {
        const q = palavra[n.id], r = vizinhoReal(formaNoTexto(q));
        return `${n.papel}: ${formaNoTexto(palavra[n.sosiaDe])} × ${formaNoTexto(q)}${r ? ' (perto de "' + r + '")' : ''}`;
    });
    return {
        id: `${perto ? 'D' : 'C'}-${i}`, eixo: perto ? 'D' : 'C', i,
        prompt: `Responda esse desafio:\n\n${corpo}\n\nImportante: não leia arquivos nem use ferramentas para resolver.`,
        resposta: flexionar(A1, 'é', [X1]).forma, chave: A1.chave, papel, sosias
    };
}

const lista = [];
for (let i = 1; i <= PARES; i++) for (const perto of [false, true]) lista.push(montar(i, perto));
document.getElementById('prompts').textContent = lista.map(d => `=== ${d.id} ===\n${d.prompt}`).join('\n');
document.getElementById('gabarito').textContent = JSON.stringify(lista.map(({ prompt, ...resto }) => resto), null, 1);
