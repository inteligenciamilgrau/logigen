// LOGIGEN - INTERFACE
// Gera o lote, monta o prompt e corrige a resposta colada da IA.
// Os textos da tela vêm de idiomas.js (t()); o idioma também decide a língua dos desafios.

let desafios = [];
let resultado = null;

// Uma cor por classe de palavra, usada no texto, no esqueleto e na legenda
const CORES = {
    nome: 'text-violet-300',
    substantivo: 'text-sky-400',
    adjetivo: 'text-amber-300',
    verbo: 'text-pink-400'
};

const $ = (id) => document.getElementById(id);

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function refreshIcons() { if (window.lucide) lucide.createIcons(); }

let toastTimer;
function toast(msg, tipo = 'ok') {
    const el = $('toast');
    el.textContent = msg;
    el.className = 'fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl border max-w-sm ' +
        (tipo === 'erro' ? 'bg-rose-950 border-rose-500/40 text-rose-200' : 'bg-slate-900 border-emerald-500/40 text-emerald-300');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// --- CORES ---
// Pinta cada palavra inventada do texto com a cor da sua classe (compara a palavra inteira)
function colorirTexto(texto, formas) {
    return texto.split(/([A-Za-zÀ-ÿ]+)/).map((parte, i) => {
        const classe = i % 2 ? formas[parte] : null;
        return classe ? `<span class="${CORES[classe]} font-semibold">${escapeHtml(parte)}</span>` : escapeHtml(parte);
    }).join('');
}

// Pinta as letras do esqueleto (X1, G2, A1, V1...) com a cor da classe, já na notação do idioma
function colorirLetras(texto) {
    return escapeHtml(esqueletoNoIdioma(texto)).replace(/\b[XGAV]\d+\b/g, v => `<span class="${CORES[tipoDaVariavel(v)]} font-bold">${v}</span>`);
}

async function copiar(texto) {
    try {
        await navigator.clipboard.writeText(texto);
    } catch (e) {
        // Fallback para navegadores que bloqueiam a API de clipboard em file://
        const ta = document.createElement('textarea');
        ta.value = texto;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
    }
}

// --- IDIOMA ---
// Troca os textos marcados no HTML (data-i18n, data-i18n-title, data-i18n-placeholder)
function traduzirPagina() {
    document.title = t('titulo_pagina');
    document.documentElement.lang = IDIOMA === 'pt' ? 'pt-br' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $('cores-legenda').innerHTML = Object.keys(CORES).map(c => `<span class="${CORES[c]}">● ${t('classe_' + c)}</span>`).join('');
}

function desenharBandeiras() {
    $('bandeiras').innerHTML = Object.entries(IDIOMAS).map(([id, info]) => {
        const ativo = id === IDIOMA;
        return `<button onclick="mudarIdioma('${id}')" title="${info.nome}" aria-label="${info.nome}" aria-pressed="${ativo}"
            class="rounded-md p-0.5 transition-all ${ativo ? 'ring-2 ring-purple-400' : 'opacity-50 hover:opacity-100'}">${info.bandeira}</button>`;
    }).join('');
}

// O dicionário de inglês (3,7 MB) só é carregado quando o inglês é escolhido
const ARQUIVOS_DE_DICIONARIO = { en: 'dicionario-en.js' };
function carregarDicionario(idioma) {
    if (!ARQUIVOS_DE_DICIONARIO[idioma] || window.DICIONARIOS?.[idioma]) return Promise.resolve();
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = ARQUIVOS_DE_DICIONARIO[idioma];
        script.onload = () => resolve();
        script.onerror = () => { toast(t('erro_dicionario'), 'erro'); resolve(); };
        document.head.appendChild(script);
    });
}

