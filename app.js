// LOGIGEN - GERADOR DE LÓGICA MANUAL
// Construtor de templates, gerador de puzzles e dicionário.
// Tudo roda no navegador; os dados ficam no localStorage (padrão em dados.js).

const STORAGE_KEY = 'logigen_dados';
const TAB_KEY = 'logigen_aba';

// Categorias do dicionário e a letra da variável que cada uma preenche ({S1}, {V2}...)
const CATEGORIES = [
    { key: 'nouns', tag: 'S', label: 'Substantivos', singular: 'substantivos' },
    { key: 'verbs', tag: 'V', label: 'Verbos', singular: 'verbos' },
    { key: 'adjs', tag: 'A', label: 'Adjetivos', singular: 'adjetivos' },
    { key: 'names', tag: 'N', label: 'Nomes', singular: 'nomes' },
    { key: 'locs', tag: 'L', label: 'Locais', singular: 'locais' }
];
const DICT_MODES = {
    ficticio: { label: 'Palavras inventadas (anti-memorização)', color: 'purple', name: 'fictício' },
    real: { label: 'Palavras reais (auditoria humana)', color: 'emerald', name: 'real' }
};

let appData = loadData();
let activeEditId = null;
let editorAdjustment = 0;
let editorDirty = false;
let manualSession = null;
let activeDictMode = 'ficticio';

// --- PERSISTÊNCIA ---
function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (isValidData(saved)) return saved;
    } catch (e) {}
    return clone(DADOS_PADRAO);
}

function saveApp() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        toast('Não foi possível salvar no navegador. Use "Exportar dados" para não perder nada.', 'error');
    }
}

function isValidData(d) {
    return !!d && Array.isArray(d.templates) && !!d.dicionario && !!d.dicionario.ficticio && !!d.dicionario.real;
}

// Garante os tipos esperados pelo motor em dados vindos de fora (importação)
function normalizeData(d) {
    const words = (list) => Array.isArray(list) ? list.map(String) : [];
    const dict = (src) => Object.fromEntries(CATEGORIES.map(c => [c.key, words(src[c.key])]));
    return {
        templates: d.templates.map((t, i) => ({
            id: String(t.id ?? `tpl_${Date.now()}_${i}`),
            name: String(t.name ?? 'Sem nome'),
            premises: words(t.premises),
            question: String(t.question ?? ''),
            answer: String(t.answer ?? ''),
            levelAdjustment: parseInt(t.levelAdjustment, 10) || 0
        })),
        dicionario: { ficticio: dict(d.dicionario.ficticio), real: dict(d.dicionario.real) }
    };
}

function clone(x) { return JSON.parse(JSON.stringify(x)); }

// --- UTILITÁRIOS ---
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function refreshIcons() { if (window.lucide) lucide.createIcons(); }

function analyzeTemplate(t) {
    return Motor.analyze(t.premises, t.question, t.answer, t.levelAdjustment);
}

function sortedTemplates() {
    return appData.templates
        .map(t => ({ t, a: analyzeTemplate(t) }))
        .sort((x, y) => x.a.level - y.a.level || x.t.name.localeCompare(y.t.name));
}

let toastTimer;
function toast(msg, kind = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl border max-w-sm ' +
        (kind === 'error' ? 'bg-rose-950 border-rose-500/40 text-rose-200' : 'bg-slate-900 border-emerald-500/40 text-emerald-300');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// --- NAVEGAÇÃO ---
function switchTab(tabId) {
    if (!document.getElementById('tab-' + tabId)) tabId = 'editor';
    document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === 'tab-' + tabId));
    document.querySelectorAll('.tab-btn').forEach(b => {
        const on = b.id === 'btn-' + tabId;
        ['bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-900/30'].forEach(c => b.classList.toggle(c, on));
        b.classList.toggle('text-slate-400', !on);
    });

    if (tabId === 'generator') fillGeneratorSelect();
    if (tabId === 'dictionary') renderDictionary();
    refreshIcons();

    try { localStorage.setItem(TAB_KEY, tabId); } catch (e) {}
}

