// LOGIGEN - PALAVRAS INVENTADAS
// Gera palavras que não existem, mas têm cara de português:
// substantivos com gênero, adjetivos com sufixos de verdade (-oso, -ento...),
// verbos de 1ª, 2ª e 3ª conjugação e nomes próprios.

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

// Um léxico garante que nenhuma palavra se repete num lote de desafios.
// Cada palavra tem uma "chave" (o radical sem flexão) usada na correção;
// nenhuma chave pode conter outra, senão a correção ficaria ambígua.
function criarLexico(s) {
    const chaves = [];
    const livre = (chave) => !chaves.some(c => c.includes(chave) || chave.includes(c));
    const reservar = (gerar) => {
        for (let tentativa = 0; tentativa < 500; tentativa++) {
            const palavra = gerar();
            if (livre(palavra.chave)) {
                chaves.push(palavra.chave);
                return palavra;
            }
        }
        throw new Error('Não consegui gerar uma palavra inédita. Tente menos desafios por lote.');
    };

    return {
        substantivo: () => reservar(() => {
            const r = radical(s);
            const g = genero(s);
            const palavra = r + (g === 'm' ? 'o' : 'a');
            return { classe: 'substantivo', chave: r, genero: g, palavra, plural: palavra + 's' };
        }),
        // Adjetivo flexiona em gênero e número: m, f, mp (masc. plural), fp (fem. plural)
        adjetivo: () => reservar(() => {
            const r = radical(s);
            const suf = s.item(SUFIXOS_ADJETIVO);
            const m = r + suf.m, f = r + suf.f;
            return { classe: 'adjetivo', chave: r + suf.m.slice(0, -1), m, f, mp: m + 's', fp: f + 's' };
        }),
        // Aceita fixar a conjugação (ex.: PRIMEIRA) quando a pergunta exige isso
        verbo: (conjugacao) => reservar(() => {
            const c = conjugacao || s.item(CONJUGACOES);
            // "-nte" no presente parece adjetivo ("Todo cribato bilante"), então evita
            let r;
            do { r = radical(s); } while (c.presente === 'e' && r.endsWith('nt'));
            return {
                classe: 'verbo', chave: r,
                infinitivo: r + c.infinitivo, presente: r + c.presente, plural: r + c.plural, gerundio: r + c.gerundio
            };
        }),
        // Aceita fixar o gênero (ex.: para o personagem não ter o gênero da forma da regra)
        nome: (generoFixo) => reservar(() => {
            const g = generoFixo || genero(s);
            const inicio = inicioDePalavra(s);
            const base = inicio + s.item(VOGAIS) + meioDePalavra(s, inicio) + s.item(FINAIS_NOME[g]);
            return { classe: 'nome', chave: base, genero: g, palavra: base[0].toUpperCase() + base.slice(1) };
        })
    };
}
