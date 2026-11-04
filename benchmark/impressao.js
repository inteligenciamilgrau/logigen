// IMPRESSÃO DIGITAL DO GERADOR
// Um resumo dos lotes de cada nível, com semente fixa, por versão do site (impressoes.json). É o
// que garante o número da versão: se o gerador mudar e a versão não, este script acusa, e um
// relatório não vai dizer "versão 1.2" sobre lotes que a 1.2 não gera. Rodar antes de cada commit
// que mexa em niveis.js, logica.js, palavras.js ou palavras-reais.js. As regras estão em CHANGELOG.md.
// "prompt" cobre o que a IA recebe; "reais" cobre o modo palavras reais.
// Uso: node benchmark/impressao.js
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const RAIZ = path.join(__dirname, '..');
const ARQUIVO = path.join(__dirname, 'impressoes.json');
const ctx = vm.createContext({ console }); ctx.window = ctx;
for (const f of ['dicionario.js', 'dicionario-en.js', 'palavras.js', 'niveis.js', 'logica.js', 'palavras-reais.js']) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/^﻿/, ''), ctx, { filename: f });
const VERSAO = vm.runInContext('VERSAO', ctx);
const NIVEIS = vm.runInContext('NIVEIS', ctx);

const resumo = (texto) => crypto.createHash('sha256').update(texto).digest('hex').slice(0, 12);
const atual = {};
for (const nivel of Object.keys(NIVEIS)) {
    const lotes = ['pt', 'en'].map(idioma => ctx.gerarLote(+nivel, 20, 20261104, idioma));
    atual[nivel] = {
        prompt: resumo(lotes.map(l => ctx.montarPrompt(l) + JSON.stringify(l.map(d => d.resposta))).join('\n')),
        reais: resumo(lotes.map(l => ctx.montarPrompt(l.map(d => ctx.versaoComPalavrasReais(d)))).join('\n'))
    };
}

const registradas = fs.existsSync(ARQUIVO) ? JSON.parse(fs.readFileSync(ARQUIVO, 'utf8')) : {};
const mudancas = (de) => Object.keys(de).flatMap(n => ['prompt', 'reais'].filter(c => de[n][c] !== atual[n]?.[c]).map(c => `nível ${n} (${c})`));

if (registradas[VERSAO]) {
    const mudou = mudancas(registradas[VERSAO]);
    const novos = Object.keys(atual).filter(n => !registradas[VERSAO][n]);
    if (mudou.length || novos.length) {
        console.error(`O gerador mudou, mas a versão continua ${VERSAO}: ${[...mudou, ...novos.map(n => `nível ${n} (novo)`)].join(', ')}.`);
        console.error('Troque VERSAO em logica.js e registre em CHANGELOG.md.');
        process.exit(1);
    }
    console.log(`Versão ${VERSAO}: os lotes conferem com a impressão registrada.`);
} else {
    const ultima = Object.keys(registradas).at(-1);
    if (ultima) {
        const mudou = mudancas(registradas[ultima]);
        console.log(`Diferenças para a ${ultima}: ${mudou.length ? mudou.join(', ') : 'nenhuma nos níveis que já existiam'}.`);
        if (mudou.some(m => m.endsWith('(prompt)'))) console.log('O prompt de um nível que já existia mudou: pelas regras, isso pede a versão X seguinte.');
    }
    registradas[VERSAO] = atual;
    fs.writeFileSync(ARQUIVO, JSON.stringify(registradas, null, 1) + '\n');
    console.log(`Versão ${VERSAO} registrada em benchmark/impressoes.json.`);
}