// --- CONSTRUTOR LÓGICO ---
function renderTemplatesList() {
    const list = document.getElementById('templates-list');
    document.getElementById('templates-count').textContent = `(${appData.templates.length})`;

    list.innerHTML = sortedTemplates().map(({ t, a }) => `
        <div data-id="${escapeHtml(t.id)}" class="group cursor-pointer bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl transition-all flex items-center justify-between ${activeEditId === t.id ? 'border-blue-500 bg-blue-900/10' : ''}">
            <div class="pr-2">
                <div class="text-sm font-bold text-slate-200 mb-1 leading-tight">${escapeHtml(t.name)}</div>
                <div class="text-[10px] text-slate-500 flex gap-2 font-mono">
                    <span class="text-slate-600">LC:${a.baseLevel}</span>
                    <span class="text-purple-400 font-black">LR:${a.level}</span>
                </div>
            </div>
            <div class="lvl lvl-${a.level} text-[10px] font-black uppercase px-2 py-1 rounded border min-w-[45px] text-center shadow-lg">Lvl ${a.level}</div>
        </div>`).join('');
}

function confirmDiscard() {
    return !editorDirty || confirm('Há alterações não salvas neste template. Descartar?');
}

function editTemplate(id, force = false) {
    if (id === activeEditId && !force) return;
    if (!force && !confirmDiscard()) return;
    const tpl = appData.templates.find(t => t.id === id);
    if (!tpl) return;

    activeEditId = id;
    editorAdjustment = tpl.levelAdjustment || 0;
    document.getElementById('tpl-name').value = tpl.name;
    document.getElementById('tpl-question').value = tpl.question;
    document.getElementById('tpl-answer').value = tpl.answer;
    const c = document.getElementById('tpl-premises-container');
    c.innerHTML = (tpl.premises.length ? tpl.premises : ['']).map(premiseRow).join('');

    setDirty(false);
    renderTemplatesList();
    calculateAndRenderMath();
}

function premiseRow(value) {
    return `<div class="flex gap-2"><input class="t-prem w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" value="${escapeHtml(value)}" placeholder="Escreva a premissa..." oninput="onEditorInput()"><button onclick="removePremise(this)" class="text-slate-600 hover:text-red-400 font-bold px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl transition-all" title="Remover regra">X</button></div>`;
}

function addPremiseInput() {
    const c = document.getElementById('tpl-premises-container');
    c.insertAdjacentHTML('beforeend', premiseRow(''));
    c.lastElementChild.querySelector('input').focus();
    onEditorInput();
}

function removePremise(btn) {
    btn.parentElement.remove();
    onEditorInput();
}

function adjustLevel(delta) {
    editorAdjustment = Math.max(-19, Math.min(19, editorAdjustment + delta));
    onEditorInput();
}

function onEditorInput() {
    setDirty(true);
    calculateAndRenderMath();
}

function setDirty(dirty) {
    editorDirty = dirty;
    document.getElementById('dirty-flag').classList.toggle('hidden', !dirty);
}

// Lê o formulário do editor (regras vazias são ignoradas)
function readEditor() {
    return {
        name: document.getElementById('tpl-name').value.trim(),
        premises: Array.from(document.querySelectorAll('.t-prem')).map(e => e.value).filter(p => p.trim() !== ''),
        question: document.getElementById('tpl-question').value,
        answer: document.getElementById('tpl-answer').value,
        levelAdjustment: editorAdjustment
    };
}

