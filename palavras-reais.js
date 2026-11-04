// LOGIGEN - PALAVRAS REAIS
// O mesmo desafio com palavras de verdade no lugar das inventadas, para uma pessoa conferir
// se a lógica faz sentido. Cada palavra inventada vira uma real da mesma classe, e as frases
// são remontadas a partir do esqueleto ("A Júlia é uma professora", "Todo professor é curioso").
// O prompt para a IA continua com as palavras inventadas: elas é que medem o raciocínio.
//
// A gramática não basta para escolher as palavras: "Toda lula é um rato" e "O Caio é um
// sucesso" são frases bem formadas, com substantivo dos dois lados do "é". O que falha é o
// sentido (as restrições de seleção da semântica). Palavra inventada não tem sentido nenhum,
// e por isso mede a lógica pura; palavra real tem, então cada uma traz aqui os seus traços:
//   tipo     humano, animal ou abstrato (substantivos)
//   serve    os tipos de quem pode ter esse adjetivo ou fazer esse verbo
//   exclui   palavras com o mesmo valor não valem juntas para a mesma pessoa ou coisa
//   e        de que outros grupos este faz parte ("escritor" é "leitor")
//   faz      o que este grupo costuma fazer ("cantor" canta)
// Com eles, o medidor abaixo dá o absurdo de cada frase, numa escala de 0 a 3.

// --- SENTIDO ---
const HUMANO = ['humano'], ANIMAL = ['animal'];

// Substantivos de duas formas (ou uma só, como "artista"): concordam com a pessoa
const PESSOAS = [
    { m: 'médico', f: 'médica', en: 'doctor' }, { m: 'enfermeiro', f: 'enfermeira', en: 'nurse' },
    { m: 'advogado', f: 'advogada', en: 'lawyer' }, { m: 'engenheiro', f: 'engenheira', en: 'engineer' },
    { m: 'cozinheiro', f: 'cozinheira', en: 'cook' }, { m: 'padeiro', f: 'padeira', en: 'baker' },
    { m: 'fazendeiro', f: 'fazendeira', en: 'farmer' }, { m: 'marinheiro', f: 'marinheira', en: 'sailor' },
    { m: 'vizinho', f: 'vizinha', en: 'neighbor' }, { m: 'dentista', en: 'dentist' }, { m: 'motorista', en: 'driver' },
    { m: 'professor', f: 'professora', en: 'teacher', e: ['leitor'], faz: ['estudar'] },
    { m: 'jornalista', en: 'journalist', e: ['leitor'] },
    { m: 'escritor', f: 'escritora', en: 'writer', e: ['leitor', 'artista'] },
    { m: 'leitor', f: 'leitora', en: 'reader' },
    { m: 'artista', en: 'artist', faz: ['desenhar', 'cantar', 'dançar'] },
    { m: 'pintor', f: 'pintora', en: 'painter', e: ['artista'], faz: ['desenhar'] },
    { m: 'cantor', f: 'cantora', en: 'singer', e: ['artista'], faz: ['cantar'] },
    { m: 'pianista', en: 'pianist', e: ['artista'] },
    { m: 'dançarino', f: 'dançarina', en: 'dancer', e: ['artista'], faz: ['dançar'] },
    { m: 'atleta', en: 'athlete', faz: ['correr', 'nadar', 'pular', 'remar'] },
    { m: 'nadador', f: 'nadadora', en: 'swimmer', e: ['atleta'], faz: ['nadar', 'mergulhar'] },
    { m: 'maratonista', en: 'runner', e: ['atleta'], faz: ['correr'] },
    { m: 'estudante', en: 'student', faz: ['estudar'] }, { m: 'turista', en: 'tourist', faz: ['viajar'] }
];

// Bichos e abstratos, de gênero fixo. Com pessoas, ficam acima do limite do site: estão aqui
// para o medidor (e para uma bateria com o absurdo como variável)
const ANIMAIS = [
    ['gato', 'm', 'cat'], ['rato', 'm', 'mouse', 'mice'], ['cavalo', 'm', 'horse'], ['macaco', 'm', 'monkey'], ['tigre', 'm', 'tiger'], ['lobo', 'm', 'wolf', 'wolves'],
    ['lula', 'f', 'squid'], ['formiga', 'f', 'ant'], ['baleia', 'f', 'whale'], ['vaca', 'f', 'cow'], ['coruja', 'f', 'owl'], ['zebra', 'f', 'zebra']
].map(([pt, genero, en, plural]) => ({ pt, genero, en, plural, tipo: 'animal', exclui: 'especie' }));
const ABSTRATOS = [
    ['sucesso', 'm', 'success', 'successes'], ['talento', 'm', 'talent'], ['orgulho', 'm', 'pride'], ['ideia', 'f', 'idea'], ['promessa', 'f', 'promise'],
    ['lembrança', 'f', 'memory', 'memories'], ['mentira', 'f', 'lie', undefined, 'verdade'], ['verdade', 'f', 'truth', undefined, 'verdade']
].map(([pt, genero, en, plural, exclui]) => ({ pt, genero, en, plural, tipo: 'abstrato', exclui }));

