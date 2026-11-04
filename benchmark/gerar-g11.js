// BATERIA G11 — a lógica depende do sentido das palavras?
// Doze desafios do nível 4 em cinco versões, com a mesma lógica e a mesma ordem das frases:
// palavras inventadas (o controle, sem sentido nenhum) e palavras reais nos níveis de absurdo
// 0, 1, 2 e 3 do medidor de palavras-reais.js. Se a lógica é abstrata, o acerto fica igual nas
// cinco; se depende do mundo, ele cai quando as frases brigam com o que o modelo sabe ("Toda
// lula é um rato. Todo rato é um cavalo. A Júlia é uma lula. A Júlia é um cavalo?" → sim).
// Os prompts principais não trazem o aviso "considerando apenas o que as frases garantem", que
// todas as baterias anteriores tinham: ele pode esconder o efeito. Os arquivos "-aviso" trazem.
// O nível vale para as regras, conferidas uma a uma pelo medidor. O fato sobre o personagem é
// contingente, então fica no nível 1, ou no 2 quando o grupo não é de gente ("A Júlia é uma lula").
// Uso: node benchmark/gerar-g11.js                         → g11/prompts/*.txt e g11/gabarito.json
//      node benchmark/gerar-g11.js corrigir <gabarito> <pasta das respostas>
const fs = require('fs'), path = require('path'), vm = require('vm');
const SAIDA = path.join(__dirname, 'g11');
const RAIZ = path.join(__dirname, '..');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/^﻿/, ''), ctx, { filename: f });
const ev = (e) => vm.runInContext(e, ctx);
const VERSOES = ['inventadas', 'nivel-0', 'nivel-1', 'nivel-2', 'nivel-3'];
const VARIANTES = ['cadeia · sim', 'contraposição · não', 'afirmar o consequente · não dá', 'negar o antecedente · não dá'];

if (process.argv[2] === 'corrigir') {
    const { itens } = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const pasta = process.argv[4];
    const arquivos = fs.readdirSync(pasta).sort();
    const notas = arquivos.flatMap(arq => {
        const [config, versao] = arq.replace('.txt', '').split('-G11-');
        const respostas = ctx.lerRespostas(fs.readFileSync(path.join(pasta, arq), 'utf8'));
        return itens.map(it => {
            const dada = respostas.get(it.numero);
            const dita = dada === undefined ? null : ctx.lerSimNao(ctx.normalizar(dada));
            return { config, versao, ...it, dada, dita, certo: dita === it.resposta };
        });
    });
    const conta = (filtro) => { const l = notas.filter(filtro); return `${l.filter(n => n.certo).length}/${l.length}`; };
    const versoes = [...new Set(notas.map(n => n.versao))].sort((a, b) => a.localeCompare(b));
    const configs = [...new Set(notas.map(n => n.config))];
    console.log(['', ...versoes].join('\t'));
    for (const c of configs) console.log([c, ...versoes.map(v => conta(n => n.config === c && n.versao === v))].join('\t'));
    console.log(['total', ...versoes.map(v => conta(n => n.versao === v))].join('\t'));
    console.log('\npor variante:');
    for (const v of VARIANTES) console.log([v, ...versoes.map(x => conta(n => n.variante === v && n.versao === x))].join('\t'));
    const erros = notas.filter(n => !n.certo);
    console.log(`\n${erros.length} erros:`);
    for (const e of erros) console.log(`  ${e.config} ${e.versao} desafio ${e.numero} [${e.variante}]: "${e.dada ?? '—'}" (lido como ${e.dita}, gabarito ${e.resposta})`);
    process.exit(0);
}

// --- PALAVRAS ---
const { absurdoDoPar, remontarFrases, pluralPt, seRelacionam } = { absurdoDoPar: ev('absurdoDoPar'), remontarFrases: ev('remontarFrases'), pluralPt: ev('pluralPt'), seRelacionam: ev('seRelacionam') };
const REAIS = ev('PALAVRAS_REAIS').pt;
const doSite = (id) => REAIS.substantivo.find(p => p.id === id);

