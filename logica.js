// LOGIGEN - LÓGICA DOS DESAFIOS
// Lê o esqueleto do nível (niveis.js), troca as letras por palavras inventadas,
// confere a resposta com o solucionador e só então escreve o texto em português.
// O gabarito nunca é escrito à mão.

// --- ESQUELETO ---
// Cada letra vira uma classe de palavra do léxico (palavras.js)
const LETRAS = { X: 'nome', G: 'substantivo', A: 'adjetivo', V: 'verbo' };

function tipoDaVariavel(v) {
    const m = v.match(/^([XGAV])\d+$/);
    return m ? LETRAS[m[1]] : null;
}

function lerEsqueleto(texto, rotulo) {
    const esq = { regras: [], fatos: [], pergunta: null, resposta: null, variaveis: [], generos: {}, conjugacoes: {} };
    const erro = (msg, linha) => new Error(`Esqueleto do nível ${rotulo}: ${msg}${linha ? ` (linha "${linha}")` : ''}`);
    const usar = (v, tipos, linha) => {
        if (/^[XGAV]$/.test(v)) throw erro(`"${v}" precisa de número (ex.: ${v}1)`, linha);
        const tipo = tipoDaVariavel(v);
        if (!tipo) throw erro(`"${v}" não é uma letra conhecida (use X1, G1, A1, V1...)`, linha);
        if (!tipos.includes(tipo)) throw erro(`"${v}" não pode ser usado aqui`, linha);
        if (!esq.variaveis.includes(v)) esq.variaveis.push(v);
        return tipo;
    };
    // "X1" pede "é"/"está"; "X1 e X2" pede "são"/"estão"
    const lerSujeitos = (texto, verbo, linha) => {
        const sujeitos = texto.split(' e ');
        sujeitos.forEach(x => usar(x, ['nome'], linha));
        const plural = sujeitos.length > 1;
        if (plural !== ['são', 'estão'].includes(verbo)) {
            throw erro(plural ? 'dois personagens pedem "são" ou "estão"' : 'um personagem pede "é" ou "está"', linha);
        }
        return sujeitos;
    };
    const PREDICADOS = ['substantivo', 'adjetivo', 'verbo'];

    for (const bruta of texto.split('\n')) {
        const linha = bruta.replace(/#.*$/, '').trim().replace(/\s+/g, ' ');
        if (!linha) continue;
        let m;
        if ((m = linha.match(/^todo (\w+) é (\w+)$/))) {
            usar(m[1], PREDICADOS, linha);
            usar(m[2], PREDICADOS, linha);
            esq.regras.push({ tipo: 'todo', se: m[1], entao: m[2], texto: linha });
        // Operadores (níveis 4 e 5): só com grupos
        } else if ((m = linha.match(/^todo (\w+) é (\w+) ou (\w+)$/))) {
            [m[1], m[2], m[3]].forEach(v => usar(v, ['substantivo'], linha));
            esq.regras.push({ tipo: 'ou', se: m[1], entao: m[2], ou: m[3], texto: linha });
        } else if ((m = linha.match(/^nenhum (\w+) é (\w+)$/))) {
            usar(m[1], ['substantivo'], linha);
            usar(m[2], ['substantivo'], linha);
            esq.regras.push({ tipo: 'nenhum', se: m[1], entao: m[2], texto: linha });
        } else if ((m = linha.match(/^(\w+) não é (\w+)$/))) {
            usar(m[2], ['substantivo'], linha);
            esq.fatos.push({ sujeitos: lerSujeitos(m[1], 'é', linha), predicado: m[2], negativo: true, texto: linha });
        } else if ((m = linha.match(/^pergunta: (\w+) é ([A-Z]\d+)\?$/))) {
            usar(m[2], ['substantivo'], linha);
            esq.pergunta = { tipo: 'sim-nao', sujeitos: lerSujeitos(m[1], 'é', linha), verbo: 'é', alvo: m[2], texto: linha };
        // Palavras novas (nível 6): gênero e conjugação fixos
        } else if ((m = linha.match(/^gênero: (.+)$/))) {
            for (const par of m[1].split(',')) {
                const [v, g] = par.trim().split(/\s+/);
                if (!['m', 'f'].includes(g)) throw erro(`gênero "${g}" não existe (use m ou f)`, linha);
                usar(v, ['nome', 'substantivo'], linha);
                esq.generos[v] = g;
            }
        } else if ((m = linha.match(/^conjugação: (.+)$/))) {
            for (const par of m[1].split(',')) {
                const [v, c] = par.trim().split(/\s+/);
                if (!['-ar', '-er', '-ir'].includes(c)) throw erro(`conjugação "${c}" não existe (use -ar, -er ou -ir)`, linha);
                usar(v, ['verbo'], linha);
                esq.conjugacoes[v] = c;
            }
        } else if ((m = linha.match(/^resposta: (sim|não|não dá para saber)$/))) {
            esq.resposta = m[1];
            esq.respostaSimNao = true;
        } else if ((m = linha.match(/^pergunta: (\w+(?: e \w+)?) (é|são|está|estão) ___\?$/))) {
            esq.pergunta = { sujeitos: lerSujeitos(m[1], m[2], linha), verbo: m[2], texto: linha };
        } else if ((m = linha.match(/^resposta: (\w+)$/))) {
            usar(m[1], ['adjetivo', 'verbo'], linha);
            esq.resposta = m[1];
        } else if ((m = linha.match(/^(\w+(?: e \w+)?) (é|são) (\w+)$/))) {
            const sujeitos = lerSujeitos(m[1], m[2], linha);
            usar(m[3], PREDICADOS, linha);
            esq.fatos.push({ sujeitos, predicado: m[3], texto: linha });
        } else {
            throw erro('linha não entendida', linha);
        }
    }
    if (!esq.pergunta) throw erro('falta a linha "pergunta: X1 é ___?"');
    if (!esq.resposta) throw erro('falta a linha "resposta: A1"');
    if ((esq.pergunta.tipo === 'sim-nao') !== Boolean(esq.respostaSimNao)) {
        throw erro('pergunta de sim ou não ("X1 é G1?") pede "resposta: sim", "não" ou "não dá para saber"; pergunta com lacuna pede uma letra');
    }
    if (esq.pergunta.verbo.startsWith('est') && tipoDaVariavel(esq.resposta) !== 'verbo') {
        throw erro(`"${esq.pergunta.verbo}" (gerúndio) só funciona com resposta verbo, mas a resposta é ${esq.resposta}`);
    }
    return esq;
}

const esqueletosLidos = {};
function esqueletoDe(nivel, variante) {
    const chave = `${nivel}/${variante}`;
    if (!esqueletosLidos[chave]) esqueletosLidos[chave] = lerEsqueleto(NIVEIS[nivel].variantes[variante], `${nivel} (${variante})`);
    return esqueletosLidos[chave];
}

// --- SOLUCIONADOR ---
// Encadeamento para frente: parte dos fatos sobre o sujeito e aplica as regras
// até não surgir nada novo. Para cada conclusão guarda quantas regras foram
// usadas e de onde ela veio (o fato ou a regra), para montar a prova.
function deduzir(modelo, sujeito) {
    const conclusoes = new Map();
    for (const f of modelo.fatos) {
        if (f.sujeitos.includes(sujeito)) conclusoes.set(f.predicado.chave, { passos: 0, fato: f });
    }
    let mudou = true;
    while (mudou) {
        mudou = false;
        for (const r of modelo.regras) {
            const origem = conclusoes.get(r.se.chave);
            if (!origem) continue;
            const atual = conclusoes.get(r.entao.chave);
            if (!atual || atual.passos > origem.passos + 1) {
                conclusoes.set(r.entao.chave, { passos: origem.passos + 1, regra: r });
                mudou = true;
            }
        }
    }
    return conclusoes;
}

// Linhas do esqueleto usadas para chegar à conclusão, do fato até a última regra
function cadeiaDaProva(conclusoes, chave) {
    const cadeia = [];
    let atual = conclusoes.get(chave);
    while (atual.regra) {
        cadeia.unshift(atual.regra.esqueleto);
        atual = conclusoes.get(atual.regra.se.chave);
    }
    cadeia.unshift(atual.fato.esqueleto);
    return cadeia;
}

// Armadilha da recíproca: lê cada regra também ao contrário ("todo G3 é G1" como
// se fosse "todo G1 é G3") e vê se outra palavra passa a caber na lacuna para
// todos os personagens perguntados. Se passar, quem inverte essa regra erra.
function acharArmadilhas(modelo, sujeitos, candidatos, resposta) {
    const armadilhas = [];
    for (const regra of modelo.regras) {
        const invertida = { se: regra.entao, entao: regra.se };
        const comErro = { fatos: modelo.fatos, regras: [...modelo.regras, invertida] };
        const conclusoes = sujeitos.map(x => deduzir(comErro, x));
        const leva = candidatos.filter(c => c !== resposta && conclusoes.every(cc => cc.has(c.chave)));
        if (leva.length) armadilhas.push({ regra, leva });
    }
    return armadilhas;
}

// --- TEXTO ---
// Cada tipo de linha vira sempre a mesma frase, sem sinônimos (ver niveis.js).
// O esqueleto é o mesmo nos dois idiomas; só a frase muda (FRASES.pt e FRASES.en, abaixo).
const todo = (g) => g.genero === 'm' ? 'Todo' : 'Toda';
const artigo = (g) => g.genero === 'm' ? 'um' : 'uma';
// Artigo antes do nome deixa o gênero do personagem escrito no texto ("o Crodel", "a Flunice");
// só pela terminação do nome seria ambíguo ("-el" pode ser Gabriel ou Raquel)
const nomes = (sujeitos) => sujeitos.map(x => `${x.genero === 'm' ? 'o' : 'a'} ${x.palavra}`).join(' e ');
const maiuscula = (frase) => frase[0].toUpperCase() + frase.slice(1);
// Grupo com algum masculino concorda no masculino
const generoDe = (sujeitos) => sujeitos.some(x => x.genero === 'm') ? 'm' : 'f';

// O que se diz de alguém: "é um fatraspo" / "são fatraspos", "é mozunduda" / "são mozundudos", "glovunda" / "glovundam"
function predicar(p, genero, plural) {
    if (p.classe === 'substantivo') return plural ? `são ${p.plural}` : `é ${artigo(p)} ${p.palavra}`;
    if (p.classe === 'adjetivo') return `${plural ? 'são' : 'é'} ${p[genero + (plural ? 'p' : '')]}`;
    return plural ? p.plural : p.presente;
}

// O que vem antes da lacuna, conforme o verbo da pergunta e a classe da resposta
const MOLDES = {
    'é': { adjetivo: 'é ', verbo: '' },
    'são': { adjetivo: 'são ', verbo: '' },
    'está': { verbo: 'está ' },
    'estão': { verbo: 'estão ' }
};

// Inglês: nome sem artigo (não há gênero para marcar), "a"/"an" antes do substantivo,
// adjetivo sem flexão. "Every blick is drovish." / "Whoever florps is drovish." / "Zorin is a blick."
const nomesEn = (sujeitos) => sujeitos.map(x => x.palavra).join(' and ');
const artigoEn = (palavra) => /^[aeiou]/.test(palavra) ? 'an' : 'a';
function predicarEn(p, plural) {
    if (p.classe === 'substantivo') return plural ? `are ${p.plural}` : `is ${artigoEn(p.palavra)} ${p.palavra}`;
    if (p.classe === 'adjetivo') return `${plural ? 'are' : 'is'} ${p.m}`;
    return plural ? p.plural : p.presente;
}

const FRASES = {
    pt: {
        regra: ({ se, entao }) => se.classe === 'substantivo'
            ? `${todo(se)} ${se.palavra} ${predicar(entao, se.genero, false)}.`
            : `Quem ${predicar(se, 'm', false)} ${predicar(entao, 'm', false)}.`,
        fato: ({ sujeitos, predicado }) => maiuscula(`${nomes(sujeitos)} ${predicar(predicado, generoDe(sujeitos), sujeitos.length > 1)}.`),
        // "A Xemela é ___?", "A Xemela e o Zuvrel ___?", "A Xemela está ___?" — sem opções, sem dica
        pergunta: (sujeitos, verbo, classe) => maiuscula(`${nomes(sujeitos)} ${MOLDES[verbo][classe]}___?`),
        // A forma que a frase da pergunta exige, e o nome dessa flexão
        flexionar: (p, verbo, sujeitos) => {
            const plural = sujeitos.length > 1;
            if (p.classe === 'adjetivo') {
                const g = generoDe(sujeitos);
                return { forma: p[g + (plural ? 'p' : '')], flexao: `${g === 'm' ? 'masculino' : 'feminino'} ${plural ? 'plural' : 'singular'}` };
            }
            if (verbo.startsWith('est')) return { forma: p.gerundio, flexao: 'gerúndio' };
            return plural ? { forma: p.plural, flexao: 'presente, eles' } : { forma: p.presente, flexao: 'presente, ele' };
        }
    },
    en: {
        regra: ({ se, entao }) => se.classe === 'substantivo'
            ? `Every ${se.palavra} ${predicarEn(entao, false)}.`
            : `Whoever ${predicarEn(se, false)} ${predicarEn(entao, false)}.`,
        fato: ({ sujeitos, predicado }) => maiuscula(`${nomesEn(sujeitos)} ${predicarEn(predicado, sujeitos.length > 1)}.`),
        // O "está" do português vira "What is X doing?": sem isso, "Zorin is ___?" aceitaria
        // também um adjetivo, e a lacuna não diria que a resposta é um verbo no gerúndio
        pergunta: (sujeitos, verbo, classe) => {
            const n = nomesEn(sujeitos), plural = sujeitos.length > 1;
            if (verbo.startsWith('est')) return plural ? `What are ${n} doing? They are ___?` : `What is ${n} doing? ${n} is ___?`;
            if (classe === 'adjetivo') return `${n} ${plural ? 'are' : 'is'} ___?`;
            return `${n} ___?`;
        },
        flexionar: (p, verbo, sujeitos) => {
            const plural = sujeitos.length > 1;
            if (p.classe === 'adjetivo') return { forma: p.m, flexao: 'adjective (no inflection)' };
            if (verbo.startsWith('est')) return { forma: p.gerundio, flexao: 'gerund (-ing)' };
            return plural ? { forma: p.plural, flexao: 'present, they' } : { forma: p.presente, flexao: 'present, he/she' };
        }
    }
};

function fraseRegra(r, idioma = 'pt') { return FRASES[idioma].regra(r); }
function fraseFato(f, idioma = 'pt') { return FRASES[idioma].fato(f); }

// Forma de dicionário (masculino singular, infinitivo): como as palavras aparecem na legenda
function formaDicionario(p) {
    if (p.classe === 'adjetivo') return p.m;
    if (p.classe === 'verbo') return p.infinitivo;
    return p.palavra;
}

function frasePergunta(sujeitos, verbo, classe, idioma = 'pt') { return FRASES[idioma].pergunta(sujeitos, verbo, classe); }
function flexionar(p, verbo, sujeitos, idioma = 'pt') { return FRASES[idioma].flexionar(p, verbo, sujeitos); }

// Personagens, depois grupos, adjetivos e verbos, cada um em ordem: X1 X2 · G1 G2 · A1 A2
function ordenarLetras(variaveis) {
    const ordem = 'XGAV';
    const numero = (v) => parseInt(v.slice(1), 10);
    return [...variaveis].sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]) || numero(a) - numero(b));
}

