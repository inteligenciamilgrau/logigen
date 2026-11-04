// BATERIA G12 — as premissas ocultas das palavras agem como se estivessem escritas?
// "Todo mamífero é um animal. Todo gato é um animal. Todo gato é um mamífero?" é um argumento
// inválido: a lógica diz "não dá para saber", e o que se sabe de gato empurra para "sim". A
// palavra real traz premissas que ninguém escreveu; a inventada não traz nenhuma. Na G11 o mundo
// só puxava contra a lógica; aqui ele puxa a favor da falácia, o caso clássico do viés de crença.
// Três versões do mesmo argumento, em 12 desafios (6 do argumento e 6 de preenchimento, para
// "não dá para saber" não virar resposta automática):
//   real       palavras reais, com a premissa oculta confirmando a conclusão → não dá para saber
//   inventada  o mesmo, com palavras inventadas                              → não dá para saber
//   premissa   a inventada com a premissa oculta escrita ("Todo gruso é um plimbo") → sim
// Se a real for respondida como a "premissa", a premissa oculta age como se estivesse escrita.
// Os gabaritos saem de um verificador: testa um elemento qualquer do grupo com o SAT do site.
// Uso: node benchmark/gerar-g12.js                         → g12/prompts/*.txt e g12/gabarito.json
//      node benchmark/gerar-g12.js corrigir <gabarito> <pasta das respostas>
const fs = require('fs'), path = require('path'), vm = require('vm');
const SAIDA = path.join(__dirname, 'g12');
const RAIZ = path.join(__dirname, '..');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'palavras.js', 'niveis.js', 'logica.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/^﻿/, ''), ctx, { filename: f });
const ev = (e) => vm.runInContext(e, ctx);
const VERSOES = ['real', 'inventada', 'premissa'];

if (process.argv[2] === 'corrigir') {
    const gabarito = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const pasta = process.argv[4];
    const notas = fs.readdirSync(pasta).sort().flatMap(arq => {
        const [config, versaoComAviso] = arq.replace('.txt', '').split('-G12-');
        const respostas = ctx.lerRespostas(fs.readFileSync(path.join(pasta, arq), 'utf8'));
        return gabarito[versaoComAviso.replace('-aviso', '')].map(it => {
            const dada = respostas.get(it.numero);
            const dita = dada === undefined ? null : ctx.lerSimNao(ctx.normalizar(dada));
            return { config, versao: versaoComAviso, ...it, dada, dita, certo: dita === it.resposta };
        });
    });
    const conta = (filtro) => { const l = notas.filter(filtro); return `${l.filter(n => n.certo).length}/${l.length}`; };
    const versoes = [...new Set(notas.map(n => n.versao))];
    console.log(['argumento (6)', ...versoes].join('\t'));
    for (const c of [...new Set(notas.map(n => n.config))]) console.log([c, ...versoes.map(v => conta(n => n.config === c && n.versao === v && n.tipo === 'alvo'))].join('\t'));
    console.log(['preenchimento', ...versoes.map(v => conta(n => n.versao === v && n.tipo !== 'alvo'))].join('\t'));
    const erros = notas.filter(n => !n.certo);
    console.log(`\n${erros.length} erros:`);
    for (const e of erros) console.log(`  ${e.config} ${e.versao} desafio ${e.numero} [${e.tipo}]: "${e.dada ?? '—'}" (lido como ${e.dita}, gabarito ${e.resposta})`);
    process.exit(0);
}

const s = ev('criarSorteio')(12012);
const lexico = ev('criarLexico')(ev('criarSorteio')(12013), 'pt');
const FRASES = ev('FRASES_SIM_NAO').pt;
const satisfazivel = ctx.satisfazivel;

const G = (palavra, genero) => ({ classe: 'substantivo', genero, palavra, plural: palavra + 's' });
const P = (palavra, genero = 'm') => ({ classe: 'nome', genero, palavra });

