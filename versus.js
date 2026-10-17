// LOGIGEN - HUMANO × IA
// Uma pessoa resolve os desafios na própria língua; a IA recebe exatamente a mesma lógica no
// idioma dela (gerarLotePareado: mesma variante e mesma ordem das regras, palavras de cada
// idioma). As duas respostas passam pelo mesmo corretor, e o placar mostra quem ganhou.
// Gabaritos e respostas da IA só aparecem depois que a pessoa termina: nada de spoiler.

const VERSUS = {
    fase: 'config',              // config · jogando · terminado
    nivel: '1', quantidade: 5, semente: null,
    idiomaHumano: null, idiomaIA: null,
    loteHumano: [], loteIA: [],
    respostas: [], textoIA: '',
    inicio: 0, fim: 0,
    resultadoHumano: null, resultadoIA: null
};
let versusRelogio = null;

function versusPadroes() {
    VERSUS.idiomaHumano ??= IDIOMA;
    VERSUS.idiomaIA ??= IDIOMA === 'pt' ? 'en' : 'pt';
    VERSUS.semente ??= Math.floor(Math.random() * 900000) + 100000;
}

const versusTempo = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// --- AÇÕES ---
function versusLerOpcoes() {
    if (VERSUS.fase !== 'config') return;
    if (Object.hasOwn(NIVEIS, $('versus-nivel').value)) VERSUS.nivel = $('versus-nivel').value;
    VERSUS.quantidade = Math.max(1, Math.min(20, parseInt($('versus-quantidade').value, 10) || 5));
    VERSUS.semente = parseInt($('versus-semente').value, 10) || VERSUS.semente;
}

function versusEscolherIdioma(lado, idioma) {
    if (VERSUS.fase !== 'config' || !Object.hasOwn(IDIOMAS, idioma)) return;
    versusLerOpcoes();
    VERSUS[lado] = idioma;
    renderVersus();
}

function versusNovaSemente() {
    versusLerOpcoes();
    VERSUS.semente = Math.floor(Math.random() * 900000) + 100000;
    renderVersus();
}

async function versusComecar() {
    versusLerOpcoes();
    const { nivel, quantidade, semente, idiomaHumano, idiomaIA } = VERSUS;
    await Promise.all([carregarDicionario(idiomaHumano), carregarDicionario(idiomaIA)]);
    try {
        // Mesmo idioma: os dois recebem o texto idêntico. Idiomas diferentes: lote pareado.
        if (idiomaHumano === idiomaIA) {
            VERSUS.loteHumano = VERSUS.loteIA = gerarLote(parseInt(nivel, 10), quantidade, semente, idiomaHumano);
        } else {
            [VERSUS.loteHumano, VERSUS.loteIA] = gerarLotePareado(parseInt(nivel, 10), quantidade, semente, [idiomaHumano, idiomaIA]);
        }
    } catch (e) {
        toast(e.message.startsWith('Não consegui gerar') ? t('erro_palavra') : e.message, 'erro');
        return;
    }
    Object.assign(VERSUS, { fase: 'jogando', respostas: VERSUS.loteHumano.map(() => ''), textoIA: '', resultadoHumano: null, resultadoIA: null, inicio: Date.now(), fim: 0 });
    clearInterval(versusRelogio);
    versusRelogio = setInterval(() => { const el = $('versus-relogio'); if (el) el.textContent = versusTempo(Date.now() - VERSUS.inicio); }, 1000);
    renderVersus();
    $('versus-resposta-0')?.focus();
}

function versusTerminar() {
    if (VERSUS.fase !== 'jogando') return;
    clearInterval(versusRelogio);
    VERSUS.fim = Date.now();
    VERSUS.resultadoHumano = corrigir(VERSUS.loteHumano, VERSUS.respostas.map((r, i) => `${i + 1}: ${r}`).join('\n'));
    VERSUS.fase = 'terminado';
    renderVersus();
}

function versusNovoJogo() {
    clearInterval(versusRelogio);
    Object.assign(VERSUS, { fase: 'config', loteHumano: [], loteIA: [], respostas: [], textoIA: '', resultadoHumano: null, resultadoIA: null });
    VERSUS.semente = Math.floor(Math.random() * 900000) + 100000;
    renderVersus();
}

// Enter passa para o próximo desafio; no último, não envia (evita terminar sem querer)
function versusEnter(evento, i) {
    if (evento.key !== 'Enter') return;
    evento.preventDefault();
    $(`versus-resposta-${i + 1}`)?.focus();
}

