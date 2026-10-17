// LOGIGEN - INTERFACE
// Gera o lote, monta o prompt e corrige a resposta colada da IA.

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

// Pinta as letras do esqueleto (X1, G2, A1, V1...) com a cor da classe
function colorirLetras(texto) {
    return escapeHtml(texto).replace(/\b[XGAV]\d+\b/g, v => `<span class="${CORES[tipoDaVariavel(v)]} font-bold">${v}</span>`);
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

// --- GERAR ---
function mostrarNivel() {
    const n = NIVEIS[$('nivel').value];
    $('nivel-descricao').textContent = `${n.descricao} Passos até a resposta: ${n.passos}.` + (n.armadilhas ? ` Armadilhas: ${n.armadilhas}.` : '');
    // Mostra cada variante como está escrita em niveis.js, sem a indentação do código
    $('nivel-esqueleto').innerHTML = Object.entries(n.variantes).map(([nome, esqueleto]) => {
        const linhas = esqueleto.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
            const [codigo, ...comentario] = l.split('#');
            const resto = comentario.length ? `<span class="text-slate-600">#${escapeHtml(comentario.join('#'))}</span>` : '';
            return colorirLetras(codigo) + resto;
        });
        return `<span class="text-slate-500">— ${escapeHtml(nome)}</span>\n${linhas.join('\n')}`;
    }).join('\n\n');
}

function novaSemente() {
    $('semente').value = Math.floor(Math.random() * 900000) + 100000;
    salvarEscolhas();
}

// --- ESCOLHAS SALVAS ---
// Nível, quantidade, semente e gabarito ficam no navegador para a próxima visita.
// Com a mesma semente, o lote gerado ao voltar é o mesmo de antes.
const ESCOLHAS_KEY = 'logigen_escolhas';

function salvarEscolhas() {
    try {
        localStorage.setItem(ESCOLHAS_KEY, JSON.stringify({
            nivel: $('nivel').value,
            quantidade: $('quantidade').value,
            semente: $('semente').value,
            gabarito: $('mostrar-gabarito').checked
        }));
    } catch (e) {}
}

// Devolve true se havia escolhas salvas. Ignora valores que não servem mais
// (ex.: um nível que deixou de existir). Object.hasOwn e não NIVEIS[x]: senão
// "__proto__" ou "constructor" passariam como nível válido e travariam a página.
function carregarEscolhas() {
    let salvas = null;
    try { salvas = JSON.parse(localStorage.getItem(ESCOLHAS_KEY)); } catch (e) {}
    if (!salvas || typeof salvas !== 'object') return false;
    if (Object.hasOwn(NIVEIS, salvas.nivel)) $('nivel').value = salvas.nivel;
    if (parseInt(salvas.quantidade, 10) > 0) $('quantidade').value = salvas.quantidade;
    if (parseInt(salvas.semente, 10) > 0) $('semente').value = salvas.semente;
    if (typeof salvas.gabarito === 'boolean') $('mostrar-gabarito').checked = salvas.gabarito;
    return true;
}

function gerar() {
    const nivel = parseInt($('nivel').value, 10);
    const quantidade = Math.max(1, Math.min(50, parseInt($('quantidade').value, 10) || 10));
    if (!$('semente').value) novaSemente();
    const semente = parseInt($('semente').value, 10);
    $('quantidade').value = quantidade;
    salvarEscolhas();

    try {
        desafios = gerarLote(nivel, quantidade, semente);
    } catch (e) {
        toast(e.message, 'erro');
        return;
    }
    resultado = null;
    $('resposta-ia').value = '';
    $('placar').classList.add('hidden');
    $('lote-info').textContent = `nível ${nivel} · ${quantidade} desafios · semente ${semente}`;
    renderDesafios();
}