// --- MONTAGEM ---
// "fixo" permite impor a variante e a ordem das regras (lote pareado, abaixo);
// sem ele, as duas são sorteadas como sempre
function montarDesafio(nivel, s, lexico, numero, idioma = 'pt', fixo = {}) {
    const variante = fixo.variante ?? s.item(Object.keys(NIVEIS[nivel].variantes));
    const esq = esqueletoDe(nivel, variante);
    if (esq.pergunta.tipo === 'sim-nao') return montarDesafioSimNao(nivel, variante, esq, s, lexico, numero, idioma, fixo);
    const { verbo } = esq.pergunta;
    const gerundio = verbo.startsWith('est');
    const palavra = {};
    const CONJUGACAO = { '-ar': PRIMEIRA, '-er': SEGUNDA, '-ir': TERCEIRA };
    for (const v of esq.variaveis) {
        const tipo = tipoDaVariavel(v);
        // Gerúndio: só verbos em -ar, para a forma pedida sair do texto (ver niveis.js), a não
        // ser que o esqueleto fixe a conjugação e o nível traga o glossário com o infinitivo.
        // Em inglês todo verbo já serve (o radical termina em duas consoantes: "+ing")
        if (tipo === 'verbo') palavra[v] = lexico.verbo(esq.conjugacoes[v] ? CONJUGACAO[esq.conjugacoes[v]] : gerundio ? PRIMEIRA : undefined);
        else if (tipo === 'nome' && esq.generos[v] && idioma === 'pt') palavra[v] = lexico.nome(esq.generos[v]);
        else palavra[v] = lexico[tipo]();
        // Substantivo de gênero fixo (só em português; em inglês o substantivo não tem gênero)
        for (let t = 0; tipo === 'substantivo' && idioma === 'pt' && esq.generos[v] && palavra[v].genero !== esq.generos[v]; t++) {
            if (t > 100) throw new Error(`Não consegui um substantivo ${esq.generos[v] === 'm' ? 'masculino' : 'feminino'} para ${v}.`);
            palavra[v] = lexico.substantivo();
        }
    }

    // Concordância com um personagem só ("X1 é ___?" com resposta adjetivo): o personagem
    // recebe o gênero oposto ao da forma que aparece na regra. Senão, copiar a regra já
    // acertaria e o teste não mediria a concordância. Em inglês o adjetivo não tem gênero.
    const [letraUnica, ...outros] = esq.pergunta.sujeitos;
    if (idioma === 'pt' && verbo === 'é' && !outros.length && tipoDaVariavel(esq.resposta) === 'adjetivo' && !esq.generos[letraUnica]) {
        const generosVisiveis = new Set(esq.regras.filter(r => r.entao === esq.resposta)
            .map(r => tipoDaVariavel(r.se) === 'substantivo' ? palavra[r.se].genero : 'm'));
        const atual = palavra[letraUnica].genero;
        if (generosVisiveis.size === 1 && generosVisiveis.has(atual)) palavra[letraUnica] = lexico.nome(atual === 'm' ? 'f' : 'm');
    }

    const modelo = {
        regras: esq.regras.map(r => ({ se: palavra[r.se], entao: palavra[r.entao], esqueleto: r.texto })),
        fatos: esq.fatos.map(f => ({ sujeitos: f.sujeitos.map(x => palavra[x]), predicado: palavra[f.predicado], esqueleto: f.texto }))
    };
    const sujeitos = esq.pergunta.sujeitos.map(x => palavra[x]);

    // O solucionador confere o esqueleto: entre todas as palavras da classe da
    // resposta (todos os A, ou todos os V), exatamente uma vale para todos os
    // personagens perguntados, e é a declarada em "resposta:"
    const erro = (msg) => new Error(`Esqueleto do nível ${nivel} (${variante}): ${msg}`);
    const conclusoes = sujeitos.map(x => deduzir(modelo, x));
    const candidatos = esq.variaveis.filter(v => v[0] === esq.resposta[0]);
    const achadas = candidatos.filter(v => conclusoes.every(c => c.has(palavra[v].chave)));
    if (achadas.length !== 1) throw erro(`dá para deduzir ${achadas.length} respostas para a lacuna (${achadas.join(', ') || 'nenhuma'}), precisa ser exatamente 1.`);
    if (achadas[0] !== esq.resposta) throw erro(`o solucionador chegou em ${achadas[0]}, mas o esqueleto diz "resposta: ${esq.resposta}".`);
    // "está ___" também aceita adjetivo ("A Marina está zedantosa"): na pergunta do gerúndio,
    // nenhum adjetivo pode ser dedutível, senão a lacuna tem duas respostas certas
    if (gerundio) {
        const adjetivos = esq.variaveis.filter(v => v[0] === 'A' && conclusoes.every(c => c.has(palavra[v].chave)));
        if (adjetivos.length) throw erro(`com "${verbo} ___?", o adjetivo ${adjetivos.join(', ')} também completa a lacuna ("está ..."); use um elo que não seja adjetivo.`);
    }
    const resposta = palavra[esq.resposta];
    const passos = Math.max(...conclusoes.map(c => c.get(resposta.chave).passos));
    const passosDoNivel = NIVEIS[nivel].passos;
    if (passosDoNivel && passos !== passosDoNivel) throw erro(`a resposta sai em ${passos} ${passos === 1 ? 'passo' : 'passos'}, mas o nível pede ${passosDoNivel}.`);

    // Armadilhas: o nível declara quantas existem e o solucionador confere
    const letraDe = new Map(esq.variaveis.map(v => [palavra[v], v]));
    const armadilhas = acharArmadilhas(modelo, sujeitos, candidatos.map(v => palavra[v]), resposta);
    const armadilhasDoNivel = NIVEIS[nivel].armadilhas;
    if (armadilhasDoNivel !== undefined && armadilhas.length !== armadilhasDoNivel) {
        const quais = armadilhas.map(a => `"${a.regra.esqueleto}"`).join(', ');
        throw erro(`achei ${armadilhas.length} armadilha${armadilhas.length === 1 ? '' : 's'}${quais ? ` (${quais})` : ''}, mas o nível pede ${armadilhasDoNivel}.`);
    }
    const { forma, flexao } = flexionar(resposta, verbo, sujeitos, idioma);

    const regrasArmadilha = new Set(armadilhas.map(a => a.regra));
    const embaralhadas = fixo.ordem ? fixo.ordem.map(i => modelo.regras[i]) : s.embaralhar(modelo.regras);
    const regras = embaralhadas.map(r => ({ texto: fraseRegra(r, idioma), esqueleto: r.esqueleto, armadilha: regrasArmadilha.has(r) }));
    const fatos = modelo.fatos.map(f => ({ texto: fraseFato(f, idioma), esqueleto: f.esqueleto }));
    const letrasSujeito = esq.pergunta.sujeitos.join(' e ');
    const verboDaConclusao = sujeitos.length > 1 ? 'são' : 'é';
    const letras = ordenarLetras(esq.variaveis);

    return {
        numero,
        nivel,
        variante,
        idioma,
        linhas: [...regras, ...fatos],
        pergunta: { texto: frasePergunta(sujeitos, verbo, resposta.classe, idioma), esqueleto: esq.pergunta.texto },
        glossario: NIVEIS[nivel].glossario ? montarGlossario(esq, palavra, s, idioma) : undefined,
        resposta: forma,
        flexao,
        chave: resposta.chave,
        // Qualquer outro adjetivo/verbo do desafio na resposta da IA conta como erro
        distratores: esq.variaveis.filter(v => /^[AV]/.test(v) && v !== esq.resposta).map(v => palavra[v].chave),
        passos,
        prova: [
            ...new Set(conclusoes.flatMap(c => cadeiaDaProva(c, resposta.chave))),
            `${letrasSujeito} ${verboDaConclusao} ${esq.resposta}`
        ],
        // Cada armadilha: a regra que engana e a conclusão errada que ela produz
        armadilhas: armadilhas.map(a => ({
            regra: a.regra.esqueleto,
            conclusao: `${letrasSujeito} ${verboDaConclusao} ${a.leva.map(p => letraDe.get(p)).join(', ')}`,
            palavras: a.leva.map(p => flexionar(p, verbo, sujeitos, idioma).forma)
        })),
        chavesArmadilha: armadilhas.flatMap(a => a.leva.map(p => p.chave)),
        legenda: letras.map(v => ({ letra: v, palavra: formaDicionario(palavra[v]), classe: palavra[v].classe })),
        // letra -> palavra com todas as formas, para trocar por palavras reais (palavras-reais.js)
        palavras: Object.fromEntries(letras.map(v => [v, palavra[v]])),
        // forma escrita -> classe, para a interface colorir o texto
        formas: Object.fromEntries(letras.flatMap(v => formasEscritas(palavra[v]).map(f => [f, palavra[v].classe])))
    };
}