function calculateAndRenderMath() {
    const { premises, question, answer, levelAdjustment } = readEditor();
    const m = Motor.analyze(premises, question, answer, levelAdjustment);

    document.getElementById('calc-score').innerText = m.score.toFixed(1);
    document.getElementById('calc-p').innerText = m.premises;
    document.getElementById('calc-v').innerText = m.vars;
    document.getElementById('calc-e').innerText = m.elos;
    document.getElementById('calc-adjust').innerText = levelAdjustment > 0 ? `+${levelAdjustment}` : levelAdjustment;

    document.getElementById('calc-level-badge').innerHTML = `
        <div class="flex flex-wrap gap-2 items-center">
            <div class="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">Calculado (LC): ${m.baseLevel}</div>
            <div class="lvl lvl-${m.level} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg shadow-purple-900/20">Real (LR): ${m.level} - ${LEVEL_NAMES[m.level]}</div>
        </div>`;
    document.getElementById('calc-glow').className = `lvl-glow lvl-${m.level} absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20`;

    // --- AUDITORIA: variáveis destacadas, pontes e diagnóstico ---
    const highlightVars = (text) => escapeHtml(text).replace(/\{([A-Z]\d+)\}/g, (match, v) => {
        const isBridge = m.bridgeVars.includes(v);
        return `<span class="px-1.5 py-0.5 rounded ${isBridge ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'}">${match}</span>`;
    });

    let linesMarkup = premises.map((p, i) => `<div class="flex gap-3 text-[11px]"><span class="text-slate-600 font-mono w-4">${i + 1}.</span><span class="text-slate-300 font-medium">${highlightVars(p)}</span></div>`).join('');
    linesMarkup += `<div class="flex gap-3 text-[11px] mt-2 pt-2 border-t border-slate-900"><span class="text-blue-500 font-mono w-4 text-[9px] uppercase">Q.</span><span class="text-blue-200 italic">${highlightVars(question)}</span></div>`;
    linesMarkup += `<div class="flex gap-3 text-[11px]"><span class="text-emerald-500 font-mono w-4 text-[9px] uppercase">A.</span><span class="text-emerald-300 font-bold">${highlightVars(answer)}</span></div>`;

    const varBadges = m.uniqueVars.map(v => {
        const isBridge = m.bridgeVars.includes(v);
        return `<span class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border ${isBridge ? 'bg-purple-900/30 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'}">
            <i data-lucide="${isBridge ? 'link-2' : 'hash'}" class="w-3 h-3"></i> ${v}
            <span class="opacity-40 text-[8px] font-black ml-1 uppercase">x${m.varCounts[v] || 1}</span>
        </span>`;
    }).join('');

    const bridgeRows = Object.entries(m.bridgeMap).filter(([, places]) => places.length > 1).map(([v, places]) => `
        <div class="flex items-center gap-2 text-[10px] font-mono">
            <span class="text-purple-400 font-black shrink-0 w-6">${v}</span>
            <span class="text-slate-600">→</span>
            <div class="flex flex-wrap gap-1">
                ${places.map(place => {
                    let colorClass = 'bg-slate-900 text-slate-400 border-slate-800';
                    if (place.includes('(Q)')) colorClass = 'bg-blue-900/30 text-blue-300 border-blue-500/20';
                    if (place.includes('(Ans)')) colorClass = 'bg-emerald-900/30 text-emerald-300 border-emerald-500/20';
                    return `<span class="px-1.5 py-0.5 rounded border text-[8px] whitespace-nowrap ${colorClass}">${place}</span>`;
                }).join('')}
            </div>
        </div>`).join('');

    document.getElementById('logic-audit-content').innerHTML = `
        <div>
            <h4 class="text-[9px] text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                <i data-lucide="eye" class="w-3 h-3"></i> 1. Rastro de Enunciado
            </h4>
            <div class="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 leading-relaxed">${linesMarkup}</div>
        </div>

        <div>
            <h4 class="text-[9px] text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center justify-between">
                <span class="flex items-center gap-2"><i data-lucide="component" class="w-3 h-3"></i> 2. Mapeamento de Variáveis & Pontes</span>
                <span class="text-purple-400 text-[8px] lowercase">${m.bridgeVars.length} pontes ativas</span>
            </h4>
            <div class="flex flex-wrap gap-2 p-3 bg-slate-950/30 rounded-xl border border-slate-900/50">
                ${varBadges || '<span class="text-slate-600 text-[10px] italic">Nenhuma variável detectada.</span>'}
            </div>
        </div>

        <div>
            <h4 class="text-[9px] text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                <i data-lucide="git-merge" class="w-3 h-3"></i> 3. Arquitetura de Conexões (Pontes)
            </h4>
            <div class="space-y-1.5 p-3 bg-slate-950/30 rounded-xl border border-slate-900/50">
                ${bridgeRows || '<span class="text-slate-600 text-[10px] italic text-center block py-2">Nenhum elo estrutural detectado.</span>'}
            </div>
        </div>

        <div class="pt-4 border-t border-slate-900">
            <h4 class="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                <i data-lucide="cpu" class="w-3 h-3"></i> 4. Diagnóstico do Motor
            </h4>
            <div class="p-4 bg-blue-950/20 rounded-xl border border-blue-900/20 text-[10px] font-mono text-blue-300 leading-relaxed flex items-center justify-between gap-4">
                <div>
                    ${m.premises} regras × 1.0 + ${m.vars} variáveis × 1.5 + ${m.elos} elos × 2.5 + ${m.cognitiveLoad} de carga<br>
                    <span class="text-white font-black text-xs uppercase tracking-tighter">SCORE OFICIAL: ${m.score.toFixed(1)} PONTOS</span>
                </div>
                <div class="text-right shrink-0">
                    <div class="text-blue-500/50 text-[8px] uppercase">Carga Cognitiva</div>
                    <div class="text-blue-400 font-bold">${m.cognitiveLoad} pts</div>
                </div>
            </div>
        </div>`;
    refreshIcons();
}