// Em português, só adjetivos de duas formas (curioso/curiosa), para a concordância continuar valendo
const ADJETIVOS = [
    ['curioso', 'curious'], ['famoso', 'famous'], ['preguiçoso', 'lazy'], ['ciumento', 'jealous'], ['sonolento', 'sleepy'], ['faminto', 'hungry'],
    ['barulhento', 'noisy'], ['generoso', 'generous'], ['teimoso', 'stubborn'], ['cuidadoso', 'careful'], ['engraçado', 'funny'], ['atento', 'attentive'],
    ['esperto', 'clever'], ['orgulhoso', 'proud'], ['desconfiado', 'suspicious'],
    ['educado', 'polite', { serve: HUMANO }], ['honesto', 'honest', { serve: HUMANO }], ['sincero', 'sincere', { serve: HUMANO }], ['vaidoso', 'vain', { serve: HUMANO }],
    ['corajoso', 'brave', { exclui: 'coragem' }], ['medroso', 'fearful', { exclui: 'coragem' }],
    ['alto', 'tall', { exclui: 'altura' }], ['baixo', 'short', { exclui: 'altura' }],
    ['peludo', 'furry', { serve: ANIMAL }], ['listrado', 'striped', { serve: ANIMAL }]
];

// Nada de "comer" e "dormir": valem para todo mundo, e a resposta sairia do mundo, não das regras
const VERBOS = [
    [['nadar', 'nada', 'nadam', 'nadando'], ['swim', 'swims', 'swimming']], [['pular', 'pula', 'pulam', 'pulando'], ['jump', 'jumps', 'jumping']],
    [['cantar', 'canta', 'cantam', 'cantando'], ['sing', 'sings', 'singing'], HUMANO], [['dançar', 'dança', 'dançam', 'dançando'], ['dance', 'dances', 'dancing'], HUMANO],
    [['correr', 'corre', 'correm', 'correndo'], ['run', 'runs', 'running']], [['desenhar', 'desenha', 'desenham', 'desenhando'], ['draw', 'draws', 'drawing'], HUMANO],
    [['viajar', 'viaja', 'viajam', 'viajando'], ['travel', 'travels', 'traveling'], HUMANO], [['estudar', 'estuda', 'estudam', 'estudando'], ['study', 'studies', 'studying'], HUMANO],
    [['pescar', 'pesca', 'pescam', 'pescando'], ['fish', 'fishes', 'fishing'], HUMANO], [['cavar', 'cava', 'cavam', 'cavando'], ['dig', 'digs', 'digging']],
    [['brincar', 'brinca', 'brincam', 'brincando'], ['play', 'plays', 'playing']], [['assobiar', 'assobia', 'assobiam', 'assobiando'], ['whistle', 'whistles', 'whistling'], HUMANO],
    [['mergulhar', 'mergulha', 'mergulham', 'mergulhando'], ['dive', 'dives', 'diving']], [['escalar', 'escala', 'escalam', 'escalando'], ['climb', 'climbs', 'climbing']],
    [['remar', 'rema', 'remam', 'remando'], ['row', 'rows', 'rowing'], HUMANO], [['patinar', 'patina', 'patinam', 'patinando'], ['skate', 'skates', 'skating'], HUMANO],
    [['espirrar', 'espirra', 'espirram', 'espirrando'], ['sneeze', 'sneezes', 'sneezing']], [['roncar', 'ronca', 'roncam', 'roncando'], ['snore', 'snores', 'snoring']],
    [['tossir', 'tosse', 'tossem', 'tossindo'], ['cough', 'coughs', 'coughing']], [['piscar', 'pisca', 'piscam', 'piscando'], ['blink', 'blinks', 'blinking']],
    [['latir', 'late', 'latem', 'latindo'], ['bark', 'barks', 'barking'], ANIMAL], [['uivar', 'uiva', 'uivam', 'uivando'], ['howl', 'howls', 'howling'], ANIMAL],
    [['rugir', 'ruge', 'rugem', 'rugindo'], ['roar', 'roars', 'roaring'], ANIMAL], [['voar', 'voa', 'voam', 'voando'], ['fly', 'flies', 'flying'], ANIMAL]
];