// [M, A, B]: "Todo M é A. Todo B é A. Todo B é M?" B é mesmo um tipo de M, mas nenhuma frase diz isso
const ARGUMENTOS = [
    [G('mamífero', 'm'), G('animal', 'm'), G('gato', 'm')], [G('inseto', 'm'), G('animal', 'm'), G('formiga', 'f')],
    [G('ave', 'f'), G('animal', 'm'), G('coruja', 'f')], [G('fruta', 'f'), G('alimento', 'm'), G('banana', 'f')],
    [G('flor', 'f'), G('planta', 'f'), G('rosa', 'f')], [G('médico', 'm'), G('profissional', 'm'), G('cardiologista', 'm')]
];
// Preenchimento em que a resposta é "sim" (cadeia válida, e o mundo concorda)
const CADEIAS = [[G('tigre', 'm'), G('felino', 'm'), G('carnívoro', 'm')], [G('carpa', 'f'), G('peixe', 'm'), G('vertebrado', 'm')], [G('pinheiro', 'm'), G('árvore', 'f'), G('vegetal', 'm')]];
// Preenchimento em que a resposta é "não", sobre um personagem (sobre um grupo, "todo C é B"
// com C vazio seria verdadeiro por vacuidade, e a resposta ficaria discutível)
const NEGACOES = [[P('Caio'), G('goleiro', 'm'), G('jogador', 'm'), G('juiz', 'm')], [P('Bruno'), G('violinista', 'm'), G('músico', 'm'), G('advogado', 'm')], [P('Pedro'), G('sargento', 'm'), G('militar', 'm'), G('padeiro', 'm')]];

// Um desafio é uma lista de regras [tipo, índice do "se", índice do "então"] sobre os grupos, um
// fato opcional e uma pergunta, sempre por índices: assim as versões têm a mesma forma
const MOLDES = {
    alvo: { regras: [['todo', 0, 1], ['todo', 2, 1]], pergunta: ['grupo', 2, 0] },
    sim: { regras: [['todo', 0, 1], ['todo', 1, 2]], pergunta: ['grupo', 0, 2] },
    nao: { regras: [['todo', 0, 1], ['nenhum', 1, 2]], fato: 0, pergunta: ['pessoa', 0, 2] }
};

// O verificador: as regras viram cláusulas sobre um elemento qualquer, que tem o grupo do fato
// (ou o grupo sujeito da pergunta). Só "sim" possível, só "não", ou os dois: "não dá para saber"
function verificar({ regras, fato, pergunta }) {
    const clausulas = regras.map(([tipo, a, b]) => tipo === 'nenhum' ? [[a, false], [b, false]] : [[a, false], [b, true]]);
    const base = [...clausulas, [[pergunta[0] === 'grupo' ? pergunta[1] : fato, true]]];
    const alvo = pergunta[2];
    const sim = satisfazivel([...base, [[alvo, true]]]), nao = satisfazivel([...base, [[alvo, false]]]);
    return sim && nao ? 'nao-da' : sim ? 'sim' : 'nao';
}

function texto(forma, grupos, pessoa, ordem) {
    const linhas = forma.regras.map(([tipo, a, b]) => {
        const modelo = { se: grupos[a], entao: grupos[b] };
        return tipo === 'nenhum' ? FRASES.nenhum(modelo) : ctx.fraseRegra(modelo, 'pt');
    });
    const fatos = forma.fato === undefined ? [] : [FRASES.fato(pessoa, grupos[forma.fato], false)];
    const [tipo, a, b] = forma.pergunta;
    const pergunta = tipo === 'grupo' ? ctx.fraseRegra({ se: grupos[a], entao: grupos[b] }, 'pt').replace(/\.$/, '?') : FRASES.pergunta(pessoa, grupos[b]);
    return [...ordem.map(i => linhas[i]), ...fatos, pergunta].join('\n');
}