async function versusCopiarIA(btn) {
    if (!VERSUS.loteIA.length) return;
    await copiar(montarPrompt(VERSUS.loteIA));
    confirmarCopia(btn);
}

function versusCorrigirIA() {
    if (!VERSUS.loteIA.length) return;
    if (!VERSUS.textoIA.trim()) { toast(t('cole_primeiro'), 'erro'); return; }
    VERSUS.resultadoIA = corrigir(VERSUS.loteIA, VERSUS.textoIA);
    renderVersus();
}

// Vence quem acerta mais a lógica (igual nos dois idiomas); a morfologia desempata
function versusVencedor(h, a) {
    if (h.logica !== a.logica) return h.logica > a.logica ? 'voce' : 'ia';
    if (h.morfologia !== a.morfologia) return h.morfologia > a.morfologia ? 'voce' : 'ia';
    return 'empate';
}

// --- TELA ---
function versusBandeiras(lado) {
    return Object.entries(IDIOMAS).map(([id, info]) => {
        const ativo = VERSUS[lado] === id;
        return `<button onclick="versusEscolherIdioma('${lado}', '${id}')" title="${info.nome}" aria-label="${info.nome}" aria-pressed="${ativo}"
            ${VERSUS.fase !== 'config' ? 'disabled' : ''}
            class="rounded-md p-0.5 transition-all ${ativo ? 'ring-2 ring-purple-400' : 'opacity-40 hover:opacity-100'} disabled:cursor-not-allowed">${info.bandeira}</button>`;
    }).join('');
}