function saveActiveTemplate() {
    const tpl = appData.templates.find(t => t.id === activeEditId);
    if (!tpl) return;
    const form = readEditor();
    if (!form.name) { toast('Dê um nome ao template antes de salvar.', 'error'); return; }

    Object.assign(tpl, form);
    saveApp();
    editTemplate(tpl.id, true);
    toast('Template salvo.');
}

function createNewTemplate() {
    if (!confirmDiscard()) return;
    const id = 'tpl_' + Date.now();
    appData.templates.push({ id, name: 'Novo Experimento', premises: [], question: '', answer: '', levelAdjustment: 0 });
    saveApp();
    editTemplate(id, true);
    document.getElementById('tpl-name').select();
}

function deleteActiveTemplate() {
    const tpl = appData.templates.find(t => t.id === activeEditId);
    if (!tpl) return;
    if (appData.templates.length <= 1) { toast('Não dá para excluir o único template.', 'error'); return; }
    if (!confirm(`Excluir o template "${tpl.name}"?`)) return;

    appData.templates = appData.templates.filter(t => t.id !== tpl.id);
    saveApp();
    editTemplate(sortedTemplates()[0].t.id, true);
    toast('Template excluído.');
}

function openInManualGenerator(templateId) {
    if (editorDirty && templateId === activeEditId && confirm('Salvar as alterações antes de rolar no gerador?')) {
        saveActiveTemplate();
    }
    switchTab('generator');
    const select = document.getElementById('gen-select');
    select.value = templateId;
    if (select.value === templateId) generateManualLogic();
}

// --- GERADOR MANUAL ---
function fillGeneratorSelect() {
    const s = document.getElementById('gen-select');
    const current = s.value;
    s.innerHTML = sortedTemplates().map(({ t, a }) =>
        `<option value="${escapeHtml(t.id)}">[LR:${a.level} | LC:${a.baseLevel}] ${escapeHtml(t.name)}</option>`
    ).join('');
    if (current) s.value = current;
    if (!s.value && s.options.length) s.selectedIndex = 0;
}

// Sorteia palavras sem repetir, na quantidade que o template pede para cada categoria
function pickWords(dict, tpl) {
    const text = JSON.stringify(tpl);
    const words = {};
    const missing = [];
    for (const c of CATEGORIES) {
        const indices = [...text.matchAll(new RegExp(`\\{${c.tag}(\\d+)\\}`, 'g'))].map(m => parseInt(m[1], 10));
        const needed = indices.length ? Math.max(...indices) : 0;
        const pool = dict[c.key] || [];
        words[c.tag] = shuffle(pool).slice(0, needed);
        if (needed > pool.length) missing.push({ c, needed, have: pool.length });
    }
    return { words, missing };
}

// Troca {S1}, {V2}... pelas palavras sorteadas. Variáveis sem palavra ficam visíveis.
function fillVars(text, words) {
    return text.replace(/\{([SVANL])(\d+)\}/g, (match, tag, n) => words[tag][parseInt(n, 10) - 1] ?? match);
}