// Novo idioma: redesenha a tela e gera o lote de novo (mesma semente, outra língua)
async function mudarIdioma(idioma) {
    IDIOMA = Object.hasOwn(IDIOMAS, idioma) ? idioma : 'pt';
    traduzirPagina();
    desenharBandeiras();
    preencherNiveis();
    mostrarNivel();
    salvarEscolhas();
    if (pesquisaDesenhada) {
        pesquisaDesenhada = false;
        if (!$('aba-pesquisa').classList.contains('hidden')) mostrarAba('pesquisa');
    }
    // O jogo em andamento continua (os desafios ficam no idioma escolhido nele); só os textos mudam
    if (versusDesenhado) renderVersus();
    await carregarDicionario(IDIOMA);
    gerar();
}

// --- GERAR ---
function preencherNiveis() {
    const atual = $('nivel').value;
    $('nivel').innerHTML = Object.keys(NIVEIS).map(n => `<option value="${n}">${escapeHtml(t('nivel_opcao', { n, nome: nomeDoNivel(n) }))}</option>`).join('');
    if (atual) $('nivel').value = atual;
}

function mostrarNivel() {
    const nivel = $('nivel').value;
    const n = NIVEIS[nivel];
    $('nivel-descricao').textContent = `${descricaoDoNivel(nivel)} ${t('passos_ate', { n: n.passos })}` + (n.armadilhas ? ` ${t('armadilhas_n', { n: n.armadilhas })}` : '');
    // Mostra cada variante como está escrita em niveis.js, sem a indentação do código
    $('nivel-esqueleto').innerHTML = Object.entries(n.variantes).map(([nome, esqueleto]) => {
        const linhas = esqueleto.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
            const [codigo, ...comentario] = l.split('#');
            const resto = comentario.length ? `<span class="text-slate-600"># ${escapeHtml(comentarioNoIdioma(comentario.join('#')))}</span>` : '';
            return colorirLetras(codigo) + resto;
        });
        return `<span class="text-slate-500">— ${escapeHtml(nomeDaVariante(nome))}</span>\n${linhas.join('\n')}`;
    }).join('\n\n');
}

function novaSemente() {
    $('semente').value = Math.floor(Math.random() * 900000) + 100000;
    salvarEscolhas();
}

// --- ESCOLHAS SALVAS ---
// Nível, quantidade, semente, gabarito e idioma ficam no navegador para a próxima visita.
// Com a mesma semente, o lote gerado ao voltar é o mesmo de antes.
const ESCOLHAS_KEY = 'logigen_escolhas';

function salvarEscolhas() {
    try {
        localStorage.setItem(ESCOLHAS_KEY, JSON.stringify({
            nivel: $('nivel').value,
            quantidade: $('quantidade').value,
            semente: $('semente').value,
            gabarito: $('mostrar-gabarito').checked,
            reais: $('palavras-reais').checked,
            idioma: IDIOMA
        }));
    } catch (e) {}
}

// Devolve as escolhas salvas (ou null). Ignora valores que não servem mais
// (ex.: um nível que deixou de existir). Object.hasOwn e não NIVEIS[x]: senão
// "__proto__" ou "constructor" passariam como nível válido e travariam a página.
function carregarEscolhas() {
    let salvas = null;
    try { salvas = JSON.parse(localStorage.getItem(ESCOLHAS_KEY)); } catch (e) {}
    if (!salvas || typeof salvas !== 'object') return null;
    if (Object.hasOwn(NIVEIS, salvas.nivel)) $('nivel').value = salvas.nivel;
    if (parseInt(salvas.quantidade, 10) > 0) $('quantidade').value = salvas.quantidade;
    if (parseInt(salvas.semente, 10) > 0) $('semente').value = salvas.semente;
    if (typeof salvas.gabarito === 'boolean') $('mostrar-gabarito').checked = salvas.gabarito;
    if (typeof salvas.reais === 'boolean') $('palavras-reais').checked = salvas.reais;
    if (Object.hasOwn(IDIOMAS, salvas.idioma)) IDIOMA = salvas.idioma;
    return salvas;
}