const nomesReais = (lista, genero) => lista.map(palavra => ({ classe: 'nome', genero, palavra }));
const pluralPt = (w) => w + (w.endsWith('r') ? 'es' : 's');
const SERVE_A_TODOS = ['humano', 'animal'];

const PALAVRAS_REAIS = {
    pt: {
        substantivo: [
            ...PESSOAS.map(p => ({ classe: 'substantivo', genero: 'm', id: p.m, tipo: 'humano', e: p.e, faz: p.faz,
                palavra: p.m, plural: pluralPt(p.m), f: p.f ?? p.m, fp: pluralPt(p.f ?? p.m) })),
            ...[...ANIMAIS, ...ABSTRATOS].map(({ pt, genero, tipo, exclui }) => ({ classe: 'substantivo', genero, id: pt, tipo, exclui, palavra: pt, plural: pt + 's' }))
        ],
        adjetivo: ADJETIVOS.map(([m, , sentido]) => {
            const f = m.slice(0, -1) + 'a';
            return { classe: 'adjetivo', id: m, serve: SERVE_A_TODOS, ...sentido, m, f, mp: m + 's', fp: f + 's' };
        }),
        verbo: VERBOS.map(([[infinitivo, presente, plural, gerundio], , serve]) => ({ classe: 'verbo', id: infinitivo, serve: serve ?? SERVE_A_TODOS, infinitivo, presente, plural, gerundio })),
        nome: {
            m: nomesReais(['Pedro', 'Lucas', 'Rafael', 'Bruno', 'Tiago', 'André', 'Mateus', 'Caio'], 'm'),
            f: nomesReais(['Ana', 'Júlia', 'Beatriz', 'Carla', 'Marina', 'Lívia', 'Sofia', 'Clara'], 'f')
        },
        // Só quando a lista acima acaba (a indução tem até 11 personagens num desafio)
        reserva: {
            m: nomesReais(['Gabriel', 'Felipe', 'Diego', 'Renato', 'Samuel', 'Vítor', 'Otávio', 'Murilo', 'Henrique', 'Igor', 'Leandro'], 'm'),
            f: nomesReais(['Laura', 'Helena', 'Camila', 'Paula', 'Bianca', 'Lúcia', 'Renata', 'Olívia', 'Débora', 'Iara', 'Flávia'], 'f')
        }
    },
    en: {
        substantivo: [
            ...PESSOAS.map(p => ({ classe: 'substantivo', genero: 'm', id: p.m, tipo: 'humano', e: p.e, faz: p.faz, palavra: p.en, plural: p.en + 's' })),
            ...[...ANIMAIS, ...ABSTRATOS].map(({ pt, en, plural, tipo, exclui }) => ({ classe: 'substantivo', genero: 'm', id: pt, tipo, exclui, palavra: en, plural: plural ?? en + 's' }))
        ],
        adjetivo: ADJETIVOS.map(([id, w, sentido]) => ({ classe: 'adjetivo', id, serve: SERVE_A_TODOS, ...sentido, m: w, f: w, mp: w, fp: w })),
        verbo: VERBOS.map(([[id], [base, presente, gerundio], serve]) => ({ classe: 'verbo', id, serve: serve ?? SERVE_A_TODOS, infinitivo: base, presente, plural: base, gerundio })),
        nome: {
            m: nomesReais(['Peter', 'Lucas', 'Mark', 'Bruno', 'Tom', 'Daniel', 'Henry', 'Oliver'], 'm'),
            f: nomesReais(['Anna', 'Julia', 'Grace', 'Clara', 'Mary', 'Lily', 'Sophie', 'Emma'], 'f')
        },
        reserva: {
            m: nomesReais(['Jack', 'Sam', 'Leo', 'Max', 'Owen', 'Ben', 'Hugo', 'Felix', 'Victor', 'Simon', 'Adam'], 'm'),
            f: nomesReais(['Rose', 'Kate', 'Alice', 'Ella', 'Ruby', 'Nora', 'Iris', 'Hazel', 'Ivy', 'Jane', 'Laura'], 'f')
        }
    }
};

// --- MEDIDOR DE ABSURDO ---
//   0 plausível   o mundo confirma            "Todo escritor é um leitor", "Todo cantor canta"
//   1 possível    nada impede                 "Todo professor é um cantor"
//   2 absurda     tipos que não se encaixam   "O Caio é um sucesso", "Todo professor late"
//   3 impossível  as duas partes se excluem   "Toda lula é um rato"
const PLAUSIVEL = 0, POSSIVEL = 1, ABSURDA = 2, IMPOSSIVEL = 3;
// O que o site aceita. Mas nem o 0 entra: se dois grupos do desafio têm relação no mundo, a
// resposta pode sair do mundo, não das regras. Com "Todo pintor é um escritor" e "O Caio não é
// um leitor", "O Caio é um pintor?" deixaria de ser "não dá para saber" (seRelacionam, abaixo)
const LIMITE_DE_ABSURDO = POSSIVEL;