function generateManualLogic() {
    const original = appData.templates.find(t => t.id === document.getElementById('gen-select').value);
    if (!original) return;
    const tpl = clone(original);
    const fic = pickWords(appData.dicionario.ficticio, tpl);
    const real = pickWords(appData.dicionario.real, tpl);
    manualSession = { tpl, ficticio: fic.words, real: real.words };

    const warnings = [
        ...fic.missing.map(x => ({ ...x, mode: 'fictício' })),
        ...real.missing.map(x => ({ ...x, mode: 'real' }))
    ];
    const w = document.getElementById('man-warnings');
    w.innerHTML = warnings.map(x =>
        `<div>⚠ O dicionário ${x.mode} tem ${x.have} ${x.c.singular}, mas o template usa até {${x.c.tag}${x.needed}}. Adicione palavras na aba Dados.</div>`
    ).join('');
    w.classList.toggle('hidden', warnings.length === 0);

    document.getElementById('man-empty').classList.add('hidden');
    document.getElementById('manual-output').classList.remove('hidden');
    renderManualSkeleton();
    renderManualDependents();
}

function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function renderManualSkeleton() {
    const { tpl } = manualSession;

    document.getElementById('man-identidade-container').innerHTML = `
        <div class="p-5 bg-slate-950/40 border border-slate-800/60 rounded-3xl animate-fade-in shadow-inner">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <i data-lucide="type" class="text-blue-500 w-4 h-4"></i>
                </div>
                <div class="text-[9px] text-slate-500 font-black uppercase tracking-widest">Identidade do Modelo</div>
            </div>
            <input type="text" value="${escapeHtml(tpl.name)}" oninput="onEditManualLogic('NAME', this.value)" placeholder="Nome do Template..."
                   class="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm font-black text-white outline-none focus:border-blue-500/50 transition-all shadow-inner" />
        </div>`;

    const area = (key, value, classes) =>
        `<textarea oninput="autoGrow(this); onEditManualLogic(${key}, this.value)" class="flex-1 rounded-xl p-3 text-[11px] outline-none resize-none overflow-hidden transition-all ${classes}" rows="1">${escapeHtml(value)}</textarea>`;

    let html = tpl.premises.map((p, i) => `
        <div class="flex gap-3 mb-2">
            <span class="text-yellow-700 font-mono w-4 mt-2 text-[10px]">${i + 1}.</span>
            ${area(i, p, 'bg-slate-900/50 border border-yellow-900/20 text-yellow-200/90 focus:border-yellow-500/50')}
        </div>`).join('');

    html += `
        <div class="mt-4 pt-4 border-t border-yellow-900/30">
            <div class="flex gap-3 mb-2">
                <span class="text-purple-500 font-mono w-4 mt-2 text-[10px]">Q.</span>
                ${area("'Q'", tpl.question, 'bg-purple-900/10 border border-purple-500/20 text-purple-200 italic focus:border-purple-500/50')}
            </div>
            <div class="flex gap-3">
                <span class="text-emerald-500 font-mono w-4 mt-2 text-[10px]">A.</span>
                ${area("'A'", tpl.answer, 'bg-emerald-900/10 border border-emerald-500/20 text-emerald-300 font-bold focus:border-emerald-500/50')}
            </div>
        </div>
        <div class="mt-6 flex flex-wrap gap-3 justify-between items-center bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
            <div id="man-editing-label" class="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Edição Ativa: ${escapeHtml(tpl.name)}</div>
            <button onclick="saveManualLogicToTemplate()" class="bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-yellow-900/20 active:scale-95">
                <i data-lucide="save" class="w-4 h-4"></i> SALVAR NO TEMPLATE
            </button>
        </div>`;

    const skeleton = document.getElementById('man-skeleton');
    skeleton.innerHTML = html;
    skeleton.querySelectorAll('textarea').forEach(autoGrow);
    refreshIcons();
}