// Nível 0: cadeias que o mundo confirma, com pessoas. O vocabulário do site não tem profundidade
// para isso (ele evita de propósito palavras relacionadas no mesmo desafio)
const pessoa = (m, f, e, plural) => ({ classe: 'substantivo', genero: 'm', id: m, tipo: 'humano', e, palavra: m, plural: plural ?? pluralPt(m), f: f ?? m, fp: pluralPt(f ?? m) });
const TAXONOMIA = Object.fromEntries([
    pessoa('profissional', null, [], 'profissionais'),
    pessoa('médico', 'médica', ['profissional']), pessoa('cardiologista', null, ['médico', 'profissional']),
    pessoa('dermatologista', null, ['médico', 'profissional']), pessoa('pediatra', null, ['médico', 'profissional']),
    pessoa('artista', null, []), pessoa('músico', 'musicista', ['artista']),
    pessoa('violinista', null, ['músico', 'artista']), pessoa('baterista', null, ['músico', 'artista']),
    pessoa('atleta', null, []), pessoa('jogador', 'jogadora', ['atleta']),
    pessoa('goleiro', 'goleira', ['jogador', 'atleta']), pessoa('zagueiro', 'zagueira', ['jogador', 'atleta']),
    pessoa('militar', null, []), pessoa('sargento', null, ['militar']), pessoa('tenente', null, ['militar']),
    pessoa('escritor', 'escritora', []), pessoa('romancista', null, ['escritor']), pessoa('poeta', 'poetisa', ['escritor'])
].map(p => [p.id, p]));
const T = (...ids) => ids.map(id => TAXONOMIA[id]);
const CADEIAS_0 = [T('cardiologista', 'médico', 'profissional'), T('violinista', 'músico', 'artista'), T('goleiro', 'jogador', 'atleta'),
    T('dermatologista', 'médico', 'profissional'), T('baterista', 'músico', 'artista'), T('zagueiro', 'jogador', 'atleta')];
const LEQUES_0 = [T('cardiologista', 'médico', 'pediatra'), T('violinista', 'músico', 'baterista'), T('goleiro', 'jogador', 'zagueiro')];
const PARES_0 = [T('dermatologista', 'médico'), T('baterista', 'músico'), T('zagueiro', 'jogador')];
const DISTRACAO_0 = [T('sargento', 'militar'), T('romancista', 'escritor'), T('tenente', 'militar'), T('poeta', 'escritor')];

const s = ev('criarSorteio')(11011);
const lexico = ev('criarLexico')(ev('criarSorteio')(11012), 'pt');
const HUMANOS = REAIS.substantivo.filter(p => p.tipo === 'humano');
const ANIMAIS = REAIS.substantivo.filter(p => p.tipo === 'animal');
const ABSTRATOS = REAIS.substantivo.filter(p => p.tipo === 'abstrato');
// Sorteia de uma lista sem repetir até ela acabar
function sacola(lista) {
    let resto = [];
    return () => { if (!resto.length) resto = s.embaralhar(lista); return resto.pop(); };
}
const humano = sacola(HUMANOS), animal = sacola(ANIMAIS), abstrato = sacola(ABSTRATOS);
// Pessoas sem relação entre si, como no site
function semRelacao(n) {
    const grupo = [];
    while (grupo.length < n) { const p = humano(); if (!grupo.some(g => g === p || seRelacionam(g, p))) grupo.push(p); }
    return grupo;
}
function especies(n) {
    const grupo = [];
    while (grupo.length < n) { const p = animal(); if (!grupo.includes(p)) grupo.push(p); }
    return grupo;
}

// As palavras de cada nível, por papel: cadeia (G1 → G2 → G3), leque (G1 → G2 ← G3), par (G1 → G2)
// e distração (G4 → G5). No nível 2, cada regra cruza tipos que não se encaixam
const PALAVRAS_DO_NIVEL = {
    1: { cadeia: () => semRelacao(3), leque: () => semRelacao(3), par: () => semRelacao(2), distracao: () => semRelacao(2) },
    2: { cadeia: () => [humano(), abstrato(), animal()], leque: () => [humano(), abstrato(), animal()], par: () => [humano(), abstrato()], distracao: () => [humano(), abstrato()] },
    3: { cadeia: () => especies(3), leque: () => especies(3), par: () => especies(2), distracao: () => especies(2) }
};
const giro = (lista) => { let i = 0; return () => lista[i++ % lista.length]; };
PALAVRAS_DO_NIVEL[0] = { cadeia: giro(CADEIAS_0), leque: giro(LEQUES_0), par: giro(PARES_0), distracao: giro(DISTRACAO_0) };