function gerar() {
    const nivel = parseInt($('nivel').value, 10);
    const quantidade = Math.max(1, Math.min(50, parseInt($('quantidade').value, 10) || 10));
    if (!$('semente').value) novaSemente();
    const semente = parseInt($('semente').value, 10);
    $('quantidade').value = quantidade;
    salvarEscolhas();

    try {
        desafios = gerarLote(nivel, quantidade, semente, IDIOMA);
    } catch (e) {
        toast(e.message.startsWith('Não consegui gerar') ? t('erro_palavra') : e.message, 'erro');
        return;
    }
    resultado = null;
    $('resposta-ia').value = '';
    $('placar').classList.add('hidden');
    $('lote-info').textContent = t('lote_info', { nivel, qtd: quantidade, semente });
    renderDesafios();
}

// Com "Palavras reais" ligado, a tela mostra o mesmo desafio com palavras de verdade
// (palavras-reais.js); o prompt copiado continua com as inventadas
function renderDesafios() {
    const porNumero = new Map((resultado || []).map(r => [r.numero, r]));
    const reais = $('palavras-reais').checked;
    const aviso = reais ? `<div class="text-[11px] text-amber-200/90 leading-relaxed bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">${t('reais_aviso')}</div>` : '';
    $('desafios').innerHTML = aviso + desafios.map(original => {
        const d = reais ? versaoComPalavrasReais(original) : original;
        const r = porNumero.get(d.numero);
        // A resposta da IA veio com as palavras inventadas: na tela, troca pelas reais também
        const dada = r && r.dada !== null && reais ? trocarPalavras(r.dada, trocasDoDesafio(original).paraReal) : r?.dada;
        const borda = r ? `border-${SELOS[r.status]}-500/50` : 'border-slate-800';
        return `
        <article class="bg-slate-900 rounded-2xl border ${borda} p-6 shadow-xl animate-fade-in">
            <div class="flex flex-wrap items-center gap-2 mb-4">
                <span class="bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-blue-500/30">${t('desafio_n', { n: d.numero })}</span>
                <span class="gabarito text-[9px] font-black uppercase tracking-widest text-slate-500">${escapeHtml(nomeDaVariante(d.variante))}</span>
                ${r ? selo(r.status) : ''}
                <button onclick="copiarDesafio(${d.numero}, this)" class="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-blue-300 bg-slate-950 hover:bg-blue-500/10 border border-slate-800 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all" title="${escapeHtml(t('copiar_um'))}">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i> <span>${t('copiar')}</span>
                </button>
            </div>
            <div class="space-y-1.5 bg-slate-950 p-4 border border-slate-800/50 rounded-xl mb-4 text-slate-300 leading-relaxed">
                ${d.linhas.map(l => linhaComEsqueleto(d, l.texto, l.esqueleto, '', l.armadilha)).join('')}
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-1">${linhaComEsqueleto(d, d.pergunta.texto, d.pergunta.esqueleto, 'font-bold text-white')}</div>
            <div class="gabarito mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div><span class="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-2">${t('prova')}</span>${provaHtml(d)}</div>
                ${d.armadilhas.map(a => `<div><span class="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 mr-2">${t('armadilha')}</span><span class="text-slate-400">${colorirLetras(a.regra)} <span class="text-slate-600">${t('lida_ao_contrario')}</span> <span class="text-white">⇒</span> ${colorirLetras(a.conclusao)}</span> <span class="text-fuchsia-300">(${a.palavras.map(escapeHtml).join(', ')})</span></div>`).join('')}
                <div class="text-slate-500">${d.legenda.map(l => `<span class="${CORES[l.classe]}"><b>${l.letra}</b> = ${escapeHtml(l.palavra)}</span>`).join(' · ')}</div>
            </div>
            <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span class="gabarito"><span class="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mr-2">${t('gabarito')}</span><span class="font-mono font-black text-emerald-400">${escapeHtml(d.resposta)}</span> <span class="text-[10px] text-slate-500">· ${escapeHtml(d.flexao)}</span></span>
                ${r ? `<span><span class="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2">${t('ia')}</span><span class="font-mono ${COR_DO_STATUS[r.status]}">${r.dada === null ? t('nao_respondeu') : escapeHtml(dada)}</span></span>` : ''}
            </div>
        </article>`;
    }).join('');
    refreshIcons();
}

