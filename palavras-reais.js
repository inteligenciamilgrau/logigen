// LOGIGEN - PALAVRAS REAIS
// O mesmo desafio com palavras de verdade no lugar das inventadas, para uma pessoa conferir
// se a lógica faz sentido. Cada palavra inventada vira uma real da mesma classe, com todas
// as formas ("plalhomas" -> "girafas", "zedantosa" -> "peluda", "glovundando" -> "nadando"),
// e em português o gênero é mantido: os artigos do texto continuam certos.
// As frases podem ficar absurdas ("Toda baleia voa."), mas a lógica vale do mesmo jeito.
// O prompt para a IA continua com as palavras inventadas: elas é que medem o raciocínio.

const masculino = (lista) => lista.map(([palavra, plural]) => ({ classe: 'substantivo', genero: 'm', palavra, plural: plural ?? palavra + 's' }));
const feminino = (lista) => lista.map(([palavra, plural]) => ({ classe: 'substantivo', genero: 'f', palavra, plural: plural ?? palavra + 's' }));
const nomesReais = (lista, genero) => lista.map(palavra => ({ classe: 'nome', genero, palavra }));

const PALAVRAS_REAIS = {
    pt: {
        substantivo: {
            m: masculino([['gato'], ['cachorro'], ['pato'], ['sapo'], ['lobo'], ['urso'], ['coelho'], ['macaco'], ['cavalo'], ['peixe'],
                ['pássaro'], ['rato'], ['tigre'], ['touro'], ['galo'], ['pombo'], ['camelo'], ['golfinho'], ['castor', 'castores'], ['pinguim', 'pinguins']]),
            f: feminino([['girafa'], ['zebra'], ['baleia'], ['coruja'], ['tartaruga'], ['abelha'], ['formiga'], ['aranha'], ['raposa'], ['ovelha'],
                ['cabra'], ['foca'], ['lontra'], ['borboleta'], ['galinha'], ['vaca'], ['onça'], ['lula'], ['minhoca'], ['arara']])
        },
        // Só adjetivos de duas formas (peludo/peluda), para a concordância de gênero continuar valendo
        adjetivo: ['peludo', 'listrado', 'pintado', 'gordo', 'magro', 'alto', 'baixo', 'branco', 'preto', 'vermelho', 'amarelo', 'barulhento',
            'ciumento', 'preguiçoso', 'curioso', 'medroso', 'famoso', 'sonolento', 'faminto', 'corajoso']
            .map(m => { const f = m.slice(0, -1) + 'a'; return { classe: 'adjetivo', m, f, mp: m + 's', fp: f + 's' }; }),
        verbo: [['nadar', 'nada', 'nadam', 'nadando'], ['voar', 'voa', 'voam', 'voando'], ['pular', 'pula', 'pulam', 'pulando'],
            ['cantar', 'canta', 'cantam', 'cantando'], ['dançar', 'dança', 'dançam', 'dançando'], ['correr', 'corre', 'correm', 'correndo'],
            ['comer', 'come', 'comem', 'comendo'], ['dormir', 'dorme', 'dormem', 'dormindo'], ['latir', 'late', 'latem', 'latindo'],
            ['uivar', 'uiva', 'uivam', 'uivando'], ['rugir', 'ruge', 'rugem', 'rugindo'], ['cavar', 'cava', 'cavam', 'cavando'],
            ['brincar', 'brinca', 'brincam', 'brincando'], ['assobiar', 'assobia', 'assobiam', 'assobiando'], ['mergulhar', 'mergulha', 'mergulham', 'mergulhando'],
            ['escalar', 'escala', 'escalam', 'escalando'], ['espirrar', 'espirra', 'espirram', 'espirrando'], ['roncar', 'ronca', 'roncam', 'roncando'],
            ['tossir', 'tosse', 'tossem', 'tossindo'], ['piscar', 'pisca', 'piscam', 'piscando']]
            .map(([infinitivo, presente, plural, gerundio]) => ({ classe: 'verbo', infinitivo, presente, plural, gerundio })),
        nome: {
            m: nomesReais(['Pedro', 'Lucas', 'Rafael', 'Bruno', 'Tiago', 'André', 'Mateus', 'Caio'], 'm'),
            f: nomesReais(['Ana', 'Júlia', 'Beatriz', 'Carla', 'Marina', 'Lívia', 'Sofia', 'Clara'], 'f')
        }
    },
    en: {
        // Todos começam com consoante: o artigo do texto é sempre "a", como nas palavras inventadas
        substantivo: {
            m: masculino([['cat'], ['dog'], ['frog'], ['wolf', 'wolves'], ['bear'], ['rabbit'], ['monkey'], ['horse'], ['parrot'], ['tiger'],
                ['lion'], ['goat'], ['whale'], ['zebra'], ['giraffe'], ['turtle'], ['spider'], ['fox', 'foxes'], ['duck'], ['bee'],
                ['mouse', 'mice'], ['camel'], ['dolphin'], ['penguin'], ['beaver']])
        },
        adjetivo: ['furry', 'striped', 'spotted', 'fat', 'thin', 'tall', 'short', 'white', 'black', 'red', 'yellow', 'noisy',
            'jealous', 'lazy', 'curious', 'shy', 'famous', 'sleepy', 'hungry', 'brave']
            .map(w => ({ classe: 'adjetivo', m: w, f: w, mp: w, fp: w })),
        verbo: [['swim', 'swims', 'swimming'], ['fly', 'flies', 'flying'], ['jump', 'jumps', 'jumping'], ['sing', 'sings', 'singing'],
            ['dance', 'dances', 'dancing'], ['run', 'runs', 'running'], ['eat', 'eats', 'eating'], ['sleep', 'sleeps', 'sleeping'],
            ['bark', 'barks', 'barking'], ['howl', 'howls', 'howling'], ['roar', 'roars', 'roaring'], ['dig', 'digs', 'digging'],
            ['play', 'plays', 'playing'], ['whistle', 'whistles', 'whistling'], ['dive', 'dives', 'diving'], ['climb', 'climbs', 'climbing'],
            ['crawl', 'crawls', 'crawling'], ['hop', 'hops', 'hopping'], ['sneeze', 'sneezes', 'sneezing'], ['snore', 'snores', 'snoring']]
            .map(([base, presente, gerundio]) => ({ classe: 'verbo', infinitivo: base, presente, plural: base, gerundio })),
        nome: {
            m: nomesReais(['Peter', 'Lucas', 'Mark', 'Bruno', 'Tom', 'Daniel', 'Henry', 'Oliver'], 'm'),
            f: nomesReais(['Anna', 'Julia', 'Grace', 'Clara', 'Mary', 'Lily', 'Sophie', 'Emma'], 'f')
        }
    }
};

