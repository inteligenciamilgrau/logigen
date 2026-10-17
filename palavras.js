// LOGIGEN - PALAVRAS INVENTADAS
// Gera palavras que não existem, mas têm cara de português ou de inglês:
// substantivos, adjetivos com sufixos de verdade (-oso, -ento / -ish, -ous...),
// verbos e nomes próprios. Em português, com gênero e as três conjugações.

// Sorteio com semente (mulberry32): a mesma semente sempre gera os mesmos desafios
function criarSorteio(semente) {
    let s = semente >>> 0;
    const numero = () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const item = (lista) => lista[Math.floor(numero() * lista.length)];
    const embaralhar = (lista) => {
        const a = [...lista];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(numero() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };
    return { numero, item, embaralhar, chance: (p) => numero() < p };
}

// Sons de início de palavra. Os "raros" saem mais vezes para fugir de palavras reais.
const INICIO_RARO = ['z', 'v', 'j', 'x', 'gl', 'fl', 'vr', 'dr', 'tr', 'pl', 'br', 'cl', 'fr', 'gr'];
const INICIO_COMUM = ['b', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'ch', 'bl', 'cr', 'pr'];
const MEIO = ['b', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'ch', 'lh', 'nh', 'br', 'dr', 'gr', 'tr', 'pl', 'fl', 'gl', 'vr'];
const FIM = ['b', 'd', 'f', 'l', 'm', 'n', 'p', 't', 'v', 'z', 'ch', 'lh', 'nh', 'br', 'dr', 'tr', 'fl', 'nd', 'nt', 'mb', 'mp', 'rn', 'rt', 'rd', 'rb', 'lt', 'lv', 'sc', 'st', 'sp'];
const VOGAIS = ['a', 'a', 'e', 'e', 'i', 'o', 'o', 'u'];

const SUFIXOS_ADJETIVO = [
    { m: 'oso', f: 'osa' },
    { m: 'ento', f: 'enta' },
    { m: 'udo', f: 'uda' },
    { m: 'ino', f: 'ina' }
];
// Terminações de cada conjugação: infinitivo, presente (ele / eles) e gerúndio.
// Mais verbos em -ar, como no português de verdade.
const PRIMEIRA = { infinitivo: 'ar', presente: 'a', plural: 'am', gerundio: 'ando' };
const SEGUNDA = { infinitivo: 'er', presente: 'e', plural: 'em', gerundio: 'endo' };
const TERCEIRA = { infinitivo: 'ir', presente: 'e', plural: 'em', gerundio: 'indo' };
const CONJUGACOES = [PRIMEIRA, PRIMEIRA, PRIMEIRA, SEGUNDA, TERCEIRA];
// Sem terminar em -o/-a: nomes curtos assim esbarram em palavras reais ("Clona")
const FINAIS_NOME = { m: ['el', 'ar', 'im', 'ol', 'ur', 'eu'], f: ['ela', 'ina', 'ane', 'ice', 'ira', 'eia'] };

function inicioDePalavra(s) {
    return s.chance(0.7) ? s.item(INICIO_RARO) : s.item(INICIO_COMUM);
}

// Som do meio diferente do início, para não gaguejar ("vravrurba")
function meioDePalavra(s, inicio) {
    let meio;
    do { meio = s.item(MEIO); } while (meio === inicio);
    return meio;
}

// Radical de três sílabas incompletas: "za" + "bo" + "nd" -> "zabond"
function radical(s) {
    const inicio = inicioDePalavra(s);
    const meio = meioDePalavra(s, inicio);
    let fim;
    do { fim = s.item(FIM); } while (fim === meio || fim === inicio);
    return inicio + s.item(VOGAIS) + meio + s.item(VOGAIS) + fim;
}

function genero(s) { return s.chance(0.5) ? 'm' : 'f'; }

// Todas as formas de uma palavra que podem aparecer escritas no desafio
function formasEscritas(p) {
    if (p.classe === 'substantivo') return [p.palavra, p.plural];
    if (p.classe === 'adjetivo') return [p.m, p.f, p.mp, p.fp];
    if (p.classe === 'verbo') return [p.infinitivo, p.presente, p.plural, p.gerundio];
    return [p.palavra];
}

// --- PALAVRAS REAIS POR PERTO ---
// Uma forma a 1 letra (ou menos) de uma palavra real do idioma: tirando, pondo ou trocando
// uma letra, vira palavra de verdade. A IA poderia ler "grofesca" como "grotesca" ou o nome
// "Bramar" como o verbo "bramar". Os dicionários (dicionario.js, dicionario-en.js) se
// registram em DICIONARIOS; sem o dicionário do idioma, não filtra.
const ALFABETO = 'abcdefghijklmnopqrstuvwxyz';
function pertoDePalavraReal(forma, idioma = 'pt') {
    const dicionario = window.DICIONARIOS?.[idioma];
    if (!dicionario) return false;
    const w = forma.toLowerCase();
    if (dicionario.has(w)) return true;
    for (let i = 0; i <= w.length; i++) {
        const antes = w.slice(0, i), depois = w.slice(i), resto = depois.slice(1);
        if (i < w.length && dicionario.has(antes + resto)) return true;
        for (const c of ALFABETO) {
            if (dicionario.has(antes + c + depois)) return true;
            if (i < w.length && c !== w[i] && dicionario.has(antes + c + resto)) return true;
        }
    }
    return false;
}

// --- PORTUGUÊS ---
function construtoresPortugues(s) {
    return {
        substantivo: () => {
            const r = radical(s);
            const g = genero(s);
            const palavra = r + (g === 'm' ? 'o' : 'a');
            return { classe: 'substantivo', chave: r, genero: g, palavra, plural: palavra + 's' };
        },
        // Adjetivo flexiona em gênero e número: m, f, mp (masc. plural), fp (fem. plural)
        adjetivo: () => {
            const r = radical(s);
            const suf = s.item(SUFIXOS_ADJETIVO);
            const m = r + suf.m, f = r + suf.f;
            return { classe: 'adjetivo', chave: r + suf.m.slice(0, -1), m, f, mp: m + 's', fp: f + 's' };
        },
        // Aceita fixar a conjugação (ex.: PRIMEIRA) quando a pergunta exige isso
        verbo: (conjugacao) => {
            const c = conjugacao || s.item(CONJUGACOES);
            // "-nte" no presente parece adjetivo ("Todo cribato bilante"), então evita
            let r;
            do { r = radical(s); } while (c.presente === 'e' && r.endsWith('nt'));
            return {
                classe: 'verbo', chave: r,
                infinitivo: r + c.infinitivo, presente: r + c.presente, plural: r + c.plural, gerundio: r + c.gerundio
            };
        },
        // Aceita fixar o gênero (ex.: para o personagem não ter o gênero da forma da regra)
        nome: (generoFixo) => {
            const g = generoFixo || genero(s);
            const inicio = inicioDePalavra(s);
            const base = inicio + s.item(VOGAIS) + meioDePalavra(s, inicio) + s.item(FINAIS_NOME[g]);
            return { classe: 'nome', chave: base, genero: g, palavra: base[0].toUpperCase() + base.slice(1) };
        }
    };
}

// --- INGLÊS ---
// O inglês quase não flexiona: o adjetivo não tem gênero nem plural, e o verbo tem
// "florp" (eles), "florps" (ele) e "florping" (gerúndio). O radical termina sempre em duas
// consoantes ("florp", "snurk"): assim o gerúndio é só "+ing", sem dúvida sobre dobrar a
// consoante ("blop" -> "blopping") ou tirar o "e" ("glame" -> "glaming"), e o plural do
// substantivo é só "+s".
const EN_INICIO = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sl', 'sn', 'sp', 'st', 'sk', 'sw', 'tr', 'tw',
    'b', 'd', 'f', 'g', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];