// --- GLOSSÁRIO (nível 6) ---
// O infinitivo de cada verbo e a forma básica de cada adjetivo do desafio, em ordem sorteada
// (na ordem das letras, a resposta viria sempre primeiro)
const GLOSSARIO = {
    pt: { titulo: 'Glossário', verbo: (p) => `${p.infinitivo} (verbo)`, adjetivo: (p) => `${p.m} (adjetivo)` },
    en: { titulo: 'Glossary', verbo: (p) => `to ${p.infinitivo} (verb)`, adjetivo: (p) => `${p.m} (adjective)` }
};
function montarGlossario(esq, palavra, s, idioma) {
    const G = GLOSSARIO[idioma];
    const entradas = esq.variaveis.filter(v => /^[AV]/.test(v)).map(v => G[palavra[v].classe](palavra[v]));
    return `${G.titulo}: ${s.embaralhar(entradas).join('; ')}.`;
}

// --- OPERADORES (níveis 4 e 5) ---
// "nenhum", "ou" e fatos negativos não cabem no encadeamento para frente. O verificador
// transforma cada frase numa cláusula sobre os grupos do personagem perguntado e testa,
// com um resolvedor SAT (DPLL), se as frases mais "X1 é G" e as frases mais "X1 não é G"
// são possíveis. Só uma das duas: "sim" ou "não". As duas: "não dá para saber".
//   todo A é B: ¬A ∨ B · nenhum A é B: ¬A ∨ ¬B · todo A é B ou C: ¬A ∨ B ∨ C
function satisfazivel(clausulas) {
    let cls = clausulas.map(c => c.slice());
    for (;;) {
        if (cls.some(c => c.length === 0)) return false;
        if (!cls.length) return true;
        // Propagação de unidades e literais puros, antes de dividir
        const unidade = cls.find(c => c.length === 1);
        const sinais = new Map();
        cls.forEach(c => c.forEach(([v, sinal]) => sinais.set(v, (sinais.get(v) ?? 0) | (sinal ? 1 : 2))));
        const puro = [...sinais].find(([, m]) => m !== 3);
        const literal = unidade ? unidade[0] : puro ? [puro[0], puro[1] === 1] : null;
        if (!literal) break;
        cls = atribuir(cls, literal);
    }
    const v = cls[0][0][0];
    return satisfazivel(atribuir(cls, [v, true])) || satisfazivel(atribuir(cls, [v, false]));
}
const atribuir = (cls, [v, sinal]) => cls.filter(c => !c.some(([w, t]) => w === v && t === sinal)).map(c => c.filter(([w]) => w !== v));