const tiposDe = (p) => p.serve ?? [p.tipo ?? 'humano'];   // personagem: humano
const seExcluem = (a, b) => a !== b && Boolean(a.exclui) && a.exclui === b.exclui;
const ehTipico = (a, b) => Boolean(b.id) && [...(a.e ?? []), ...(a.faz ?? [])].includes(b.id);
const seRelacionam = (a, b) => seExcluem(a, b) || ehTipico(a, b) || ehTipico(b, a);

// "a é b" ou "a faz b"
function absurdoDoPar(a, b) {
    if (seExcluem(a, b)) return IMPOSSIVEL;
    if (!tiposDe(a).some(t => tiposDe(b).includes(t))) return ABSURDA;
    return ehTipico(a, b) ? PLAUSIVEL : POSSIVEL;
}
// "nenhum a é b": o contrário do par. Falso quando um contém o outro, certo quando se excluem
const absurdoDoNenhum = (a, b) => ehTipico(a, b) || ehTipico(b, a) ? IMPOSSIVEL : seExcluem(a, b) ? PLAUSIVEL : POSSIVEL;
// "X não é b": para um tipo que X nunca seria, só diz o óbvio
const absurdoDoNao = (x, b) => absurdoDoPar(x, b) >= ABSURDA ? PLAUSIVEL : POSSIVEL;

// Um exemplo da indução: "X1: A1, não A2, A3 → não G1" (a pergunta termina em "G1?")
function lerExemplo(esqueleto) {
    const [, x, tracos, nao, grupo] = esqueleto.match(/^(X\d+): (.+) → (não )?(G\d+)\??$/);
    return { x, grupo, foraDoGrupo: Boolean(nao), tracos: tracos.split(', ').map(t => t.startsWith('não ') ? [t.slice(4), false] : [t, true]) };
}

// O absurdo do desafio é o da sua pior frase
function absurdoDoDesafio(d, palavra) {
    const esq = esqueletoDe(d.nivel, d.variante);
    if (esq.inducao) {
        return Math.max(...[...d.linhas.map(l => l.esqueleto), d.pergunta.esqueleto].map(lerExemplo).flatMap(({ x, grupo, foraDoGrupo, tracos }) => {
            const tem = tracos.filter(([, sim]) => sim).map(([v]) => palavra[v]);
            return [
                foraDoGrupo ? absurdoDoNao(palavra[x], palavra[grupo]) : absurdoDoPar(palavra[x], palavra[grupo]),
                ...tracos.map(([v, sim]) => sim ? absurdoDoPar(palavra[x], palavra[v]) : absurdoDoNao(palavra[x], palavra[v])),
                ...tem.flatMap(a => tem.map(b => seExcluem(a, b) ? IMPOSSIVEL : PLAUSIVEL))
            ];
        }));
    }
    const frases = [
        ...esq.regras.map(r => r.tipo === 'nenhum' ? absurdoDoNenhum(palavra[r.se], palavra[r.entao])
            : Math.max(absurdoDoPar(palavra[r.se], palavra[r.entao]), r.ou ? absurdoDoPar(palavra[r.se], palavra[r.ou]) : PLAUSIVEL)),
        ...esq.fatos.flatMap(f => f.sujeitos.map(x => (f.negativo ? absurdoDoNao : absurdoDoPar)(palavra[x], palavra[f.predicado])))
    ];
    if (esq.pergunta.tipo === 'sim-nao') frases.push(absurdoDoPar(palavra[esq.pergunta.sujeitos[0]], palavra[esq.pergunta.alvo]));
    return Math.max(...frases);
}