// --- MONTAGEM ---
const inventados = (n) => Array.from({ length: n }, () => lexico.substantivo());
const base = [
    ...ARGUMENTOS.map(g => ({ tipo: 'alvo', real: g, inventado: inventados(3) })),
    ...CADEIAS.map(g => ({ tipo: 'sim', real: g, inventado: inventados(3) })),
    ...NEGACOES.map(([p, ...g]) => ({ tipo: 'nao', real: g, pessoaReal: p, inventado: inventados(3), pessoaInventada: lexico.nome() }))
];
const ordemDoLote = s.embaralhar(base.map((_, i) => i));
const lotes = { real: [], inventada: [], premissa: [] }, gabarito = { real: [], inventada: [], premissa: [] };

ordemDoLote.forEach((indice, posicao) => {
    const numero = posicao + 1;
    const b = base[indice];
    const molde = MOLDES[b.tipo];
    // A versão "premissa": no alvo, escreve a premissa oculta. No preenchimento "sim", tira uma
    // regra da cadeia e vira um argumento sem resposta, para o lote não ter 9 "sim"
    const comPremissa = b.tipo === 'alvo' ? { ...molde, regras: [...molde.regras, ['todo', 2, 0]] }
        : b.tipo === 'sim' ? MOLDES.alvo : molde;
    const formas = { real: molde, inventada: molde, premissa: comPremissa };
    const ordem = (forma) => s.embaralhar(forma.regras.map((_, i) => i));
    const ordemBase = ordem(molde), ordemPremissa = ordem(comPremissa);
    for (const v of VERSOES) {
        const forma = formas[v];
        const resposta = verificar(forma);
        const grupos = v === 'real' ? b.real : b.inventado;
        const pessoa = v === 'real' ? b.pessoaReal : b.pessoaInventada;
        lotes[v].push({ numero, corpo: texto(forma, grupos, pessoa, v === 'premissa' ? ordemPremissa : ordemBase) });
        gabarito[v].push({ numero, tipo: b.tipo, resposta });
    }
});

// O que cada tipo precisa dar, conferido pelo verificador acima
const ESPERADO = { real: { alvo: 'nao-da', sim: 'sim', nao: 'nao' }, inventada: { alvo: 'nao-da', sim: 'sim', nao: 'nao' }, premissa: { alvo: 'sim', sim: 'nao-da', nao: 'nao' } };
for (const v of VERSOES) for (const it of gabarito[v]) if (it.resposta !== ESPERADO[v][it.tipo]) throw new Error(`${v}, desafio ${it.numero} (${it.tipo}): o verificador deu ${it.resposta}, esperado ${ESPERADO[v][it.tipo]}`);

const PEDIDO = 'Responda esses desafios, uma resposta por linha no formato "1: resposta":';
const FIM = '\n\nImportante: não leia arquivos nem use ferramentas para resolver.';
const INSTRUCAO = { '': 'Responda só "sim", "não" ou "não dá para saber".', '-aviso': 'Responda só "sim", "não" ou "não dá para saber", considerando apenas o que as frases garantem.' };
fs.mkdirSync(path.join(SAIDA, 'prompts'), { recursive: true });
for (const v of VERSOES) for (const [sufixo, instrucao] of Object.entries(INSTRUCAO)) {
    fs.writeFileSync(path.join(SAIDA, 'prompts', `${v}${sufixo}.txt`), `${PEDIDO}\n${instrucao}\n\n${lotes[v].map(d => `Desafio ${d.numero}\n${d.corpo}`).join('\n\n')}${FIM}`);
}
fs.writeFileSync(path.join(SAIDA, 'gabarito.json'), JSON.stringify(gabarito, null, 1));
for (const v of VERSOES) {
    const n = gabarito[v].find(i => i.tipo === 'alvo').numero;
    console.log(`\n=== ${v}, desafio ${n} ===\n${lotes[v][n - 1].corpo}\n→ ${gabarito[v][n - 1].resposta}`);
    console.log('respostas do lote:', JSON.stringify(gabarito[v].reduce((c, i) => { c[i.resposta] = (c[i.resposta] ?? 0) + 1; return c; }, {})));
}
