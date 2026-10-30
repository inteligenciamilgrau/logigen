// CONTROLE DE LOTE — os 20 desafios da bateria 7, os mesmos que o Haiku low já respondeu
// um por janela, agora em dois lotes de 10 (C e D). Se o acerto mudar, mandar vários
// desafios num prompt só muda o teste; se não mudar, o custo de uma bateria cai dez vezes.
// Uso: node benchmark/gerar-lote-b7.js <pasta com os p_C-*.txt e p_D-*.txt da bateria 7>
const fs = require('fs'), path = require('path');
const origem = process.argv[2];
const SAIDA = path.join(__dirname, 'g1', 'lote-b7');
fs.mkdirSync(SAIDA, { recursive: true });
for (const eixo of ['C', 'D']) {
    const corpos = Array.from({ length: 10 }, (_, k) => fs.readFileSync(path.join(origem, `p_${eixo}-${k + 1}.txt`), 'utf8')
        .replace(/\r\n/g, '\n').replace(/^Responda esse desafio:\n\n/, '').replace(/\n\nImportante:[\s\S]*$/, '').trim());
    const prompt = 'Responda esses desafios, uma resposta por linha no formato "1: resposta":\n\n' +
        corpos.map((c, k) => `Desafio ${k + 1}\n${c}`).join('\n\n') + '\n\nImportante: não leia arquivos nem use ferramentas para resolver.';
    fs.writeFileSync(path.join(SAIDA, `LOTE-${eixo}.txt`), prompt);
    console.log(eixo, prompt.length, 'caracteres');
}
fs.copyFileSync(path.join(origem, 'gabarito.json'), path.join(SAIDA, 'gabarito-b7.json'));