const RESPOSTAS_SIM_NAO = {
    pt: { sim: 'sim', 'não': 'não', 'não dá para saber': 'não dá para saber' },
    en: { sim: 'yes', 'não': 'no', 'não dá para saber': "can't tell" }
};
const CANONICA_SIM_NAO = { sim: 'sim', 'não': 'nao', 'não dá para saber': 'nao-da' };
const FLEXAO_SIM_NAO = { pt: 'sim, não ou não dá para saber', en: "yes, no or can't tell" };
const FRASES_SIM_NAO = {
    pt: {
        todo: (r) => fraseRegra(r, 'pt'),
        nenhum: ({ se, entao }) => `${se.genero === 'm' ? 'Nenhum' : 'Nenhuma'} ${se.palavra} é ${artigo(entao)} ${entao.palavra}.`,
        ou: ({ se, entao, ou }) => `${todo(se)} ${se.palavra} é ${artigo(entao)} ${entao.palavra} ou ${artigo(ou)} ${ou.palavra}.`,
        fato: (x, g, negativo) => maiuscula(`${nomes([x])} ${negativo ? 'não é' : 'é'} ${artigo(g)} ${g.palavra}.`),
        pergunta: (x, g) => maiuscula(`${nomes([x])} é ${artigo(g)} ${g.palavra}?`)
    },
    en: {
        todo: (r) => fraseRegra(r, 'en'),
        nenhum: ({ se, entao }) => `No ${se.palavra} is ${artigoEn(entao.palavra)} ${entao.palavra}.`,
        ou: ({ se, entao, ou }) => `Every ${se.palavra} is ${artigoEn(entao.palavra)} ${entao.palavra} or ${artigoEn(ou.palavra)} ${ou.palavra}.`,
        fato: (x, g, negativo) => `${x.palavra} is ${negativo ? 'not ' : ''}${artigoEn(g.palavra)} ${g.palavra}.`,
        pergunta: (x, g) => `Is ${x.palavra} ${artigoEn(g.palavra)} ${g.palavra}?`
    }
};

