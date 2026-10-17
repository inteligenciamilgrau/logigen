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
    const esq = { regras: [], fatos: [], pergunta: null, resposta: null, variaveis: [] };
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
            esq.regras.push({ se: m[1], entao: m[2], texto: linha });
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

function fraseRegra({ se, entao }) {
    if (se.classe === 'substantivo') return `${todo(se)} ${se.palavra} ${predicar(entao, se.genero, false)}.`;
    return `Quem ${predicar(se, 'm', false)} ${predicar(entao, 'm', false)}.`;
}

function fraseFato({ sujeitos, predicado }) {
    return maiuscula(`${nomes(sujeitos)} ${predicar(predicado, generoDe(sujeitos), sujeitos.length > 1)}.`);
}

// Forma de dicionário (masculino singular, infinitivo): como as palavras aparecem na legenda
function formaDicionario(p) {
    if (p.classe === 'adjetivo') return p.m;
    if (p.classe === 'verbo') return p.infinitivo;
    return p.palavra;
}

// O que vem antes da lacuna, conforme o verbo da pergunta e a classe da resposta
const MOLDES = {
    'é': { adjetivo: 'é ', verbo: '' },
    'são': { adjetivo: 'são ', verbo: '' },
    'está': { verbo: 'está ' },
    'estão': { verbo: 'estão ' }
};

// "A Xemela é ___?", "A Xemela e o Zuvrel ___?", "A Xemela está ___?" — sem opções, sem dica
function frasePergunta(sujeitos, verbo, classe) {
    return maiuscula(`${nomes(sujeitos)} ${MOLDES[verbo][classe]}___?`);
}

// A forma que a frase da pergunta exige, e o nome dessa flexão
function flexionar(p, verbo, sujeitos) {
    const plural = sujeitos.length > 1;
    if (p.classe === 'adjetivo') {
        const g = generoDe(sujeitos);
        return { forma: p[g + (plural ? 'p' : '')], flexao: `${g === 'm' ? 'masculino' : 'feminino'} ${plural ? 'plural' : 'singular'}` };
    }
    if (verbo.startsWith('est')) return { forma: p.gerundio, flexao: 'gerúndio' };
    return plural ? { forma: p.plural, flexao: 'presente, eles' } : { forma: p.presente, flexao: 'presente, ele' };
}

// Personagens, depois grupos, adjetivos e verbos, cada um em ordem: X1 X2 · G1 G2 · A1 A2
function ordenarLetras(variaveis) {
    const ordem = 'XGAV';
    const numero = (v) => parseInt(v.slice(1), 10);
    return [...variaveis].sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]) || numero(a) - numero(b));
}