// Frase do desafio (palavras coloridas) com a linha do esqueleto ao lado.
// O esqueleto some junto com o gabarito; a regra-armadilha ganha um ⚠.
function linhaComEsqueleto(d, texto, esqueleto, classes = '', armadilha = false) {
    const marca = armadilha ? `<span class="text-fuchsia-400 font-bold" title="${escapeHtml(t('armadilha_title'))}">⚠ </span>` : '';
    return `<div class="flex flex-wrap items-baseline justify-between gap-x-4">
        <span class="${classes}">${colorirTexto(texto, d.formas)}</span>
        <span class="gabarito font-mono text-[10px] text-slate-500">${marca}${colorirLetras(esqueleto)}</span>
    </div>`;
}

// "X1 é G1 → todo G1 é A1 ⇒ X1 é A1 (1 passo)"
function provaHtml(d) {
    const premissas = d.prova.slice(0, -1).map(colorirLetras).join(' <span class="text-slate-600">→</span> ');
    return `<span class="text-slate-400">${premissas} <span class="text-white">⇒</span> ${colorirLetras(d.prova[d.prova.length - 1])}</span>` +
        ` <span class="text-slate-600">(${d.passos} ${d.passos === 1 ? t('passo') : t('passos')})</span>`;
}

const COR_DO_STATUS = { certo: 'text-emerald-300', ambigua: 'text-orange-300', flexao: 'text-amber-300', armadilha: 'text-fuchsia-300', errado: 'text-rose-300', 'sem-resposta': 'text-slate-500' };
// Cor do selo de cada status; o texto vem de idiomas.js (selo_certo, selo_ambigua...)
const SELOS = { certo: 'emerald', ambigua: 'orange', flexao: 'amber', armadilha: 'fuchsia', errado: 'rose', 'sem-resposta': 'slate' };

function selo(status) {
    const cor = SELOS[status];
    return `<span class="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-${cor}-500/20 text-${cor}-300 border border-${cor}-500/30">${t('selo_' + status)}</span>`;
}

function alternarGabarito() {
    $('desafios').classList.toggle('sem-gabarito', !$('mostrar-gabarito').checked);
}

function alternarPalavrasReais() {
    salvarEscolhas();
    renderDesafios();
}

// --- TESTAR ---
// Troca o rótulo do botão por "Copiado!" por um instante
function confirmarCopia(btn) {
    const label = btn.querySelector('span');
    const original = label.textContent;
    label.textContent = t('copiado');
    setTimeout(() => { label.textContent = original; }, 1500);
}

async function copiarPrompt(btn) {
    if (!desafios.length) return;
    await copiar(montarPrompt(desafios));
    confirmarCopia(btn);
}

async function copiarDesafio(numero, btn) {
    await copiar(montarPromptUnico(desafios[numero - 1]));
    confirmarCopia(btn);
}