function versusOpcoes() {
    const travado = VERSUS.fase !== 'config' ? 'disabled' : '';
    const campo = 'w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50';
    const rotulo = 'block text-xs font-black text-slate-500 uppercase tracking-widest mb-2';
    return `
    <section class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div class="col-span-2">
                <label for="versus-nivel" class="${rotulo}">${t('nivel')}</label>
                <select id="versus-nivel" ${travado} class="${campo}">
                    ${Object.keys(NIVEIS).map(n => `<option value="${n}" ${n === VERSUS.nivel ? 'selected' : ''}>${escapeHtml(t('nivel_opcao', { n, nome: nomeDoNivel(n) }))}</option>`).join('')}
                </select>
            </div>
            <div>
                <label for="versus-quantidade" class="${rotulo}">${t('desafios_rotulo')}</label>
                <input id="versus-quantidade" type="number" min="1" max="20" value="${VERSUS.quantidade}" ${travado} class="${campo}">
            </div>
            <div>
                <label for="versus-semente" class="${rotulo}">${t('semente')}</label>
                <div class="flex gap-1">
                    <input id="versus-semente" type="number" value="${VERSUS.semente}" ${travado} class="${campo} min-w-0 font-mono">
                    <button onclick="versusNovaSemente()" ${travado} class="shrink-0 px-3 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-lg text-slate-300 disabled:opacity-50" title="${escapeHtml(t('nova_semente'))}"><i data-lucide="shuffle" class="w-4 h-4"></i></button>
                </div>
            </div>
            <div>
                <div class="${rotulo}">${t('v_seu_idioma')}</div>
                <div class="flex gap-1.5 py-2">${versusBandeiras('idiomaHumano')}</div>
            </div>
            <div>
                <div class="${rotulo}">${t('v_idioma_ia')}</div>
                <div class="flex gap-1.5 py-2">${versusBandeiras('idiomaIA')}</div>
            </div>
        </div>
        <div class="flex flex-wrap items-center gap-4 mt-5">
            ${VERSUS.fase === 'config'
                ? `<button onclick="versusComecar()" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-900/30 active:scale-[0.97]"><i data-lucide="play" class="w-4 h-4"></i> ${t('v_comecar')}</button>`
                : `<button onclick="versusNovoJogo()" class="bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 font-black px-6 py-3 rounded-xl flex items-center gap-2"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> ${t('v_novo')}</button>`}
            <p class="text-[11px] text-slate-500 leading-relaxed flex-1 min-w-[16rem]">${t('v_justo')}</p>
        </div>
    </section>`;
}

function versusDesafiosHumano() {
    if (VERSUS.fase === 'config') {
        return `<section class="bg-slate-900/50 p-10 rounded-2xl border border-dashed border-slate-800 text-center text-sm text-slate-500">${t('v_antes')}</section>`;
    }
    const terminado = VERSUS.fase === 'terminado';
    const decorrido = (terminado ? VERSUS.fim : Date.now()) - VERSUS.inicio;
    const porNumero = new Map((VERSUS.resultadoHumano || []).map(r => [r.numero, r]));
    const cartoes = VERSUS.loteHumano.map((d, i) => {
        const r = porNumero.get(d.numero);
        const ia = VERSUS.loteIA[i];
        return `
        <article class="bg-slate-900 rounded-2xl border ${r ? `border-${SELOS[r.status]}-500/50` : 'border-slate-800'} p-5 shadow-xl">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-blue-500/30">${t('v_desafio')} ${d.numero}</span>
                ${r ? selo(r.status) : ''}
            </div>
            <div class="space-y-1 bg-slate-950 p-4 border border-slate-800/50 rounded-xl text-slate-300 leading-relaxed">
                ${d.linhas.map(l => `<div>${escapeHtml(l.texto)}</div>`).join('')}
                <div class="font-bold text-white pt-1">${escapeHtml(d.pergunta.texto)}</div>
            </div>
            ${terminado
                ? `<div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span><span class="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2">${t('v_voce')}</span><span class="font-mono ${COR_DO_STATUS[r.status]}">${VERSUS.respostas[i] ? escapeHtml(VERSUS.respostas[i]) : t('v_em_branco')}</span></span>
                    <span><span class="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mr-2">${t('v_gabarito')}</span><span class="font-mono font-black text-emerald-400">${escapeHtml(d.resposta)}</span>
                    ${ia !== d ? `<span class="text-[10px] text-slate-500"> · ${t('v_gabarito_ia')}: <span class="font-mono text-slate-400">${escapeHtml(ia.resposta)}</span></span>` : ''}</span>
                  </div>`
                : `<input id="versus-resposta-${i}" type="text" autocomplete="off" spellcheck="false" value="${escapeHtml(VERSUS.respostas[i])}"
                    oninput="VERSUS.respostas[${i}] = this.value" onkeydown="versusEnter(event, ${i})" placeholder="${escapeHtml(t('v_sua_resposta'))}"
                    class="mt-3 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-mono outline-none focus:border-purple-500">`}
        </article>`;
    }).join('');
    return `
    <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
            <h3 class="text-lg font-black text-white uppercase tracking-tight">${t('v_seus_desafios')}</h3>
            <span class="text-[10px] font-mono text-slate-500">${IDIOMAS[VERSUS.idiomaHumano].nome} · ${t('nivel')} ${VERSUS.nivel} · ${t('semente')} ${VERSUS.semente}</span>
            <span class="ml-auto flex items-center gap-1.5 text-sm font-black text-white tabular-nums"><i data-lucide="timer" class="w-4 h-4 text-purple-400"></i><span id="versus-relogio">${versusTempo(decorrido)}</span></span>
        </div>
        ${cartoes}
        ${terminado ? '' : `<button onclick="versusTerminar()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-lg active:scale-[0.98]">${t('v_terminar')}</button>`}
    </div>`;
}

function versusCartaoIA() {
    const temJogo = VERSUS.loteIA.length > 0;
    const corrigida = !!VERSUS.resultadoIA;
    return `
    <section class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 class="font-bold text-white uppercase text-sm tracking-widest flex items-center gap-2 mb-2"><i data-lucide="bot" class="w-4 h-4 text-emerald-400"></i> ${t('v_ia_titulo')}</h3>
        ${!temJogo ? `<p class="text-xs text-slate-500">${t('v_ia_sem_jogo')}</p>` : `
        <p class="text-xs text-slate-400 leading-relaxed mb-4">${t('v_ia_passos')}</p>
        <button onclick="versusCopiarIA(this)" class="w-full flex justify-center items-center gap-2 text-xs font-black uppercase text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 py-3 rounded-xl transition-all mb-4">
            <i data-lucide="copy" class="w-4 h-4"></i> <span>${t('v_copiar_ia', { idioma: IDIOMAS[VERSUS.idiomaIA].nome })}</span>
        </button>
        <label for="versus-texto-ia" class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">${t('v_resposta_ia')}</label>
        <textarea id="versus-texto-ia" rows="5" oninput="VERSUS.textoIA = this.value" placeholder="${escapeHtml(t('resposta_placeholder'))}"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-emerald-500 custom-scrollbar">${escapeHtml(VERSUS.textoIA)}</textarea>
        <button onclick="versusCorrigirIA()" class="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider py-3 rounded-xl shadow-lg active:scale-[0.98]">${t('v_corrigir_ia')}</button>
        ${corrigida && VERSUS.fase !== 'terminado' ? `<p class="text-[11px] text-emerald-300/80 mt-3">${t('v_ia_corrigida')}</p>` : ''}`}
    </section>`;
}

function versusLadoDoPlacar(rotulo, icone, resultado, extra = '') {
    const { total, logica, morfologia } = placarDosEixos(resultado);
    const pct = (n, de) => de ? `${Math.round(100 * n / de)}%` : '—';
    return `
    <div class="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><i data-lucide="${icone}" class="w-3.5 h-3.5"></i> ${rotulo}</div>
        <div class="text-3xl font-black text-white tabular-nums mt-1">${morfologia}/${total}</div>
        <div class="text-[9px] uppercase tracking-widest text-slate-500">${t('v_certos')}</div>
        <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><div class="text-[9px] font-black uppercase tracking-widest text-slate-500">${t('logica')}</div><div class="font-black text-white tabular-nums">${pct(logica, total)}</div></div>
            <div><div class="text-[9px] font-black uppercase tracking-widest text-slate-500">${t('morfologia')}</div><div class="font-black text-white tabular-nums">${pct(morfologia, logica)}</div></div>
        </div>
        ${extra}
    </div>`;
}

function versusPlacar() {
    const h = VERSUS.resultadoHumano, a = VERSUS.resultadoIA;
    let corpo;
    if (!h) corpo = `<p class="text-xs text-slate-500">${t('v_falta_voce')}</p>`;
    else if (!a) corpo = `${versusLadoDoPlacar(t('v_voce'), 'user', h, `<div class="text-[10px] text-slate-500 mt-2">${t('v_tempo')}: <b class="text-slate-300">${versusTempo(VERSUS.fim - VERSUS.inicio)}</b></div>`)}<p class="text-xs text-slate-500 mt-4">${t('v_falta_ia')}</p>`;
    else {
        const ph = placarDosEixos(h), pa = placarDosEixos(a);
        const quem = versusVencedor(ph, pa);
        const cor = quem === 'voce' ? 'emerald' : quem === 'ia' ? 'sky' : 'amber';
        const linhas = VERSUS.loteHumano.map((d, i) => `
            <tr class="border-t border-slate-800">
                <td class="py-1.5 pr-2 text-slate-500 font-mono">${d.numero}</td>
                <td class="py-1.5 pr-2">${selo(h[i].status)}</td>
                <td class="py-1.5">${selo(a[i].status)}</td>
            </tr>`).join('');
        corpo = `
            <div class="text-center text-2xl font-black text-${cor}-300 mb-4">${t('v_' + (quem === 'voce' ? 'venceu_voce' : quem === 'ia' ? 'venceu_ia' : 'empate'))}</div>
            <div class="grid grid-cols-2 gap-3">
                ${versusLadoDoPlacar(t('v_voce'), 'user', h, `<div class="text-[10px] text-slate-500 mt-2">${t('v_tempo')}: <b class="text-slate-300">${versusTempo(VERSUS.fim - VERSUS.inicio)}</b></div>`)}
                ${versusLadoDoPlacar(t('v_ia'), 'bot', a)}
            </div>
            <table class="w-full mt-4 text-xs"><thead><tr class="text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th class="text-left pb-1">#</th><th class="text-left pb-1">${t('v_voce')}</th><th class="text-left pb-1">${t('v_ia')}</th></tr></thead>
                <tbody>${linhas}</tbody></table>
            <p class="text-[10px] text-slate-500 leading-relaxed mt-4">${t('v_criterio')}${VERSUS.idiomaHumano !== VERSUS.idiomaIA ? ' ' + t('v_idiomas_diferentes') : ''}</p>`;
    }
    return `
    <section class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 class="font-bold text-white uppercase text-sm tracking-widest flex items-center gap-2 mb-4"><i data-lucide="swords" class="w-4 h-4 text-purple-400"></i> ${t('v_placar')}</h3>
        ${corpo}
    </section>`;
}

function renderVersus() {
    versusPadroes();
    $('aba-versus').innerHTML = `
        <div>
            <h2 class="text-xl font-black text-white uppercase tracking-tight">${t('v_titulo')}</h2>
            <p class="text-sm text-slate-400 mt-1">${t('v_intro')}</p>
        </div>
        ${versusOpcoes()}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-7">${versusDesafiosHumano()}</div>
            <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-32">${versusCartaoIA()}${versusPlacar()}</div>
        </div>`;
    refreshIcons();
}
