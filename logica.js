// LOGIGEN - LÓGICA DOS DESAFIOS
// Lê o esqueleto do nível (niveis.js), troca as letras por palavras inventadas,
// confere a resposta com o solucionador e só então escreve o texto em português.
// O gabarito nunca é escrito à mão.

// A versão aparece na tela e identifica os relatórios: a mesma semente só repete o lote na
// mesma versão. Quando trocar, ver as regras em CHANGELOG.md e rodar benchmark/impressao.js
const VERSAO = '1.2';

// --- ESQUELETO ---
// Cada letra vira uma classe de palavra do léxico (palavras.js)
const LETRAS = { X: 'nome', G: 'substantivo', A: 'adjetivo', V: 'verbo' };

function tipoDaVariavel(v) {
    const m = v.match(/^([XGAV])\d+$/);
    return m ? LETRAS[m[1]] : null;
}

function lerEsqueleto(texto, rotulo) {
    const esq = { rotulo, regras: [], fatos: [], pergunta: null, resposta: null, variaveis: [], generos: {}, conjugacoes: {} };
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
        // Indução (nível 7): os traços, quantos exemplos e a regra escondida
        } else if ((m = linha.match(/^traços: ((?:\w+ ?)+)$/))) {
            esq.tracos = m[1].trim().split(' ');
            esq.tracos.forEach(v => usar(v, ['adjetivo'], linha));
        } else if ((m = linha.match(/^exemplos: (\d+)$/))) {
            esq.exemplos = parseInt(m[1], 10);
        } else if ((m = linha.match(/^regra: (\w+) = (.+)$/))) {
            usar(m[1], ['substantivo'], linha);
            const expressao = lerExpressao(m[2], (v) => usar(v, ['adjetivo'], linha), (msg) => erro(msg, linha));
            esq.regraEscondida = { grupo: m[1], expressao, texto: linha };
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
    // Na indução, a pergunta e a resposta saem dos exemplos sorteados
    if (esq.regraEscondida || esq.tracos || esq.exemplos) {
        if (!esq.regraEscondida || !esq.tracos || !esq.exemplos) throw erro('a indução pede as três linhas: "traços:", "exemplos:" e "regra:"');
        if (esq.pergunta || esq.resposta || esq.regras.length || esq.fatos.length) throw erro('na indução, os exemplos fazem o papel das regras e dos fatos; tire as outras linhas');
        const fora = esq.variaveis.filter(v => v[0] === 'A' && !esq.tracos.includes(v));
        if (fora.length) throw erro(`a regra usa ${fora.join(', ')}, que não está em "traços:"`);
        if (esq.tracos.length > 4) throw erro('no máximo 4 traços');
        if (esq.exemplos >= 2 ** esq.tracos.length) throw erro(`com ${esq.tracos.length} traços só existem ${2 ** esq.tracos.length} personagens diferentes; sobra nenhum para a pergunta`);
        esq.inducao = true;
        return esq;
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
    const d = montarDesafioDoEsqueleto(nivel, s, lexico, numero, idioma, fixo);
    return NIVEIS[nivel].natural ? naturalizar(d, s) : d;
}

function montarDesafioDoEsqueleto(nivel, s, lexico, numero, idioma, fixo) {
    const variante = fixo.variante ?? s.item(Object.keys(NIVEIS[nivel].variantes));
    const esq = esqueletoDe(nivel, variante);
    if (esq.inducao) return montarDesafioInducao(nivel, variante, esq, s, lexico, numero, idioma, fixo);
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

// --- INDUÇÃO (nível 7) ---
// A regra escondida ("A1 e não A2") vira uma árvore; cada personagem é um número em que o
// bit k diz se ele tem o k-ésimo traço, e cada regra vira uma tabela-verdade (um bit por
// personagem possível: com 4 traços, 16 bits).
function lerExpressao(texto, usarLetra, erro) {
    const tokens = texto.match(/[()]|[^\s()]+/g) ?? [];
    let i = 0;
    const fator = () => {
        const tk = tokens[i++];
        if (tk === 'não') return { tipo: 'nao', a: fator() };
        if (tk === '(') {
            const e = expressao();
            if (tokens[i++] !== ')') throw erro('falta fechar um parêntese');
            return e;
        }
        if (/^A\d+$/.test(tk ?? '')) { usarLetra(tk); return { tipo: 'traco', v: tk }; }
        throw erro(`"${tk ?? 'fim da linha'}" não cabe na regra (use A1, "e", "ou", "não" e parênteses)`);
    };
    const termo = () => { let a = fator(); while (tokens[i] === 'e') { i++; a = { tipo: 'e', a, b: fator() }; } return a; };
    const expressao = () => { let a = termo(); while (tokens[i] === 'ou') { i++; a = { tipo: 'ou', a, b: termo() }; } return a; };
    const arvore = expressao();
    if (i < tokens.length) throw erro(`sobrou "${tokens.slice(i).join(' ')}" na regra`);
    return arvore;
}
const avaliar = (e, tem) => e.tipo === 'traco' ? tem(e.v) : e.tipo === 'nao' ? !avaliar(e.a, tem)
    : e.tipo === 'e' ? avaliar(e.a, tem) && avaliar(e.b, tem) : avaliar(e.a, tem) || avaliar(e.b, tem);
// Tamanho de uma regra: quantos traços ela cita ("A1 e não A2" = 2)
const tamanhoDaRegra = (e) => e.tipo === 'traco' ? 1 : e.tipo === 'nao' ? tamanhoDaRegra(e.a) : tamanhoDaRegra(e.a) + tamanhoDaRegra(e.b);

// Todas as regras com "e", "ou" e "não" de até "maximo" traços, cada uma com o menor tamanho em
// que aparece, mais as que uma pessoa (ou uma IA) poderia achar tão simples quanto: "só um dos
// dois" e "pelo menos 2 de 3". Foi o que faltou na bateria H4 do benchmark: três modelos acharam,
// cada um, uma regra do mesmo tamanho que o gerador não tinha conferido, e o "erro" era do item.
// (Exigir também as regras com um traço a mais não serve: com 3 traços, "A1 e A2" teria sempre
// "não" como resposta, porque os dois únicos casos de "sim" precisariam estar nos exemplos.)
const regrasCalculadas = {};
function regrasPlausiveis(nTracos, maximo) {
    const chave = `${nTracos}/${maximo}`;
    if (regrasCalculadas[chave]) return regrasCalculadas[chave];
    const n = 1 << nTracos, cheia = 2 ** n - 1;
    const doTraco = (k) => { let t = 0; for (let a = 0; a < n; a++) if ((a >> k) & 1) t |= 1 << a; return t; };
    const tamanho = new Map();
    const porTamanho = [[], []];
    for (let k = 0; k < nTracos; k++) for (const t of [doTraco(k), cheia ^ doTraco(k)]) { tamanho.set(t, 1); porTamanho[1].push(t); }
    for (let tam = 2; tam <= maximo; tam++) {
        porTamanho[tam] = [];
        for (let i = 1; i <= tam / 2; i++) for (const a of porTamanho[i]) for (const b of porTamanho[tam - i]) {
            for (const t of [a & b, a | b]) if (!tamanho.has(t)) { tamanho.set(t, tam); porTamanho[tam].push(t); }
        }
    }
    const lit = porTamanho[1];
    const outras = [...lit.flatMap(a => lit.map(b => a ^ b)), ...lit.flatMap(a => lit.flatMap(b => lit.map(c => (a & b) | (a & c) | (b & c))))];
    regrasCalculadas[chave] = { tamanho, todas: [...new Set([...tamanho.keys(), ...outras])] };
    return regrasCalculadas[chave];
}

// Sorteia a resposta (sim ou não, meio a meio) e depois os exemplos e o personagem da pergunta,
// até a resposta ficar única: nenhuma regra menor que a escondida explica os exemplos, e todas
// as plausíveis do mesmo tamanho (ou menores) que explicam concordam no personagem novo
function estruturaDaInducao(esq, s) {
    const T = esq.tracos.length;
    const valor = (a) => avaliar(esq.regraEscondida.expressao, (v) => Boolean((a >> esq.tracos.indexOf(v)) & 1));
    const tam = tamanhoDaRegra(esq.regraEscondida.expressao);
    const { tamanho, todas } = regrasPlausiveis(T, tam);
    const menores = [...tamanho].filter(([, t]) => t < tam).map(([regra]) => regra);
    const cabe = (regra, a) => Boolean((regra >> a) & 1);
    const queria = s.chance(0.5);
    for (let tentativa = 0; tentativa < 3000; tentativa++) {
        const ordem = s.embaralhar([...Array(1 << T).keys()]);
        const exemplos = ordem.slice(0, esq.exemplos), resto = ordem.slice(esq.exemplos);
        // Pelo menos um exemplo de cada lado (com 3 traços, "A1 e A2" só tem dois casos de "sim")
        const dentro = exemplos.filter(valor).length;
        if (!dentro || dentro === exemplos.length) continue;
        const explica = (regra) => exemplos.every(a => cabe(regra, a) === valor(a));
        if (menores.some(explica)) continue;
        const explicam = todas.filter(explica);
        const pergunta = resto.find(a => valor(a) === queria && explicam.every(regra => cabe(regra, a) === queria));
        if (pergunta === undefined) continue;
        return { exemplos, pergunta, ordemDosTracos: s.embaralhar(esq.tracos.map((_, k) => k)) };
    }
    throw new Error(`Esqueleto do nível ${esq.rotulo}: não achei exemplos que deixem a resposta "${queria ? 'sim' : 'não'}" única; mude "exemplos:".`);
}

// "A Flunice é zedantosa, não é glumenta e é pavobenta." Os traços vêm sempre na mesma ordem
// dentro do desafio, para os exemplos serem comparáveis
const FRASES_INDUCAO = {
    pt: (x, tracos) => {
        const partes = tracos.map(([adj, tem]) => `${tem ? 'é' : 'não é'} ${adj[x.genero]}`);
        return maiuscula(`${nomes([x])} ${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}.`);
    },
    en: (x, tracos) => {
        const partes = tracos.map(([adj, tem]) => `${tem ? 'is' : 'is not'} ${adj.m}`);
        return `${x.palavra} ${partes.slice(0, -1).join(', ')} and ${partes.at(-1)}.`;
    }
};
const FLEXAO_INDUCAO = { pt: 'sim ou não', en: 'yes or no' };

function montarDesafioInducao(nivel, variante, esq, s, lexico, numero, idioma, fixo) {
    const { exemplos, pergunta, ordemDosTracos } = fixo.inducao ?? estruturaDaInducao(esq, s);
    const { grupo } = esq.regraEscondida;
    const palavra = Object.fromEntries([grupo, ...esq.tracos].map(v => [v, lexico[tipoDaVariavel(v)]()]));
    const personagens = [...exemplos, pergunta].map((a, i) => ({ letra: `X${i + 1}`, a, nome: lexico.nome() }));
    personagens.forEach(p => { palavra[p.letra] = p.nome; });
    const ordem = ordemDosTracos.map(k => esq.tracos[k]);
    const tem = (a, v) => Boolean((a >> esq.tracos.indexOf(v)) & 1);
    const valor = (a) => avaliar(esq.regraEscondida.expressao, (v) => tem(a, v));
    const F = FRASES_SIM_NAO[idioma];
    const descrever = (p) => FRASES_INDUCAO[idioma](p.nome, ordem.map(v => [palavra[v], tem(p.a, v)]));
    const tracosNoEsqueleto = (p) => ordem.map(v => tem(p.a, v) ? v : `não ${v}`).join(', ');
    const teste = personagens.at(-1);
    const resposta = valor(pergunta) ? 'sim' : 'não';
    const letras = ordenarLetras(Object.keys(palavra));
    return {
        numero, nivel, variante, idioma,
        linhas: personagens.slice(0, -1).map(p => ({
            texto: `${descrever(p)} ${F.fato(p.nome, palavra[grupo], !valor(p.a))}`,
            esqueleto: `${p.letra}: ${tracosNoEsqueleto(p)} → ${valor(p.a) ? '' : 'não '}${grupo}`,
            armadilha: false
        })),
        pergunta: { texto: `${descrever(teste)} ${F.pergunta(teste.nome, palavra[grupo])}`, esqueleto: `${teste.letra}: ${tracosNoEsqueleto(teste)} → ${grupo}?` },
        resposta: RESPOSTAS_SIM_NAO[idioma][resposta],
        flexao: FLEXAO_INDUCAO[idioma],
        tipoResposta: 'sim-nao',
        inducao: true,
        respostaCanonica: CANONICA_SIM_NAO[resposta],
        chave: null, distratores: [], chavesArmadilha: [], armadilhas: [],
        passos: null,
        prova: [esq.regraEscondida.texto.replace(/^regra: /, ''), `${teste.letra}: ${tracosNoEsqueleto(teste)}`, `${teste.letra} ${resposta === 'sim' ? 'é' : 'não é'} ${grupo}`],
        legenda: letras.map(v => ({ letra: v, palavra: formaDicionario(palavra[v]), classe: palavra[v].classe })),
        palavras: Object.fromEntries(letras.map(v => [v, palavra[v]])),
        formas: Object.fromEntries(letras.flatMap(v => formasEscritas(palavra[v]).map(f => [f, palavra[v].classe])))
    };
}

// --- TEXTO NATURAL (nível 9) ---
// Os outros níveis escrevem cada linha sempre com a mesma frase, de propósito, e por isso soam
// como aula de lógica. Aqui as mesmas linhas viram um parágrafo de conversa. Cada molde abaixo
// precisa dizer exatamente o que a linha do esqueleto diz: "costuma ser", "quase todo" ou "a
// maioria" soariam bem, mas mudariam a lógica que o solucionador conferiu.
// As regras ficam no singular, e a pergunta pede o plural ou o gerúndio: a forma pedida nunca
// está escrita no texto. "Vive fazendo" e não "está fazendo agora": a regra diz o que o grupo
// faz sempre, e não o que a pessoa faz neste momento.
// O substantivo concorda com a pessoa, quando tem duas formas ("A Júlia é uma professora")
const concordar = (p, genero) => p.classe === 'substantivo' && p.f && genero === 'f' ? { ...p, genero, palavra: p.f, plural: p.fp } : p;
const comArtigoPlural = (p) => `${p.genero === 'm' ? 'os' : 'as'} ${p.plural}`;

const NATURAL = {
    pt: {
        aberturas: [
            ['Minha tia mora numa cidadezinha do interior e adora contar como as coisas funcionam naquele lugar.', 'ela'],
            ['Um colega de trabalho passou o almoço inteiro explicando como é a vida no bairro dele.', 'ele'],
            ['Na semana passada, a dona da pensão me explicou como são as coisas naquela região.', 'ela'],
            ['Meu avô trabalhou muitos anos numa fazenda e ainda lembra de cada detalhe daquele lugar.', 'ele']
        ],
        ligacoes: ['Por lá, ', 'Além disso, ', 'Outra coisa: ', 'E tem mais: ', 'Também por lá, ', 'Vale lembrar que ', 'Ali, '],
        todo: {
            substantivo: [
                (a, b) => `${todo(a).toLowerCase()} ${a.palavra} é ${artigo(b)} ${b.palavra}`,
                (a, b) => `não existe ${a.palavra} que não seja ${artigo(b)} ${b.palavra}`,
                (a, b) => `quem é ${a.palavra} também é ${b.palavra}`,
                (a, b) => `${comArtigoPlural(a)}, sem exceção, são ${b.plural}`
            ],
            adjetivo: [
                (a, b) => `${todo(a).toLowerCase()} ${a.palavra} é ${b[a.genero]}`,
                (a, b) => `não existe ${a.palavra} que não seja ${b[a.genero]}`,
                (a, b) => `quem é ${a.palavra} é ${b.m}`
            ],
            verbo: [
                (a, b) => `${todo(a).toLowerCase()} ${a.palavra} ${b.presente}`,
                (a, b) => `quem é ${a.palavra} ${b.presente}`,
                (a, b) => `${todo(a).toLowerCase()} ${a.palavra}, sem exceção, ${b.presente}`
            ]
        },
        nenhum: [
            (a, b) => `${a.genero === 'm' ? 'nenhum' : 'nenhuma'} ${a.palavra} é ${artigo(b)} ${b.palavra}`,
            (a, b) => `não existe ${a.palavra} que seja ${artigo(b)} ${b.palavra}`,
            (a, b) => `quem é ${a.palavra} nunca é ${b.palavra}`
        ],
        ou: [
            (a, b, c) => `${todo(a).toLowerCase()} ${a.palavra} é ${artigo(b)} ${b.palavra} ou ${artigo(c)} ${c.palavra}, pelo menos uma das duas coisas`,
            (a, b, c) => `quem é ${a.palavra} é ${b.palavra}, ou ${c.palavra}, ou as duas coisas`
        ],
        // O que se diz de uma pessoa: "é uma plalhoma", "não é uma plalhoma", "são plalhomas"
        dizer: (sujeitos, g, negativo) => `${negativo ? 'não ' : ''}${predicar(g, generoDe(sujeitos), sujeitos.length > 1)}`,
        fato: {
            um: [
                (x, dito) => `${maiuscula(nomes(x))} ${dito}.`,
                (x, dito) => `${maiuscula(nomes(x))}, por exemplo, ${dito}.`,
                (x, dito) => `Uma pessoa que sempre aparece nessas histórias é ${nomes(x)}, que ${dito}.`
            ],
            dois: [
                (x, dito) => `${maiuscula(nomes(x))} ${dito}.`,
                (x, dito) => `${maiuscula(nomes(x))}, por exemplo, ${dito}.`,
                (x, dito) => `Duas pessoas que sempre aparecem nessas histórias são ${nomes(x)}, que ${dito}.`
            ]
        },
        perguntar: (pronome, oQue) => `Pelo que ${pronome} contou, ${oQue}`,
        lacuna: (x, verbo, classe) => {
            const dois = x.length > 1;
            if (verbo.startsWith('est')) return `o que ${nomes(x)} ${dois ? 'vivem' : 'vive'} fazendo?`;
            return classe === 'adjetivo' ? `como ${dois ? 'são' : 'é'} ${nomes(x)}?` : `o que ${nomes(x)} ${dois ? 'fazem' : 'faz'}?`;
        },
        simNao: (x, g) => `${nomes([x])} é ${artigo(g)} ${g.palavra}?`
    },
    en: {
        aberturas: [
            ['My aunt lives in a small town and loves telling how things work in that place.', 'she'],
            ['A coworker spent the whole lunch explaining what life is like in his neighborhood.', 'he'],
            ['Last week, the landlady explained to me how things are in that area.', 'she'],
            ['My grandfather worked on a farm for many years and still remembers every detail of the place.', 'he']
        ],
        ligacoes: ['Over there, ', 'Besides, ', 'Another thing: ', 'And there is more: ', 'Also over there, ', 'Keep in mind that ', 'Around there, '],
        todo: {
            substantivo: [
                (a, b) => `every ${a.palavra} is ${artigoEn(b.palavra)} ${b.palavra}`,
                (a, b) => `there is no ${a.palavra} who is not ${artigoEn(b.palavra)} ${b.palavra}`,
                (a, b) => `anyone who is ${artigoEn(a.palavra)} ${a.palavra} is also ${artigoEn(b.palavra)} ${b.palavra}`,
                (a, b) => `${a.plural}, without exception, are ${b.plural}`
            ],
            adjetivo: [
                (a, b) => `every ${a.palavra} is ${b.m}`,
                (a, b) => `there is no ${a.palavra} who is not ${b.m}`,
                (a, b) => `anyone who is ${artigoEn(a.palavra)} ${a.palavra} is ${b.m}`
            ],
            verbo: [
                (a, b) => `every ${a.palavra} ${b.presente}`,
                (a, b) => `anyone who is ${artigoEn(a.palavra)} ${a.palavra} ${b.presente}`,
                (a, b) => `every ${a.palavra}, without exception, ${b.presente}`
            ]
        },
        nenhum: [
            (a, b) => `no ${a.palavra} is ${artigoEn(b.palavra)} ${b.palavra}`,
            (a, b) => `there is no ${a.palavra} who is ${artigoEn(b.palavra)} ${b.palavra}`,
            (a, b) => `anyone who is ${artigoEn(a.palavra)} ${a.palavra} is never ${artigoEn(b.palavra)} ${b.palavra}`
        ],
        ou: [
            (a, b, c) => `every ${a.palavra} is ${artigoEn(b.palavra)} ${b.palavra} or ${artigoEn(c.palavra)} ${c.palavra}, at least one of the two`,
            (a, b, c) => `anyone who is ${artigoEn(a.palavra)} ${a.palavra} is ${artigoEn(b.palavra)} ${b.palavra}, ${artigoEn(c.palavra)} ${c.palavra}, or both`
        ],
        dizer: (sujeitos, g, negativo) => predicarEn(g, sujeitos.length > 1).replace(/^(is|are) /, negativo ? '$1 not ' : '$1 '),
        fato: {
            um: [
                (x, dito) => `${nomesEn(x)} ${dito}.`,
                (x, dito) => `${nomesEn(x)}, for example, ${dito}.`,
                (x, dito) => `Someone who always comes up in these stories is ${nomesEn(x)}, who ${dito}.`
            ],
            dois: [
                (x, dito) => `${nomesEn(x)} ${dito}.`,
                (x, dito) => `${nomesEn(x)}, for example, ${dito}.`,
                (x, dito) => `Two people who always come up in these stories are ${nomesEn(x)}, who ${dito}.`
            ]
        },
        perguntar: (pronome, oQue) => `From what ${pronome} said, ${oQue}`,
        lacuna: (x, verbo, classe) => {
            const dois = x.length > 1;
            if (verbo.startsWith('est')) return `what ${dois ? 'are' : 'is'} ${nomesEn(x)} always doing?`;
            return classe === 'adjetivo' ? `what ${dois ? 'are' : 'is'} ${nomesEn(x)} like?` : `what ${dois ? 'do' : 'does'} ${nomesEn(x)} do?`;
        },
        simNao: (x, g) => `is ${x.palavra} ${artigoEn(g.palavra)} ${g.palavra}?`
    }
};

// O parágrafo sai só do esqueleto, das palavras e das escolhas guardadas em d.moldes: com as
// mesmas escolhas e outras palavras (palavras-reais.js), sai o mesmo texto com as palavras trocadas
function textoNatural(d, palavra) {
    const N = NATURAL[d.idioma ?? 'pt'];
    const { moldes } = d;
    const esq = esqueletoDe(d.nivel, d.variante);
    const [abertura, pronome] = N.aberturas[moldes.abertura];
    let regras = 0, fatos = 0;
    const frase = (esqueleto) => {
        const r = esq.regras.find(x => x.texto === esqueleto);
        if (r) {
            const k = regras++;
            const lista = r.tipo === 'todo' ? N.todo[palavra[r.entao].classe] : N[r.tipo];
            return `${N.ligacoes[moldes.ligacoes[k]]}${lista[(moldes.regra + k) % lista.length](palavra[r.se], palavra[r.entao], r.ou && palavra[r.ou])}.`;
        }
        const f = esq.fatos.find(x => x.texto === esqueleto);
        const sujeitos = f.sujeitos.map(x => palavra[x]);
        const lista = N.fato[sujeitos.length > 1 ? 'dois' : 'um'];
        return lista[(moldes.fato + fatos++) % lista.length](sujeitos, N.dizer(sujeitos, concordar(palavra[f.predicado], generoDe(sujeitos)), f.negativo));
    };
    const sujeitos = esq.pergunta.sujeitos.map(x => palavra[x]);
    const oQue = esq.pergunta.tipo === 'sim-nao' ? N.simNao(sujeitos[0], concordar(palavra[esq.pergunta.alvo], sujeitos[0].genero))
        : N.lacuna(sujeitos, esq.pergunta.verbo, palavra[esq.resposta].classe);
    return { abertura, linhas: d.linhas.map(l => ({ ...l, texto: frase(l.esqueleto) })), pergunta: { ...d.pergunta, texto: N.perguntar(pronome, oQue) } };
}

// Sorteia a história, a ordem das ligações e por qual molde começar. "Por lá" abre sempre
function naturalizar(d, s) {
    const N = NATURAL[d.idioma];
    const moldes = {
        abertura: Math.floor(s.numero() * N.aberturas.length),
        ligacoes: [0, ...s.embaralhar(N.ligacoes.map((_, i) => i).slice(1))],
        regra: Math.floor(s.numero() * 12),
        fato: Math.floor(s.numero() * 3)
    };
    const comMoldes = { ...d, moldes };
    return { ...comMoldes, ...textoNatural(comMoldes, d.palavras) };
}

function gerarLote(nivel, quantidade, semente, idioma = 'pt') {
    if (NIVEIS[nivel].trocaDeLingua) return gerarLoteTrocado(nivel, quantidade, semente, idioma);
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
        const esq = esqueletoDe(nivel, variante);
        const ordem = s.embaralhar([...esq.regras.keys()]);
        // Na indução, os mesmos exemplos e a mesma pergunta nas duas línguas
        const inducao = esq.inducao ? estruturaDaInducao(esq, s) : undefined;
        idiomas.forEach((idioma, k) => lotes[k].push(montarDesafio(nivel, s, lexicos[k], numero, idioma, { variante, ordem, inducao })));
    }
    return lotes;
}

// --- TROCA DE LÍNGUA (nível 8) ---
// O texto vem na outra língua e a resposta é pedida na língua do site ("idioma"). O lote
// pareado dá o mesmo desafio nas duas línguas (mesmas letras, mesma ordem das regras): o texto
// sai da versão na outra língua e o gabarito sai da versão na língua da resposta. Na bateria
// G10 do benchmark, a lógica sobreviveu à troca em 36 de 36 desafios; os erros foram de forma.
const OUTRA_LINGUA = { pt: 'en', en: 'pt' };
const GLOSSARIO_TROCA = {
    pt: {
        titulo: 'Glossário', pessoas: 'Pessoas',
        verbo: (doTexto, p) => `to ${doTexto.infinitivo} → ${p.infinitivo} (verbo)`,
        adjetivo: (doTexto, p) => `${doTexto.m} → ${p.m} (adjetivo)`
    },
    en: {
        titulo: 'Glossary',
        verbo: (doTexto, p) => `${doTexto.infinitivo} → to ${p.infinitivo} (verb)`,
        adjetivo: (doTexto, p) => `${doTexto.m} → ${p.m} (adjective)`
    }
};

function gerarLoteTrocado(nivel, quantidade, semente, idioma) {
    const [naResposta, noTexto] = gerarLotePareado(nivel, quantidade, semente, [idioma, OUTRA_LINGUA[idioma]]);
    const s = criarSorteio(semente * 7 + 3);
    return naResposta.map((d, i) => trocarLingua(d, noTexto[i], s));
}

function trocarLingua(d, doTexto, s) {
    // Os nomes vêm sempre da versão em português: lá cada pessoa tem gênero, e a concordância
    // em português precisa dele. Em inglês o nome aparece sem artigo, então o glossário o diz
    const pt = d.idioma === 'pt' ? d : doTexto;
    const letras = ordenarLetras(Object.keys(d.palavras));
    const nomeNoTexto = new Map(letras.filter(v => v[0] === 'X').map(v => [doTexto.palavras[v].palavra, pt.palavras[v].palavra]));
    const trocarNomes = (texto) => texto.replace(/[A-Za-zÀ-ÿ]+/g, w => nomeNoTexto.get(w) ?? w);
    const G = GLOSSARIO_TROCA[d.idioma];
    const entradas = s.embaralhar(letras.filter(v => /^[AV]/.test(v)).map(v => G[d.palavras[v].classe](doTexto.palavras[v], d.palavras[v])));
    const pessoas = d.idioma === 'pt' ? ` ${G.pessoas}: ${letras.filter(v => v[0] === 'X').map(v => nomes([pt.palavras[v]])).join(', ')}.` : '';
    const doGabarito = (v) => v[0] === 'X' ? pt.palavras[v] : d.palavras[v];
    return {
        ...d,
        trocaDeLingua: true,
        idiomaDoTexto: doTexto.idioma,
        linhas: doTexto.linhas.map(l => ({ ...l, texto: trocarNomes(l.texto) })),
        pergunta: { ...doTexto.pergunta, texto: trocarNomes(doTexto.pergunta.texto) },
        glossario: `${G.titulo}: ${entradas.join('; ')}.${pessoas}`,
        // Uma palavra de distração na língua do texto também é erro; a palavra certa na língua
        // do texto é lógica certa com a forma errada (diagnóstico "lingua")
        distratores: [...d.distratores, ...doTexto.distratores],
        chaveNoTexto: doTexto.chave,
        legenda: letras.map(v => ({ letra: v, classe: d.palavras[v].classe,
            palavra: v[0] === 'X' ? pt.palavras[v].palavra : `${formaDicionario(doTexto.palavras[v])} → ${formaDicionario(d.palavras[v])}` })),
        formas: Object.fromEntries(letras.flatMap(v => [...formasEscritas(doTexto.palavras[v]), ...formasEscritas(doGabarito(v))].map(f => [f, d.palavras[v].classe]))),
        // O mesmo desafio sem a troca, na língua da resposta (para o modo palavras reais)
        semTroca: d
    };
}

// --- PROMPT ---
// Sem dicas: a IA não é avisada de que as palavras são inventadas nem de que
// precisa flexionar. O lote só pede o formato "1: resposta", para a correção ler.
// (O modo máximo, abaixo, é a exceção de propósito.)
// O texto natural (nível 9) é um parágrafo só, com a pergunta na linha de baixo
const paragrafoDe = (d) => [d.abertura, ...d.linhas.map(l => l.texto)].join(' ');
const corpoDoDesafio = (d) => d.abertura ? `${paragrafoDe(d)}\n${d.pergunta.texto}`
    : `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}${d.glossario ? `\n${d.glossario}` : ''}`;

const PEDIDOS = {
    pt: { lote: 'Responda esses desafios, uma resposta por linha no formato "1: resposta":', desafio: 'Desafio', unico: 'Responda esse desafio:' },
    en: { lote: 'Answer these challenges, one answer per line in the format "1: answer":', desafio: 'Challenge', unico: 'Answer this challenge:' }
};

// Os níveis de sim ou não (4 e 5) dizem no prompt como responder ("instrucao" em niveis.js)
const instrucaoDoNivel = (d) => NIVEIS[d.nivel]?.instrucao?.[d.idioma ?? 'pt'];

// --- DESEMPENHO TÍPICO E MÁXIMO ---
// O prompt de sempre mede o desempenho típico: o que a IA faz sem saber o que se espera dela.
// O modo máximo avisa que as palavras são inventadas, pede a resposta já flexionada e traz um
// exemplo resolvido de cada tipo de resposta do lote, com outras palavras inventadas. No
// benchmark (RELATORIO-G2.md, H6 e H9), um exemplo levou Haiku e Sonnet de 0/6 a 6/6 no
// gerúndio: a regra estava lá, faltava saber que podiam flexionar uma palavra que não existe.
const DICAS = {
    pt: {
        lacuna: 'As palavras são inventadas. Responda com uma palavra só, já na forma que completa a frase (gênero, número, pessoa ou gerúndio), mesmo que a palavra não exista.',
        'sim-nao': 'As palavras são inventadas. "Não dá para saber" é a resposta certa quando as frases permitem os dois casos.',
        inducao: 'As palavras são inventadas. Antes de responder, confira a regra em todos os exemplos, os de dentro e os de fora do grupo.',
        titulo: 'Exemplos resolvidos (com outras palavras):',
        // Um por flexão (o nome que flexionar() dá); "· glossário" vale para os desafios que têm um
        exemplos: {
            'presente, ele': 'Todo plimbo zarfa. O Tilo é um plimbo. O Tilo ___? → zarfa',
            'presente, eles': 'Toda brona tiquele. A Nali e o Tilo são bronas. A Nali e o Tilo ___? → tiquelem',
            'gerúndio': 'Todo plimbo zarfa. O Tilo é um plimbo. O Tilo está ___? → zarfando',
            'gerúndio · glossário': 'Todo plimbo tiquele. O Tilo é um plimbo. O Tilo está ___? Glossário: tiquelir (verbo). → tiquelindo',
            'masculino singular': 'Toda brona é grusenta. O Tilo é uma brona. O Tilo é ___? → grusento',
            'feminino singular': 'Todo plimbo é grusento. A Nali é um plimbo. A Nali é ___? → grusenta',
            'masculino plural': 'Toda brona é grusenta. A Nali e o Tilo são bronas. A Nali e o Tilo são ___? → grusentos',
            'feminino plural': 'Todo plimbo é grusento. A Nali e a Mirla são plimbos. A Nali e a Mirla são ___? → grusentas',
            [FLEXAO_SIM_NAO.pt]: [
                'Todo plimbo é uma brona. O Tilo é um plimbo. O Tilo é uma brona? → sim',
                'Nenhum plimbo é uma brona. O Tilo é um plimbo. O Tilo é uma brona? → não',
                'Todo plimbo é uma brona. O Tilo é uma brona. O Tilo é um plimbo? → não dá para saber'
            ],
            [FLEXAO_INDUCAO.pt]: 'O Tilo é grusento e não é zarfoso. O Tilo é um plimbo. A Nali não é grusenta e é zarfosa. A Nali não é um plimbo. O Gufo é grusento e é zarfoso. O Gufo é um plimbo. A Mirla não é grusenta e não é zarfosa. A Mirla é um plimbo? → não (a regra mais simples: é plimbo quem é grusento)'
        }
    },
    en: {
        lacuna: 'The words are made up. Answer with a single word, already in the form that completes the sentence (person, number or -ing), even if the word does not exist.',
        'sim-nao': 'The words are made up. "Can\'t tell" is the right answer when the sentences allow both cases.',
        inducao: 'The words are made up. Before answering, check the rule against every example, those inside and those outside the group.',
        titulo: 'Solved examples (with other words):',
        exemplos: {
            'present, he/she': 'Every plimb zarfs. Tilo is a plimb. Tilo ___? → zarfs',
            'present, they': 'Every plimb zarfs. Tilo and Nali are plimbs. Tilo and Nali ___? → zarf',
            'gerund (-ing)': 'Every plimb zarfs. Tilo is a plimb. What is Tilo doing? Tilo is ___? → zarfing',
            'adjective (no inflection)': 'Every plimb is grusky. Tilo and Nali are plimbs. Tilo and Nali are ___? → grusky',
            [FLEXAO_SIM_NAO.en]: [
                'Every plimb is a bron. Tilo is a plimb. Is Tilo a bron? → yes',
                'No plimb is a bron. Tilo is a plimb. Is Tilo a bron? → no',
                "Every plimb is a bron. Tilo is a bron. Is Tilo a plimb? → can't tell"
            ],
            [FLEXAO_INDUCAO.en]: 'Tilo is grusky and is not zarfy. Tilo is a plimb. Nali is not grusky and is zarfy. Nali is not a plimb. Gufo is grusky and is zarfy. Gufo is a plimb. Mirla is not grusky and is not zarfy. Is Mirla a plimb? → no (the simplest rule: whoever is grusky is a plimb)'
        }
    }
};

// A dica (logo depois do pedido) e os exemplos resolvidos (antes dos desafios)
function dicaDoModoMaximo(desafios) {
    const D = DICAS[desafios[0]?.idioma ?? 'pt'];
    const tipos = new Set(desafios.map(d => d.inducao ? 'inducao' : d.tipoResposta === 'sim-nao' ? 'sim-nao' : 'lacuna'));
    const chaves = new Set(desafios.map(d => d.glossario && D.exemplos[`${d.flexao} · glossário`] ? `${d.flexao} · glossário` : d.flexao));
    const exemplos = Object.entries(D.exemplos).filter(([k]) => chaves.has(k)).flatMap(([, e]) => e);
    return { texto: [...tipos].map(t => D[t]).join('\n'), exemplos: exemplos.length ? [D.titulo, ...exemplos].join('\n') : null };
}

// modo: 'tipico' (o prompt de sempre, sem dica) ou 'maximo'
function montarPrompt(desafios, modo = 'tipico') {
    const p = PEDIDOS[desafios[0]?.idioma ?? 'pt'];
    const instrucoes = [...new Set(desafios.map(instrucaoDoNivel).filter(Boolean))];
    const dica = modo === 'maximo' ? dicaDoModoMaximo(desafios) : null;
    return [[p.lote, ...instrucoes, dica?.texto].filter(Boolean).join('\n'), dica?.exemplos,
        ...desafios.map(d => `${p.desafio} ${d.numero}\n${corpoDoDesafio(d)}`)].filter(Boolean).join('\n\n');
}

// Um desafio só, para mandar manualmente
function montarPromptUnico(d, modo = 'tipico') {
    const dica = modo === 'maximo' ? dicaDoModoMaximo([d]) : null;
    return [[PEDIDOS[d.idioma ?? 'pt'].unico, instrucaoDoNivel(d), dica?.texto].filter(Boolean).join('\n'), dica?.exemplos, corpoDoDesafio(d)].filter(Boolean).join('\n\n');
}

// Índice de intuição (RELATORIO-G2.md): no mesmo lote, os acertos sem dica divididos pelos
// acertos com dica e exemplo. Perto de 1, a IA faz sozinha o que se espera; perto de 0, ela
// sabe fazer, mas precisa ser guiada. Sem acerto no modo máximo, não há o que dividir.
function indiceDeIntuicao(tipico, maximo) {
    const certos = (r) => r.filter(x => x.status === 'certo').length;
    const a = certos(tipico), b = certos(maximo);
    return { tipico: a, maximo: b, total: tipico.length, indice: b ? a / b : null };
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
        // Troca de língua (nível 8): a palavra certa, mas na língua do texto
        const naLinguaDoTexto = Boolean(d.chaveNoTexto) && palavras.some(w => w.startsWith(d.chaveNoTexto));
        let status;
        if (cita(d.chavesArmadilha)) status = 'armadilha';
        else if (cita(d.distratores)) status = 'errado';
        else if (exata) status = formasDaResposta.size > 1 ? 'ambigua' : 'certo';
        else status = formasDaResposta.size || naLinguaDoTexto ? 'flexao' : 'errado';
        const r = { numero: d.numero, dada, status };
        if (status === 'flexao') r.diagnostico = formasDaResposta.size ? diagnosticarFlexao(d, palavras, [...formasDaResposta][0]) : 'lingua';
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
//   lingua     (nível 8, em corrigir) a palavra certa na língua do texto, não na da resposta
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
    // Na troca de língua o texto vem em inglês, sem o gênero do substantivo: não há o que atrair
    const grupo = fato && !d.trocaDeLingua && d.palavras[fato[2]];
    return grupo && grupo.genero === generoDado ? 'atracao' : 'genero';
}

// Placar nos dois eixos, a partir do resultado de corrigir()
function placarDosEixos(resultado) {
    const conta = (...status) => resultado.filter(r => status.includes(r.status)).length;
    const logica = conta('certo', 'ambigua', 'flexao');
    return { total: resultado.length, logica, morfologia: conta('certo') };
}