// Os campos que mudam de forma em cada classe (os mesmos das palavras inventadas)
const CAMPOS_DA_CLASSE = {
    substantivo: ['palavra', 'plural'],
    adjetivo: ['m', 'f', 'mp', 'fp'],
    verbo: ['infinitivo', 'presente', 'plural', 'gerundio'],
    nome: ['palavra']
};

function hashDoTexto(texto) {
    let h = 2166136261;
    for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
}

// Escolhe as palavras reais do desafio (sempre as mesmas para o mesmo desafio) e monta as
// trocas nos dois sentidos: inventada -> real (para mostrar) e real -> inventada (para corrigir)
const trocasCalculadas = new WeakMap();
function trocasDoDesafio(d) {
    if (trocasCalculadas.has(d)) return trocasCalculadas.get(d);
    const vocabulario = PALAVRAS_REAIS[d.idioma ?? 'pt'];
    const s = criarSorteio(hashDoTexto(`${d.idioma}|${d.numero}|${d.chave}`));
    const embaralhados = new Map();
    const opcoes = (p) => {
        const lista = vocabulario[p.classe];
        const grupo = Array.isArray(lista) ? lista : (lista[p.genero] ?? lista.m);
        if (!embaralhados.has(grupo)) embaralhados.set(grupo, s.embaralhar(grupo));
        return embaralhados.get(grupo);
    };
    const usadas = new Set();
    const reais = {};
    const paraReal = new Map(), paraInventada = new Map();
    for (const [letra, p] of Object.entries(d.palavras)) {
        const real = opcoes(p).find(r => !usadas.has(r)) ?? opcoes(p)[0];
        usadas.add(real);
        reais[letra] = real;
        for (const campo of CAMPOS_DA_CLASSE[p.classe]) {
            paraReal.set(p[campo], real[campo]);
            paraInventada.set(normalizar(real[campo]), p[campo]);
        }
    }
    const trocas = { reais, paraReal, paraInventada };
    trocasCalculadas.set(d, trocas);
    return trocas;
}

const trocarPalavras = (texto, mapa) => texto.replace(/[A-Za-zÀ-ÿ]+/g, w => mapa.get(w) ?? w);

// Uma cópia do desafio com as palavras reais em tudo o que aparece na tela
function versaoComPalavrasReais(d) {
    const { reais, paraReal } = trocasDoDesafio(d);
    const letras = Object.keys(d.palavras);
    return {
        ...d,
        linhas: d.linhas.map(l => ({ ...l, texto: trocarPalavras(l.texto, paraReal) })),
        pergunta: { ...d.pergunta, texto: trocarPalavras(d.pergunta.texto, paraReal) },
        resposta: trocarPalavras(d.resposta, paraReal),
        armadilhas: d.armadilhas.map(a => ({ ...a, palavras: a.palavras.map(w => trocarPalavras(w, paraReal)) })),
        legenda: letras.map(v => ({ letra: v, palavra: formaDicionario(reais[v]), classe: reais[v].classe })),
        formas: Object.fromEntries(letras.flatMap(v => formasEscritas(reais[v]).map(f => [f, reais[v].classe])))
    };
}

// Resposta escrita com as palavras reais -> mesma resposta com as inventadas, para o corretor
function respostaParaInventadas(texto, d) {
    const { paraInventada } = trocasDoDesafio(d);
    return texto.replace(/[A-Za-zÀ-ÿ]+/g, w => paraInventada.get(normalizar(w)) ?? w);
}