const LETRAS_DA_VARIANTE = {
    'cadeia · sim': ['cadeia', ['G1', 'G2', 'G3']], 'contraposição · não': ['cadeia', ['G1', 'G2', 'G3']],
    'afirmar o consequente · não dá': ['leque', ['G1', 'G2', 'G3']], 'negar o antecedente · não dá': ['par', ['G1', 'G2']]
};

// Nomes reais, sem repetir no desafio; o gênero é o do personagem inventado
const nomes = { m: sacola(REAIS.nome.m), f: sacola(REAIS.nome.f) };

function palavrasDoNivel(d, nivel, nomesDoDesafio) {
    const fontes = PALAVRAS_DO_NIVEL[nivel];
    const [papel, letras] = LETRAS_DA_VARIANTE[d.variante];
    const palavra = { ...nomesDoDesafio };
    const principais = fontes[papel]();
    principais.forEach((p, i) => { palavra[letras[i]] = p; });
    // A distração não pode tocar a cadeia principal: uma palavra repetida mudaria a lógica. No
    // nível 3 todas as espécies se excluem, então ali só vale não repetir
    const toca = (a, b) => a === b || (nivel !== 3 && seRelacionam(a, b));
    let distracao = fontes.distracao();
    while (distracao.some(p => principais.some(q => toca(p, q)))) distracao = fontes.distracao();
    distracao.forEach((p, i) => { palavra[['G4', 'G5'][i]] = p; });
    const grupos = Object.keys(palavra).filter(l => l[0] === 'G').map(l => palavra[l]);
    if (new Set(grupos).size !== grupos.length) throw new Error(`palavra repetida no desafio ${d.numero}, nível ${nivel}`);
    // O medidor confere cada regra: é ele quem garante o nível da versão
    for (const r of ev('esqueletoDe')(4, d.variante).regras) {
        const medido = absurdoDoPar(palavra[r.se], palavra[r.entao]);
        if (medido !== nivel) throw new Error(`"${palavra[r.se].palavra} é ${palavra[r.entao].palavra}" deu ${medido}, a versão pede ${nivel}`);
    }
    return palavra;
}

// --- DESAFIOS ---
const ordem = s.embaralhar(VARIANTES.flatMap(v => [v, v, v]));
const base = ordem.map((variante, i) => ctx.montarDesafio(4, s, lexico, i + 1, 'pt', { variante }));
const textos = Object.fromEntries(VERSOES.map(v => [v, []]));
for (const d of base) {
    textos.inventadas.push(d);
    const escolhidos = Object.fromEntries(Object.keys(d.palavras).filter(l => l[0] === 'X').map(l => [l, nomes[d.palavras[l].genero]()]));
    for (const nivel of [0, 1, 2, 3]) {
        const palavra = palavrasDoNivel(d, nivel, escolhidos);
        textos[`nivel-${nivel}`].push({ ...d, ...remontarFrases(d, palavra) });
    }
}

const CANONICA = ev('CANONICA_SIM_NAO');
const corpo = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}`;
const PEDIDO = 'Responda esses desafios, uma resposta por linha no formato "1: resposta":';
const FIM = '\n\nImportante: não leia arquivos nem use ferramentas para resolver.';
const INSTRUCAO = { '': 'Responda só "sim", "não" ou "não dá para saber".', '-aviso': 'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem.' };
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
for (const [versao, lista] of Object.entries(textos)) for (const [sufixo, instrucao] of Object.entries(INSTRUCAO)) {
    fs.writeFileSync(path.join(SAIDA, 'prompts', `${versao}${sufixo}.txt`), `${PEDIDO}\n${instrucao}\n\n${lista.map(d => `Desafio ${d.numero}\n${corpo(d)}`).join('\n\n')}${FIM}`);
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify({ itens: base.map(d => ({ numero: d.numero, variante: d.variante, resposta: CANONICA[Object.entries(ev('RESPOSTAS_SIM_NAO').pt).find(([, r]) => r === d.resposta)[0]] })) }, null, 1));
for (const v of VERSOES) console.log(`\n=== ${v} ===\n${corpo(textos[v][0])}\n→ ${base[0].resposta}`);
console.log(`\n${base.length} desafios: ${VARIANTES.map(v => `${base.filter(d => d.variante === v).length} ${v}`).join(' · ')}`);