function renderDesafios() {
    const porNumero = new Map((resultado || []).map(r => [r.numero, r]));
    $('desafios').innerHTML = desafios.map(d => {
        const r = porNumero.get(d.numero);
        const borda = r ? `border-${SELOS[r.status][0]}-500/50` : 'border-slate-800';
        return `
        <article class="bg-slate-900 rounded-2xl border ${borda} p-6 shadow-xl animate-fade-in">
            <div class="flex flex-wrap items-center gap-2 mb-4">
                <span class="bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-blue-500/30">Desafio ${d.numero}</span>
                <span class="gabarito text-[9px] font-black uppercase tracking-widest text-slate-500">${escapeHtml(d.variante)}</span>
                ${r ? selo(r.status) : ''}
                <button onclick="copiarDesafio(${d.numero}, this)" class="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-blue-300 bg-slate-950 hover:bg-blue-500/10 border border-slate-800 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all" title="Copiar só este desafio para mandar manualmente">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i> <span>Copiar</span>
                </button>
            </div>
            <div class="space-y-1.5 bg-slate-950 p-4 border border-slate-800/50 rounded-xl mb-4 text-slate-300 leading-relaxed">
                ${d.linhas.map(l => linhaComEsqueleto(d, l.texto, l.esqueleto, '', l.armadilha)).join('')}
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-1">${linhaComEsqueleto(d, d.pergunta.texto, d.pergunta.esqueleto, 'font-bold text-white')}</div>
            <div class="gabarito mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div><span class="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-2">Prova</span>${provaHtml(d)}</div>
                ${d.armadilhas.map(a => `<div><span class="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 mr-2">⚠ Armadilha</span><span class="text-slate-400">${colorirLetras(a.regra)} <span class="text-slate-600">lida ao contrário</span> <span class="text-white">⇒</span> ${colorirLetras(a.conclusao)}</span> <span class="text-fuchsia-300">(${a.palavras.map(escapeHtml).join(', ')})</span></div>`).join('')}
                <div class="text-slate-500">${d.legenda.map(l => `<span class="${CORES[l.classe]}"><b>${l.letra}</b> = ${escapeHtml(l.palavra)}</span>`).join(' · ')}</div>
            </div>
            <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span class="gabarito"><span class="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mr-2">Gabarito</span><span class="font-mono font-black text-emerald-400">${escapeHtml(d.resposta)}</span> <span class="text-[10px] text-slate-500">· ${escapeHtml(d.flexao)}</span></span>
                ${r ? `<span><span class="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2">IA</span><span class="font-mono ${COR_DO_STATUS[r.status]}">${r.dada === null ? '(não respondeu)' : escapeHtml(r.dada)}</span></span>` : ''}
            </div>
        </article>`;
    }).join('');
    refreshIcons();
}

// Frase do desafio (palavras coloridas) com a linha do esqueleto ao lado.
// O esqueleto some junto com o gabarito; a regra-armadilha ganha um ⚠.
function linhaComEsqueleto(d, texto, esqueleto, classes = '', armadilha = false) {
    const marca = armadilha ? '<span class="text-fuchsia-400 font-bold" title="Armadilha da recíproca">⚠ </span>' : '';
    return `<div class="flex flex-wrap items-baseline justify-between gap-x-4">
        <span class="${classes}">${colorirTexto(texto, d.formas)}</span>
        <span class="gabarito font-mono text-[10px] text-slate-500">${marca}${colorirLetras(esqueleto)}</span>
    </div>`;
}

// "X1 é G1 → todo G1 é A1 ⇒ X1 é A1 (1 passo)"
function provaHtml(d) {
    const premissas = d.prova.slice(0, -1).map(colorirLetras).join(' <span class="text-slate-600">→</span> ');
    return `<span class="text-slate-400">${premissas} <span class="text-white">⇒</span> ${colorirLetras(d.prova[d.prova.length - 1])}</span>` +
        ` <span class="text-slate-600">(${d.passos} ${d.passos === 1 ? 'passo' : 'passos'})</span>`;
}

const COR_DO_STATUS = { certo: 'text-emerald-300', ambigua: 'text-orange-300', flexao: 'text-amber-300', armadilha: 'text-fuchsia-300', errado: 'text-rose-300', 'sem-resposta': 'text-slate-500' };
const SELOS = {
    certo: ['emerald', '✔ Acertou'],
    ambigua: ['orange', '≈ Flexão ambígua'],
    flexao: ['amber', '⚠ Flexão errada'],
    armadilha: ['fuchsia', '🪤 Caiu na armadilha'],
    errado: ['rose', '✘ Errou'],
    'sem-resposta': ['slate', 'Sem resposta']
};