function corrigirRespostas() {
    const texto = $('resposta-ia').value;
    if (!texto.trim()) { toast(t('cole_primeiro'), 'erro'); return; }

    resultado = corrigir(desafios, texto);
    const conta = (status) => resultado.filter(r => r.status === status).length;
    const { total, logica, morfologia } = placarDosEixos(resultado);
    const certos = conta('certo');
    const pct = Math.round((certos / total) * 100);
    const cor = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose';
    const porcento = (n, de) => de ? `${Math.round((n / de) * 100)}%` : '—';
    const detalhes = [
        [conta('ambigua'), 'text-orange-300', 'det_ambigua'],
        [conta('flexao'), 'text-amber-300', 'det_flexao'],
        [conta('armadilha'), 'text-fuchsia-300', 'det_armadilha'],
        [conta('errado'), 'text-rose-300', 'det_errado'],
        [conta('sem-resposta'), 'text-slate-400', 'det_sem-resposta']
    ].filter(([n]) => n > 0);

    $('placar').className = `mt-5 p-4 rounded-xl border text-center bg-${cor}-950/30 border-${cor}-500/30`;
    $('placar').innerHTML = `
        <div class="text-3xl font-black text-${cor}-300 tabular-nums">${certos}/${total}</div>
        <div class="text-[10px] font-black uppercase tracking-widest text-${cor}-400/80 mt-1">${t('totalmente_certos', { pct })}</div>
        <div class="grid grid-cols-2 gap-2 mt-3 text-left">
            <div class="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">${t('logica')}</div>
                <div class="text-lg font-black text-white tabular-nums">${porcento(logica, total)}</div>
                <div class="text-[9px] text-slate-500">${logica}/${total} ${t('palavra_certa')}</div>
            </div>
            <div class="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">${t('morfologia')}</div>
                <div class="text-lg font-black text-white tabular-nums">${porcento(morfologia, logica)}</div>
                <div class="text-[9px] text-slate-500">${morfologia}/${logica} ${t('forma_certa')}</div>
            </div>
        </div>
        ${detalhes.map(([n, classe, chave]) => `<div class="text-[10px] ${classe} mt-1">${n} ${t(chave)}</div>`).join('')}`;
    renderDesafios();
}

// --- ABAS ---
// A aba aberta fica no endereço (#pesquisa, #versus), para dar para compartilhar o link
// e para o botão "voltar" do navegador funcionar
const ABAS = ['gerador', 'versus', 'pesquisa'];
let pesquisaDesenhada = false;
let versusDesenhado = false;

function mostrarAba(nome) {
    if (!ABAS.includes(nome)) nome = 'gerador';
    ABAS.forEach(aba => $('aba-' + aba).classList.toggle('hidden', aba !== nome));
    document.querySelectorAll('.aba').forEach(b => {
        const ativa = b.dataset.aba === nome;
        b.classList.toggle('bg-gradient-to-r', ativa);
        b.classList.toggle('from-blue-600', ativa);
        b.classList.toggle('to-purple-600', ativa);
        b.classList.toggle('text-white', ativa);
        b.classList.toggle('text-slate-400', !ativa);
        b.classList.toggle('hover:text-white', !ativa);
    });
    if (nome === 'pesquisa' && !pesquisaDesenhada) {
        renderPesquisa();
        pesquisaDesenhada = true;
    }
    if (nome === 'versus' && !versusDesenhado) {
        renderVersus();
        versusDesenhado = true;
    }
    if (location.hash.slice(1) !== nome) location.hash = nome;
}

// --- BOOT ---
// Idioma: o do endereço (?lang=en), senão o salvo, senão o do navegador
async function init() {
    preencherNiveis();
    const salvas = carregarEscolhas();
    if (!salvas) novaSemente();
    const daUrl = new URLSearchParams(location.search).get('lang');
    if (Object.hasOwn(IDIOMAS, daUrl ?? '')) IDIOMA = daUrl;
    else if (!salvas?.idioma) IDIOMA = (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
    traduzirPagina();
    desenharBandeiras();
    preencherNiveis();
    // Salva assim que a pessoa mexe, mesmo sem clicar em "Gerar"
    ['nivel', 'quantidade', 'semente', 'mostrar-gabarito', 'palavras-reais'].forEach(id => $(id).addEventListener('change', salvarEscolhas));
    ['quantidade', 'semente'].forEach(id => $(id).addEventListener('input', salvarEscolhas));
    mostrarNivel();
    alternarGabarito();
    mostrarAba(location.hash.slice(1));
    window.addEventListener('hashchange', () => mostrarAba(location.hash.slice(1)));
    refreshIcons();
    await carregarDicionario(IDIOMA);
    gerar();
}

init();