// --- MONTAGEM ---
function montarDesafio(nivel, s, lexico, numero) {
    const variante = s.item(Object.keys(NIVEIS[nivel].variantes));
    const esq = esqueletoDe(nivel, variante);
    const { verbo } = esq.pergunta;
    const gerundio = verbo.startsWith('est');
    const palavra = {};
    for (const v of esq.variaveis) {
        const tipo = tipoDaVariavel(v);
        // Gerúndio: só verbos em -ar, para a forma pedida sair do texto (ver niveis.js)
        palavra[v] = tipo === 'verbo' && gerundio ? lexico.verbo(PRIMEIRA) : lexico[tipo]();
    }

    // Concordância com um personagem só ("X1 é ___?" com resposta adjetivo): o personagem
    // recebe o gênero oposto ao da forma que aparece na regra. Senão, copiar a regra já
    // acertaria e o teste não mediria a concordância.
    const [letraUnica, ...outros] = esq.pergunta.sujeitos;
    if (verbo === 'é' && !outros.length && tipoDaVariavel(esq.resposta) === 'adjetivo') {
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
    const { forma, flexao } = flexionar(resposta, verbo, sujeitos);

    const regrasArmadilha = new Set(armadilhas.map(a => a.regra));
    const regras = s.embaralhar(modelo.regras).map(r => ({ texto: fraseRegra(r), esqueleto: r.esqueleto, armadilha: regrasArmadilha.has(r) }));
    const fatos = modelo.fatos.map(f => ({ texto: fraseFato(f), esqueleto: f.esqueleto }));
    const letrasSujeito = esq.pergunta.sujeitos.join(' e ');
    const verboDaConclusao = sujeitos.length > 1 ? 'são' : 'é';
    const letras = ordenarLetras(esq.variaveis);

    return {
        numero,
        nivel,
        variante,
        linhas: [...regras, ...fatos],
        pergunta: { texto: frasePergunta(sujeitos, verbo, resposta.classe), esqueleto: esq.pergunta.texto },
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
            palavras: a.leva.map(p => flexionar(p, verbo, sujeitos).forma)
        })),
        chavesArmadilha: armadilhas.flatMap(a => a.leva.map(p => p.chave)),
        legenda: letras.map(v => ({ letra: v, palavra: formaDicionario(palavra[v]), classe: palavra[v].classe })),
        // forma escrita -> classe, para a interface colorir o texto
        formas: Object.fromEntries(letras.flatMap(v => formasEscritas(palavra[v]).map(f => [f, palavra[v].classe])))
    };
}

function gerarLote(nivel, quantidade, semente) {
    const s = criarSorteio(semente);
    const lexico = criarLexico(s);
    return Array.from({ length: quantidade }, (_, i) => montarDesafio(nivel, s, lexico, i + 1));
}

// --- PROMPT ---
// Sem dicas: a IA não é avisada de que as palavras são inventadas nem de que
// precisa flexionar. O lote só pede o formato "1: resposta", para a correção ler.
const corpoDoDesafio = (d) => `${d.linhas.map(l => l.texto).join('\n')}\n${d.pergunta.texto}`;

function montarPrompt(desafios) {
    return 'Responda esses desafios, uma resposta por linha no formato "1: resposta":\n\n' +
        desafios.map(d => `Desafio ${d.numero}\n${corpoDoDesafio(d)}`).join('\n\n');
}

// Um desafio só, para mandar manualmente
function montarPromptUnico(d) {
    return `Responda esse desafio:\n\n${corpoDoDesafio(d)}`;
}

// --- CORREÇÃO ---
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Lê linhas no formato "3: resposta" (aceita "3.", "3)", "Desafio 3:", negrito...).
// Se o número aparecer mais de uma vez, vale a última (a lista final da IA).
function lerRespostas(texto) {
    const respostas = new Map();
    for (const bruta of texto.split(/\r?\n/)) {
        const linha = bruta.replace(/[*_`#>]/g, '').trim();
        const m = linha.match(/^(?:desafio|quest[aã]o|pergunta|resposta)?\s*(\d{1,3})\s*[:.)\-–—]\s*(.+)$/i);
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
        const palavras = normalizar(dada).split(/[^a-z]+/).filter(Boolean);
        const cita = (chaves) => palavras.some(w => chaves.some(c => w.startsWith(c)));
        const formasDaResposta = new Set(palavras.filter(w => w.startsWith(d.chave)));
        const exata = formasDaResposta.has(d.resposta);
        let status;
        if (cita(d.chavesArmadilha)) status = 'armadilha';
        else if (cita(d.distratores)) status = 'errado';
        else if (exata) status = formasDaResposta.size > 1 ? 'ambigua' : 'certo';
        else status = formasDaResposta.size ? 'flexao' : 'errado';
        return { numero: d.numero, dada, status };
    });
}

// Placar nos dois eixos, a partir do resultado de corrigir()
function placarDosEixos(resultado) {
    const conta = (...status) => resultado.filter(r => status.includes(r.status)).length;
    const logica = conta('certo', 'ambigua', 'flexao');
    return { total: resultado.length, logica, morfologia: conta('certo') };
}