function montarDesafioSimNao(nivel, variante, esq, s, lexico, numero, idioma, fixo) {
    const erro = (msg) => new Error(`Esqueleto do nível ${nivel} (${variante}): ${msg}`);
    const palavra = Object.fromEntries(esq.variaveis.map(v => [v, lexico[tipoDaVariavel(v)]()]));
    const [sujeito] = esq.pergunta.sujeitos;
    const fatosDoSujeito = esq.fatos.filter(f => f.sujeitos.includes(sujeito));
    const clausula = (r) => r.tipo === 'nenhum' ? [[r.se, false], [r.entao, false]]
        : r.tipo === 'ou' ? [[r.se, false], [r.entao, true], [r.ou, true]] : [[r.se, false], [r.entao, true]];
    const base = [...esq.regras.map(clausula), ...fatosDoSujeito.map(f => [[f.predicado, !f.negativo]])];
    if (!satisfazivel(base)) throw erro('as frases se contradizem.');
    const podeSim = satisfazivel([...base, [[esq.pergunta.alvo, true]]]);
    const podeNao = satisfazivel([...base, [[esq.pergunta.alvo, false]]]);
    const achada = podeSim && podeNao ? 'não dá para saber' : podeSim ? 'sim' : 'não';
    if (achada !== esq.resposta) throw erro(`o verificador chegou em "${achada}", mas o esqueleto diz "resposta: ${esq.resposta}".`);

    // A prova mostra as regras ligadas ao personagem e à pergunta (as de distração ficam de fora)
    const ligados = new Set([esq.pergunta.alvo, ...fatosDoSujeito.map(f => f.predicado)]);
    const grupos = (r) => [r.se, r.entao, r.ou].filter(Boolean);
    for (let cresceu = true; cresceu;) {
        cresceu = false;
        for (const r of esq.regras) if (grupos(r).some(g => ligados.has(g)) && !grupos(r).every(g => ligados.has(g))) { grupos(r).forEach(g => ligados.add(g)); cresceu = true; }
    }
    const relevantes = esq.regras.filter(r => grupos(r).some(g => ligados.has(g)));

    const F = FRASES_SIM_NAO[idioma];
    const modelo = esq.regras.map(r => ({ tipo: r.tipo, se: palavra[r.se], entao: palavra[r.entao], ou: r.ou && palavra[r.ou], esqueleto: r.texto }));
    const embaralhadas = fixo.ordem ? fixo.ordem.map(i => modelo[i]) : s.embaralhar(modelo);
    const letras = ordenarLetras(esq.variaveis);
    return {
        numero, nivel, variante, idioma,
        linhas: [
            ...embaralhadas.map(r => ({ texto: F[r.tipo](r), esqueleto: r.esqueleto, armadilha: false })),
            ...esq.fatos.map(f => ({ texto: F.fato(palavra[f.sujeitos[0]], palavra[f.predicado], f.negativo), esqueleto: f.texto }))
        ],
        pergunta: { texto: F.pergunta(palavra[sujeito], palavra[esq.pergunta.alvo]), esqueleto: esq.pergunta.texto },
        resposta: RESPOSTAS_SIM_NAO[idioma][esq.resposta],
        flexao: FLEXAO_SIM_NAO[idioma],
        tipoResposta: 'sim-nao',
        respostaCanonica: CANONICA_SIM_NAO[esq.resposta],
        chave: null, distratores: [], chavesArmadilha: [], armadilhas: [],
        passos: relevantes.length,
        prova: [...relevantes.map(r => r.texto), ...fatosDoSujeito.map(f => f.texto), `${esq.pergunta.texto.replace(/^pergunta: /, '')} ${esq.resposta}`],
        legenda: letras.map(v => ({ letra: v, palavra: formaDicionario(palavra[v]), classe: palavra[v].classe })),
        palavras: Object.fromEntries(letras.map(v => [v, palavra[v]])),
        formas: Object.fromEntries(letras.flatMap(v => formasEscritas(palavra[v]).map(f => [f, palavra[v].classe])))
    };
}