function onEditManualLogic(idx, val) {
    const { tpl } = manualSession;
    if (idx === 'NAME') {
        tpl.name = val;
        document.getElementById('man-editing-label').textContent = 'Edição Ativa: ' + val;
    }
    else if (idx === 'Q') tpl.question = val;
    else if (idx === 'A') tpl.answer = val;
    else tpl.premises[idx] = val;
    renderManualDependents();
}

// Texto do puzzle já preenchido, para uma camada ('ficticio' ou 'real')
function filledPuzzle(mode) {
    const { tpl } = manualSession;
    const words = manualSession[mode];
    return {
        premises: tpl.premises.map(p => fillVars(p, words)),
        question: fillVars(tpl.question, words),
        answer: fillVars(tpl.answer, words)
    };
}

function renderManualDependents() {
    const premRow = (x, i, color) => `<div class="flex gap-4 items-start"><span class="text-${color}-600 font-bold border border-${color}-800 rounded bg-${color}-900 px-2 text-xs py-1 mt-0.5">${i + 1}</span><span class="text-${color}-300 leading-relaxed">${escapeHtml(x)}</span></div>`;

    const f = filledPuzzle('ficticio');
    document.getElementById('man-prems').innerHTML = f.premises.map((x, i) => premRow(x, i, 'slate')).join('');
    document.getElementById('man-q').innerText = f.question;
    document.getElementById('man-a').innerText = f.answer;

    const r = filledPuzzle('real');
    document.getElementById('man-real-prems').innerHTML = r.premises.map((x, i) => premRow(x, i, 'emerald')).join('');
    document.getElementById('man-real-q').innerText = r.question;
    document.getElementById('man-real-a').innerText = r.answer;
}

// Mesmo formato de prompt que a antiga Arena enviava para a IA
function buildPrompt(puzzle) {
    return `Avalie com extremo rigor as premissas lógicas abaixo.\n\n` +
        `Responda APENAS com o valor direto (o nome, local, verbo ou adjetivo), sem explicações extras.\n\n` +
        `Regras:\n${puzzle.premises.join('\n')}\n\nQ: ${puzzle.question}\n\nResposta:`;
}

async function copyPrompt(mode, btn) {
    const text = buildPrompt(filledPuzzle(mode));
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        // Fallback para navegadores que bloqueiam a API de clipboard em file://
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
    }
    const label = btn.querySelector('span');
    label.textContent = 'Copiado!';
    setTimeout(() => { label.textContent = 'Copiar prompt'; }, 1500);
}

function saveManualLogicToTemplate() {
    const { tpl } = manualSession;
    if (!confirm(`Deseja salvar as alterações permanentes no template "${tpl.name}"?`)) return;

    const idx = appData.templates.findIndex(t => t.id === tpl.id);
    if (idx === -1) { toast('Esse template não existe mais.', 'error'); return; }
    appData.templates[idx] = clone(tpl);
    saveApp();
    renderTemplatesList();
    fillGeneratorSelect();
    if (activeEditId === tpl.id) editTemplate(tpl.id, true);
    toast('Template salvo.');
}

// --- DICIONÁRIO ---
function switchDictMode(mode) {
    activeDictMode = mode;
    renderDictionary();
}