const EN_VOGAIS = ['a', 'a', 'a', 'e', 'e', 'e', 'i', 'i', 'o', 'o', 'o', 'u', 'u', 'oo', 'ee'];
const EN_MEIO = ['b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'nd', 'mb', 'rk', 'st', 'sk', 'ld', 'lt', 'rn', 'nk'];
const EN_FIM = ['mp', 'nd', 'nk', 'rp', 'rk', 'rt', 'rn', 'rm', 'rb', 'rd', 'lk', 'lp', 'lt', 'ld', 'lm', 'sk', 'sp', 'st', 'ft', 'ck', 'ng', 'rf', 'lf', 'nt'];
const EN_SUFIXOS_ADJETIVO = ['ish', 'ous', 'ful', 'y', 'ic', 'al', 'less', 'ive', 'some'];
const EN_FINAIS_NOME = ['in', 'an', 'on', 'el', 'or', 'ia', 'a', 'en', 'ik', 'us', 'is', 'et'];

function radicalIngles(s) {
    return s.item(EN_INICIO) + s.item(EN_VOGAIS) + (s.chance(0.5) ? s.item(EN_MEIO) + s.item(EN_VOGAIS) : '') + s.item(EN_FIM);
}

// Mesmos campos das palavras em português, para o resto do código não precisar saber o idioma:
// o adjetivo repete a mesma forma em m/f/mp/fp, e o verbo usa o radical como infinitivo e plural
function construtoresIngles(s) {
    return {
        substantivo: () => {
            const r = radicalIngles(s);
            return { classe: 'substantivo', chave: r, genero: 'm', palavra: r, plural: r + 's' };
        },
        adjetivo: () => {
            const w = s.item(EN_INICIO) + s.item(EN_VOGAIS) + s.item(EN_MEIO) + s.item(EN_SUFIXOS_ADJETIVO);
            return { classe: 'adjetivo', chave: w, m: w, f: w, mp: w, fp: w };
        },
        verbo: () => {
            const r = radicalIngles(s);
            return { classe: 'verbo', chave: r, infinitivo: r, presente: r + 's', plural: r, gerundio: r + 'ing' };
        },
        nome: () => {
            const base = s.item(EN_INICIO) + s.item(EN_VOGAIS) + s.item(EN_MEIO) + s.item(EN_FINAIS_NOME);
            return { classe: 'nome', chave: base, genero: genero(s), palavra: base[0].toUpperCase() + base.slice(1) };
        }
    };
}

// --- LÉXICO ---
// Um léxico garante que nenhuma palavra se repete num lote de desafios.
// Cada palavra tem uma "chave" (o radical sem flexão) usada na correção;
// nenhuma chave pode conter outra, senão a correção ficaria ambígua.
// Nenhuma forma escrita pode ficar perto de uma palavra real do idioma (pertoDePalavraReal).
function criarLexico(s, idioma = 'pt') {
    const chaves = [];
    const livre = (chave) => !chaves.some(c => c.includes(chave) || chave.includes(c));
    const reservar = (gerar) => {
        for (let tentativa = 0; tentativa < 500; tentativa++) {
            const palavra = gerar();
            if (livre(palavra.chave) && !formasEscritas(palavra).some(f => pertoDePalavraReal(f, idioma))) {
                chaves.push(palavra.chave);
                return palavra;
            }
        }
        throw new Error('Não consegui gerar uma palavra inédita. Tente menos desafios por lote.');
    };
    const construtores = idioma === 'en' ? construtoresIngles(s) : construtoresPortugues(s);
    return Object.fromEntries(Object.entries(construtores).map(([classe, gerar]) => [classe, (...args) => reservar(() => gerar(...args))]));
}