function gerarLote(nivel, quantidade, semente, idioma = 'pt') {
    const s = criarSorteio(semente);
    const lexico = criarLexico(s, idioma);
    return Array.from({ length: quantidade }, (_, i) => montarDesafio(nivel, s, lexico, i + 1, idioma));
}

// O mesmo lote em dois idiomas: em cada desafio, a mesma variante e a mesma ordem das
// regras; só as palavras inventadas são de cada idioma. Serve para comparar uma pessoa e
// uma IA no mesmo desafio, cada uma na sua língua (aba Humano × IA).
function gerarLotePareado(nivel, quantidade, semente, idiomas) {
    const s = criarSorteio(semente);
    const lexicos = idiomas.map((idioma, k) => criarLexico(criarSorteio(semente * 31 + k + 1), idioma));
    const lotes = idiomas.map(() => []);
    for (let numero = 1; numero <= quantidade; numero++) {
        const variante = s.item(Object.keys(NIVEIS[nivel].variantes));
        const ordem = s.embaralhar([...esqueletoDe(nivel, variante).regras.keys()]);
        idiomas.forEach((idioma, k) => lotes[k].push(montarDesafio(nivel, s, lexicos[k], numero, idioma, { variante, ordem })));
    }
    return lotes;
}

// --- PROMPT ---
// Sem dicas: a IA não é avisada de que as palavras são inventadas nem de que
// precisa flexionar. O lote só pede o formato "1: resposta", para a correção ler.
const corpoDoDesafio = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}${d.glossario ? `\n${d.glossario}` : ''}`;

const PEDIDOS = {
    pt: { lote: 'Responda esses desafios, uma resposta por linha no formato "1: resposta":', desafio: 'Desafio', unico: 'Responda esse desafio:' },
    en: { lote: 'Answer these challenges, one answer per line in the format "1: answer":', desafio: 'Challenge', unico: 'Answer this challenge:' }
};

// Os níveis de sim ou não (4 e 5) dizem no prompt como responder ("instrucao" em niveis.js)
const instrucaoDoNivel = (d) => NIVEIS[d.nivel]?.instrucao?.[d.idioma ?? 'pt'];

function montarPrompt(desafios) {
    const p = PEDIDOS[desafios[0]?.idioma ?? 'pt'];
    const instrucoes = [...new Set(desafios.map(instrucaoDoNivel).filter(Boolean))];
    return `${[p.lote, ...instrucoes].join('\n')}\n\n` + desafios.map(d => `${p.desafio} ${d.numero}\n${corpoDoDesafio(d)}`).join('\n\n');
}

// Um desafio só, para mandar manualmente
function montarPromptUnico(d) {
    return `${[PEDIDOS[d.idioma ?? 'pt'].unico, instrucaoDoNivel(d)].filter(Boolean).join('\n')}\n\n${corpoDoDesafio(d)}`;
}

// --- CORREÇÃO ---
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Lê linhas no formato "3: resposta" (aceita "3.", "3)", "Desafio 3:", "Challenge 3:", negrito...).
// Se o número aparecer mais de uma vez, vale a última (a lista final da IA).
function lerRespostas(texto) {
    const respostas = new Map();
    for (const bruta of texto.split(/\r?\n/)) {
        const linha = bruta.replace(/[*_`#>]/g, '').trim();
        const m = linha.match(/^(?:desafio|quest[aã]o|pergunta|resposta|challenge|question|answer)?\s*(\d{1,3})\s*[:.)\-–—]\s*(.+)$/i);
        if (m) respostas.set(parseInt(m[1], 10), m[2].trim());
    }
    return respostas;
}