function renderDictionary() {
    const mode = DICT_MODES[activeDictMode];
    const color = mode.color;
    document.querySelectorAll('.dict-mode-btn').forEach(b => {
        const on = b.id === 'btn-dict-' + activeDictMode;
        b.className = 'dict-mode-btn px-4 py-2 rounded-lg text-xs font-black transition-all ' +
            (on ? `shadow-lg text-white ${activeDictMode === 'ficticio' ? 'bg-purple-600' : 'bg-emerald-600'}` : 'text-slate-400 hover:text-white');
    });
    document.getElementById('dict-mode-label').innerText = mode.label;

    const dict = appData.dicionario[activeDictMode];
    document.getElementById('dictionary-grid').innerHTML = CATEGORIES.map(c => {
        const words = dict[c.key] || [];
        return `
        <div class="bg-slate-900 border border-${color}-900/30 p-5 rounded-2xl h-[280px] flex flex-col shadow-xl">
            <h3 class="font-bold text-white mb-4 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <i data-lucide="hash" class="w-4 h-4 text-${color}-500"></i> ${c.label}
                <span class="font-mono text-[10px] text-slate-500">{${c.tag}}</span>
                <span class="text-[9px] text-slate-600 ml-auto">${words.length}</span>
            </h3>
            <div class="flex gap-2 mb-3">
                <input id="in-${c.key}" onkeydown="if (event.key === 'Enter') addW('${c.key}')" class="bg-slate-950 border border-slate-700 w-full rounded-lg p-2.5 text-white outline-none text-sm focus:border-${color}-500" placeholder="Nova palavra...">
                <button onclick="addW('${c.key}')" class="bg-${color}-600 hover:bg-${color}-500 text-white rounded-lg px-4 font-black transition-colors">+</button>
            </div>
            <div class="overflow-auto space-y-1.5 custom-scrollbar pr-2">${words.map((w, i) => `
                <div class="flex justify-between hover:bg-slate-800/80 p-2 rounded-lg text-sm text-slate-300 border border-transparent hover:border-slate-700 transition">
                    <span>${escapeHtml(w)}</span>
                    <button onclick="rmW('${c.key}', ${i})" class="text-slate-600 hover:text-red-500 font-bold" title="Remover"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                </div>`).join('')}
            </div>
        </div>`;
    }).join('');
    refreshIcons();
}

function addW(key) {
    const input = document.getElementById('in-' + key);
    const word = input.value.trim();
    if (!word) return;
    const dict = appData.dicionario[activeDictMode];
    dict[key] = dict[key] || [];
    if (dict[key].some(w => w.toLowerCase() === word.toLowerCase())) {
        toast(`"${word}" já está na lista.`, 'error');
        return;
    }
    dict[key].push(word);
    saveApp();
    renderDictionary();
    document.getElementById('in-' + key).focus();
}

function rmW(key, idx) {
    appData.dicionario[activeDictMode][key].splice(idx, 1);
    saveApp();
    renderDictionary();
}

// --- IMPORTAR / EXPORTAR ---
function exportData() {
    const js = '// Dados padrão do LogiGen: templates de puzzle e dicionários de palavras.\n' +
        '// Este arquivo pode ser substituído pelo "Exportar dados" da aba Dados.\n' +
        `const DADOS_PADRAO = ${JSON.stringify(appData, null, 2)};\n`;
    const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados.js';
    a.click();
    URL.revokeObjectURL(url);
}

// Aceita tanto um dados.js exportado quanto um .json com o mesmo formato
async function importData(input) {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    try {
        const text = await file.text();
        const raw = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
        if (!isValidData(raw)) throw new Error('formato inválido');
        const data = normalizeData(raw);
        if (!confirm(`Substituir os dados atuais por ${data.templates.length} templates do arquivo "${file.name}"?`)) return;
        replaceData(data);
        toast('Dados importados.');
    } catch (e) {
        toast(`Não consegui ler "${file.name}": ${e.message}`, 'error');
    }
}

function resetData() {
    if (!confirm('Restaurar os templates e dicionários do arquivo dados.js? Tudo o que foi alterado neste navegador será perdido.')) return;
    replaceData(clone(DADOS_PADRAO));
    toast('Dados restaurados.');
}

function replaceData(data) {
    appData = data;
    saveApp();
    manualSession = null;
    document.getElementById('manual-output').classList.add('hidden');
    document.getElementById('man-empty').classList.remove('hidden');
    activeEditId = null;
    if (appData.templates.length) editTemplate(sortedTemplates()[0].t.id, true);
    renderTemplatesList();
    fillGeneratorSelect();
    renderDictionary();
}

// --- BOOT ---
function init() {
    document.getElementById('templates-list').addEventListener('click', e => {
        const item = e.target.closest('[data-id]');
        if (item) editTemplate(item.dataset.id);
    });
    window.addEventListener('beforeunload', e => {
        if (editorDirty) { e.preventDefault(); e.returnValue = ''; }
    });

    if (appData.templates.length) editTemplate(sortedTemplates()[0].t.id, true);
    renderTemplatesList();

    let tab = 'editor';
    try { tab = localStorage.getItem(TAB_KEY) || 'editor'; } catch (e) {}
    switchTab(tab);
}

init();