// --- ESCOLHA DAS PALAVRAS ---
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
// trocas nos dois sentidos: inventada -> real (para mostrar) e real -> inventada (para corrigir).
// Cada personagem pode ser ou ter qualquer coisa do desafio, então só entra o que cabe numa
// pessoa dentro do limite, e nada que tenha relação com o que já foi escolhido.
const PESSOA = { classe: 'nome' };
const trocasCalculadas = new WeakMap();
function trocasDoDesafio(d) {
    if (d.semTroca) return trocasDoDesafio(d.semTroca);
    if (trocasCalculadas.has(d)) return trocasCalculadas.get(d);
    const vocabulario = PALAVRAS_REAIS[d.idioma ?? 'pt'];
    const s = criarSorteio(hashDoTexto(`${d.idioma}|${d.numero}|${d.pergunta.texto}`));
    const embaralhados = new Map();
    const opcoes = (p) => {
        const lista = vocabulario[p.classe];
        const grupo = Array.isArray(lista) ? lista : (lista[p.genero] ?? lista.m);
        if (!embaralhados.has(grupo)) embaralhados.set(grupo, s.embaralhar(grupo.filter(r => absurdoDoPar(PESSOA, r) <= LIMITE_DE_ABSURDO)));
        return embaralhados.get(grupo);
    };
    const usadas = new Set();
    const cabe = (r) => !usadas.has(r) && ![...usadas].some(u => seRelacionam(u, r));
    const reais = {};
    const paraReal = new Map(), paraInventada = new Map();
    const reserva = (p) => vocabulario.reserva?.[p.genero] ?? [];
    for (const [letra, p] of Object.entries(d.palavras)) {
        const real = opcoes(p).find(cabe) ?? (p.classe === 'nome' ? reserva(p).find(cabe) : undefined) ?? opcoes(p)[0];
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

// --- REMONTAGEM ---
// As frases saem do esqueleto, pelas mesmas funções do gerador. Trocar palavra por palavra não
// serve: o "um" e o "Todo" viriam da palavra inventada ("A Júlia é um professor"). A regra usa o
// masculino genérico, e o substantivo concorda com a pessoa quando é dito dela. Com as próprias
// palavras inventadas, o resultado é o texto original do desafio.
function remontarFrases(d, palavra) {
    if (d.moldes) return textoNatural(d, palavra);
    const idioma = d.idioma ?? 'pt';
    const esq = esqueletoDe(d.nivel, d.variante);
    const F = FRASES_SIM_NAO[idioma];
    if (esq.inducao) {
        const descrever = ({ x, tracos }) => FRASES_INDUCAO[idioma](palavra[x], tracos.map(([v, sim]) => [palavra[v], sim]));
        const grupoDe = ({ x, grupo }) => concordar(palavra[grupo], palavra[x].genero);
        const exemplo = (l) => { const e = lerExemplo(l.esqueleto); return { ...l, texto: `${descrever(e)} ${F.fato(palavra[e.x], grupoDe(e), e.foraDoGrupo)}` }; };
        const teste = lerExemplo(d.pergunta.esqueleto);
        return { linhas: d.linhas.map(exemplo), pergunta: { ...d.pergunta, texto: `${descrever(teste)} ${F.pergunta(palavra[teste.x], grupoDe(teste))}` } };
    }
    const frase = (esqueleto) => {
        const r = esq.regras.find(x => x.texto === esqueleto);
        if (r) {
            const modelo = { se: palavra[r.se], entao: palavra[r.entao], ou: r.ou && palavra[r.ou] };
            return r.tipo === 'todo' ? fraseRegra(modelo, idioma) : F[r.tipo](modelo);
        }
        const f = esq.fatos.find(x => x.texto === esqueleto);
        const sujeitos = f.sujeitos.map(x => palavra[x]);
        const predicado = concordar(palavra[f.predicado], generoDe(sujeitos));
        return f.negativo ? F.fato(sujeitos[0], predicado, true) : fraseFato({ sujeitos, predicado }, idioma);
    };
    const sujeitos = esq.pergunta.sujeitos.map(x => palavra[x]);
    const pergunta = esq.pergunta.tipo === 'sim-nao' ? F.pergunta(sujeitos[0], concordar(palavra[esq.pergunta.alvo], sujeitos[0].genero))
        : frasePergunta(sujeitos, esq.pergunta.verbo, palavra[esq.resposta].classe, idioma);
    return { linhas: d.linhas.map(l => ({ ...l, texto: frase(l.esqueleto) })), pergunta: { ...d.pergunta, texto: pergunta } };
}

// Uma cópia do desafio com as palavras reais em tudo o que aparece na tela.
// Na troca de língua (nível 8), mostra o mesmo desafio sem a troca, na língua da resposta:
// as palavras reais servem para conferir a lógica, e ela é a mesma
function versaoComPalavrasReais(d) {
    if (d.semTroca) return versaoComPalavrasReais(d.semTroca);
    const { reais, paraReal } = trocasDoDesafio(d);
    const letras = Object.keys(d.palavras);
    return {
        ...d,
        ...remontarFrases(d, reais),
        absurdo: absurdoDoDesafio(d, reais),
        glossario: d.glossario && trocarPalavras(d.glossario, paraReal),
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