// certo      = escreveu exatamente a forma pedida (ex.: "glovundando")
// ambigua    = escreveu a forma pedida E outra forma da mesma palavra ("treflofosas (ou treflofosos)")
// flexao     = escolheu a palavra certa, mas na forma errada (ex.: "glovundar")
// armadilha  = citou a palavra que só sai lendo uma regra ao contrário
//              (mesmo junto com a certa: é o que conclui quem inverte a regra)
// errado     = escolheu outra palavra, ou citou mais de uma
//
// Dois eixos: LÓGICA = escolheu a palavra certa (certo, ambigua ou flexao);
// MORFOLOGIA = entre esses, escreveu só a forma pedida (certo).
function corrigir(desafios, texto) {
    const respostas = lerRespostas(texto);
    return desafios.map(d => {
        const dada = respostas.get(d.numero);
        if (dada === undefined) return { numero: d.numero, dada: null, status: 'sem-resposta' };
        // Sim ou não: concluir "sim" ou "não" quando as frases não garantem nada é cair na falácia
        if (d.tipoResposta === 'sim-nao') {
            const dita = lerSimNao(normalizar(dada));
            const status = dita === d.respostaCanonica ? 'certo' : dita && d.respostaCanonica === 'nao-da' ? 'armadilha' : 'errado';
            return { numero: d.numero, dada, status };
        }
        const palavras = normalizar(dada).split(/[^a-z]+/).filter(Boolean);
        const cita = (chaves) => palavras.some(w => chaves.some(c => w.startsWith(c)));
        const formasDaResposta = new Set(palavras.filter(w => w.startsWith(d.chave)));
        const exata = formasDaResposta.has(d.resposta);
        let status;
        if (cita(d.chavesArmadilha)) status = 'armadilha';
        else if (cita(d.distratores)) status = 'errado';
        else if (exata) status = formasDaResposta.size > 1 ? 'ambigua' : 'certo';
        else status = formasDaResposta.size ? 'flexao' : 'errado';
        const r = { numero: d.numero, dada, status };
        if (status === 'flexao') r.diagnostico = diagnosticarFlexao(d, palavras, [...formasDaResposta][0]);
        return r;
    });
}