function selo(status) {
    const [cor, texto] = SELOS[status];
    return `<span class="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-${cor}-500/20 text-${cor}-300 border border-${cor}-500/30">${texto}</span>`;
}

function alternarGabarito() {
    $('desafios').classList.toggle('sem-gabarito', !$('mostrar-gabarito').checked);
}

// --- TESTAR ---
// Troca o rótulo do botão por "Copiado!" por um instante
function confirmarCopia(btn) {
    const label = btn.querySelector('span');
    const original = label.textContent;
    label.textContent = 'Copiado!';
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
    if (!texto.trim()) { toast('Cole a resposta da IA primeiro.', 'erro'); return; }

    resultado = corrigir(desafios, texto);
    const conta = (status) => resultado.filter(r => r.status === status).length;
    const { total, logica, morfologia } = placarDosEixos(resultado);
    const certos = conta('certo');
    const pct = Math.round((certos / total) * 100);
    const cor = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose';
    const porcento = (n, de) => de ? `${Math.round((n / de) * 100)}%` : '—';
    const detalhes = [
        [conta('ambigua'), 'text-orange-300', 'flexão ambígua (deu mais de uma forma)'],
        [conta('flexao'), 'text-amber-300', 'flexão errada (lógica certa)'],
        [conta('armadilha'), 'text-fuchsia-300', 'caíram na armadilha da recíproca'],
        [conta('errado'), 'text-rose-300', 'errados'],
        [conta('sem-resposta'), 'text-slate-400', 'sem resposta reconhecida (use "1: resposta")']
    ].filter(([n]) => n > 0);

    $('placar').className = `mt-5 p-4 rounded-xl border text-center bg-${cor}-950/30 border-${cor}-500/30`;
    $('placar').innerHTML = `
        <div class="text-3xl font-black text-${cor}-300 tabular-nums">${certos}/${total}</div>
        <div class="text-[10px] font-black uppercase tracking-widest text-${cor}-400/80 mt-1">${pct}% totalmente certos</div>
        <div class="grid grid-cols-2 gap-2 mt-3 text-left">
            <div class="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">Lógica</div>
                <div class="text-lg font-black text-white tabular-nums">${porcento(logica, total)}</div>
                <div class="text-[9px] text-slate-500">${logica}/${total} palavra certa</div>
            </div>
            <div class="bg-slate-950/60 rounded-lg p-2 border border-slate-800">
                <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">Morfologia</div>
                <div class="text-lg font-black text-white tabular-nums">${porcento(morfologia, logica)}</div>
                <div class="text-[9px] text-slate-500">${morfologia}/${logica} forma certa</div>
            </div>
        </div>
        ${detalhes.map(([n, classe, rotulo]) => `<div class="text-[10px] ${classe} mt-1">${n} ${rotulo}</div>`).join('')}`;
    renderDesafios();
}

// --- BOOT ---
function init() {
    $('nivel').innerHTML = Object.entries(NIVEIS).map(([n, info]) => `<option value="${n}">Nível ${n} — ${escapeHtml(info.nome)}</option>`).join('');
    $('cores-legenda').innerHTML = ['nome', 'substantivo', 'adjetivo', 'verbo']
        .map(c => `<span class="${CORES[c]}">● ${c}</span>`).join('');
    if (!carregarEscolhas()) novaSemente();
    // Salva assim que a pessoa mexe, mesmo sem clicar em "Gerar"
    ['nivel', 'quantidade', 'semente', 'mostrar-gabarito'].forEach(id => $(id).addEventListener('change', salvarEscolhas));
    ['quantidade', 'semente'].forEach(id => $(id).addEventListener('input', salvarEscolhas));
    mostrarNivel();
    alternarGabarito();
    gerar();
    refreshIcons();
}

init();
