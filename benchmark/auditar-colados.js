// Confere se os prompts colados à mão nas chamadas de subagente são idênticos aos arquivos.
// Uso: node benchmark/auditar-colados.js <sessão.jsonl> "<descrição da chamada>=<arquivo>" ...
const fs = require('fs');
const [jsonl, ...pares] = process.argv.slice(2);
const chamadas = new Map();
for (const linha of fs.readFileSync(jsonl, 'utf8').split('\n')) {
    if (!linha.includes('"Agent"')) continue;
    let ev; try { ev = JSON.parse(linha); } catch (e) { continue; }
    for (const bloco of ev.message?.content ?? []) {
        if (bloco.type === 'tool_use' && bloco.name === 'Agent') chamadas.set(bloco.input.description, bloco.input.prompt);
    }
}
const limpar = (t) => t.replace(/\r\n/g, '\n').trim();
for (const par of pares) {
    const [descricao, arquivo] = par.split('=');
    const enviado = chamadas.get(descricao);
    if (enviado === undefined) { console.log(`${descricao}: chamada não encontrada`); continue; }
    const a = limpar(enviado), b = limpar(fs.readFileSync(arquivo, 'utf8'));
    if (a === b) { console.log(`${descricao}: idêntico (${a.length} caracteres)`); continue; }
    const la = a.split('\n'), lb = b.split('\n');
    const i = la.findIndex((l, k) => l !== lb[k]);
    console.log(`${descricao}: DIFERENTE na linha ${i + 1}\n  enviado: ${la[i]}\n  arquivo: ${lb[i]}`);
}