// "Não dá para saber" vem antes, porque também começa com "não"
const NAO_DA_PARA_SABER = /nao da|impossivel|indetermin|nao (e|eh) possivel|nao se pode|nao ha como|can'?t tell|cannot tell|can'?t (be )?(know|determin|say)|cannot (be )?(know|determin|say)|undetermin|unknown|not enough/;
function lerSimNao(texto) {
    if (NAO_DA_PARA_SABER.test(texto)) return 'nao-da';
    if (/^\W*(sim|yes)\b/.test(texto)) return 'sim';
    if (/^\W*(nao|no)\b/.test(texto)) return 'nao';
    return null;
}

// Por que a forma saiu errada, quando a palavra está certa (a lógica acertou). Os nomes vêm
// das baterias do benchmark/ (RELATORIO-G2.md):
//   copiou     escreveu a forma que já está no texto ou no glossário ("glovunda" onde se pede "glovundando")
//   classe     leu o verbo como adjetivo ("são ladadra", "gronetres")
//   conjugacao trocou a conjugação ("gronetram" onde se pede "gronetrem")
//   atracao    concordou com o substantivo do grupo, não com as pessoas
//              ("A Marina e o Caio são glapartas" → "dralelhudas")
//   genero     outro gênero errado · numero: singular e plural trocados
//   outra      uma forma que não existe ("gluskishes")
function diagnosticarFlexao(d, palavras, dada) {
    const p = Object.values(d.palavras ?? {}).find(w => w.chave === d.chave);
    if (!p) return 'outra';
    const textoDoDesafio = new Set([...d.linhas.map(l => l.texto), d.pergunta.texto, d.glossario ?? ''].flatMap(t => normalizar(t).split(/[^a-z]+/)));
    const pt = (d.idioma ?? 'pt') === 'pt';
    if (p.classe === 'verbo') {
        if (pt && d.flexao === 'presente, eles' && palavras.includes('sao')) return 'classe';
        if (textoDoDesafio.has(dada)) return 'copiou';
        if (!pt) return 'outra';
        if (dada.endsWith('s')) return 'classe';
        const raiz = normalizar(p.infinitivo.slice(0, -2));
        const fim = (forma) => forma.startsWith(raiz) ? forma.slice(raiz.length) : null;
        const mesmoLugar = [['am', 'em'], ['ando', 'endo', 'indo']].some(g => g.includes(fim(dada)) && g.includes(fim(normalizar(d.resposta))));
        return mesmoLugar ? 'conjugacao' : 'outra';
    }
    if (p.classe !== 'adjetivo' || !pt) return 'outra';
    if (textoDoDesafio.has(dada)) return 'copiou';
    const formas = { m: ['m', false], f: ['f', false], mp: ['m', true], fp: ['f', true] };
    const achada = Object.entries(formas).find(([campo]) => normalizar(p[campo]) === dada);
    if (!achada) return 'outra';
    const [generoDado, pluralDado] = achada[1];
    const generoPedido = d.flexao.startsWith('feminino') ? 'f' : 'm';
    if (pluralDado !== d.flexao.includes('plural')) return 'numero';
    if (generoDado === generoPedido) return 'outra';
    // O substantivo do fato sobre os personagens ("X1 e X2 são G1"): se a forma dada tem o gênero
    // dele, a IA concordou com o grupo, não com as pessoas
    const sujeitos = (d.pergunta.esqueleto.match(/^pergunta: (\S+(?: e \S+)?) /) ?? [])[1];
    const fato = d.linhas.map(l => l.esqueleto.match(/^(\S+(?: e \S+)?) (?:é|são) (G\d+)$/)).find(m => m && m[1] === sujeitos);
    const grupo = fato && d.palavras[fato[2]];
    return grupo && grupo.genero === generoDado ? 'atracao' : 'genero';
}

// Placar nos dois eixos, a partir do resultado de corrigir()
function placarDosEixos(resultado) {
    const conta = (...status) => resultado.filter(r => status.includes(r.status)).length;
    const logica = conta('certo', 'ambigua', 'flexao');
    return { total: resultado.length, logica, morfologia: conta('certo') };
}
