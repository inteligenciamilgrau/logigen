// LOGIGEN - ABA PESQUISA
// Gráficos comparativos das baterias de teste, a partir dos resultados desafio a desafio
// (pesquisa-dados.js). Feitos à mão em HTML/CSS, sem biblioteca: funcionam sem internet.
// Os textos vêm de idiomas.js (t(), chaves "p_...").

// Intervalo de confiança de 95% de uma proporção (Wilson). Com 10 desafios ele é largo,
// e a barra mostra isso: diferenças que cabem dentro dele não são conclusivas.
function wilson(k, n, z = 1.96) {
    if (!n) return [0, 0];
    const p = k / n, z2 = z * z, den = 1 + z2 / n;
    const centro = (p + z2 / (2 * n)) / den;
    const margem = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / den;
    return [Math.max(0, centro - margem), Math.min(1, centro + margem)];
}

// Cor de cada resultado; o nome vem de idiomas.js (status_certo, status_hesitou...)
const COR_DO_RESULTADO = {
    certo: '#10b981', hesitou: '#bef264', ambigua: '#fb923c', flexao: '#fbbf24', confusao: '#f43f5e', cortada: '#d946ef'
};
const TIPOS_FLEXAO = ['gerundio', 'verbo-plural', 'genero', 'adj-plural'];
const ACERTOU_LOGICA = ['certo', 'hesitou', 'ambigua', 'flexao'];

const porcento = (k, n) => n ? Math.round(100 * k / n) : 0;
const contar = (lista, ...status) => lista.filter(s => status.includes(s)).length;
const rodados = (lista) => lista.filter(s => s !== null);
const nomeDoResultado = (s) => t('status_' + s);

// --- PEÇAS ---
function cartao(icone, titulo, subtitulo, corpo, rodape = '') {
    return `
    <section class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 class="font-bold text-white uppercase text-sm tracking-widest flex items-center gap-2 mb-1">
            <i data-lucide="${icone}" class="w-4 h-4 text-purple-400"></i> ${titulo}
        </h2>
        <p class="text-xs text-slate-400 leading-relaxed mb-5">${subtitulo}</p>
        ${corpo}
        ${rodape ? `<p class="text-[10px] text-slate-500 leading-relaxed mt-5">${rodape}</p>` : ''}
    </section>`;
}

// Uma bateria pode ter mais de um diário (ex.: o mesmo teste em dois modelos)
function linkDiario(caminhos) {
    return `${t('p_diario')}: ` + [].concat(caminhos)
        .map(c => `<a href="${c}" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">${c}</a>`).join(' · ');
}

// Barra horizontal com o intervalo de confiança desenhado por cima (traço branco)
function barra(rotulo, k, n, cor) {
    const [lo, hi] = wilson(k, n);
    return `
    <div class="grid grid-cols-[7.5rem_1fr_3rem] sm:grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3">
        <div class="text-xs font-bold text-slate-300 truncate" title="${escapeHtml(rotulo)}">${escapeHtml(rotulo)}</div>
        <div class="relative h-5 bg-slate-950 rounded border border-slate-800" title="IC 95%: ${porcento(lo, 1)}% – ${porcento(hi, 1)}%">
            <div class="absolute inset-y-0 left-0 rounded-l" style="width:${100 * k / n}%; background:${cor}"></div>
            <div class="absolute top-1/2 h-px bg-white/80" style="left:${lo * 100}%; width:${(hi - lo) * 100}%"></div>
            <div class="absolute top-1 bottom-1 w-px bg-white/80" style="left:${lo * 100}%"></div>
            <div class="absolute top-1 bottom-1 w-px bg-white/80" style="left:calc(${hi * 100}% - 1px)"></div>
        </div>
        <div class="text-right leading-tight">
            <div class="text-xs font-black text-white tabular-nums">${porcento(k, n)}%</div>
            <div class="text-[9px] font-mono text-slate-500">${k}/${n}</div>
        </div>
    </div>`;
}

// Barra dividida pelos tipos de resultado (certo, confusão, cadeia cortada...)
function barraEmpilhada(rotulo, lista) {
    const feitos = rodados(lista);
    const partes = ['certo', 'hesitou', 'confusao', 'cortada'].map(s => [s, contar(feitos, s)]).filter(([, n]) => n);
    const certos = contar(feitos, 'certo', 'hesitou');
    return `
    <div class="grid grid-cols-[7.5rem_1fr_3rem] sm:grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3">
        <div class="text-xs font-bold text-slate-300 truncate">${escapeHtml(rotulo)}</div>
        <div class="flex h-5 rounded overflow-hidden border border-slate-800 bg-slate-950">
            ${partes.map(([s, n]) => `<div style="width:${100 * n / feitos.length}%; background:${COR_DO_RESULTADO[s]}" title="${nomeDoResultado(s)}: ${n}"></div>`).join('')}
        </div>
        <div class="text-right leading-tight">
            <div class="text-xs font-black text-white tabular-nums">${porcento(certos, feitos.length)}%</div>
            <div class="text-[9px] font-mono text-slate-500">${certos}/${feitos.length}</div>
        </div>
    </div>`;
}

function quadrado(status, titulo) {
    if (!status) return `<span class="inline-block w-3.5 h-3.5 rounded-sm border border-dashed border-slate-700" title="${escapeHtml(titulo)}: ${t('p_nao_rodou')}"></span>`;
    return `<span class="inline-block w-3.5 h-3.5 rounded-sm" style="background:${COR_DO_RESULTADO[status]}" title="${escapeHtml(titulo)}: ${nomeDoResultado(status)}"></span>`;
}

function legenda(status, extra = '') {
    return `<div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-4">
        ${status.map(s => `<span class="flex items-center gap-1.5">${quadrado(s, nomeDoResultado(s))} ${nomeDoResultado(s)}</span>`).join('')}
        ${extra}
    </div>`;
}

const legendaIc = () => `<span class="flex items-center gap-1.5"><span class="inline-block w-4 h-px bg-white/80"></span> ${t('p_ic')}</span>`;
const legendaNaoRodou = () => `<span class="flex items-center gap-1.5">${quadrado(null, '')} ${t('p_nao_rodou')}</span>`;
const tituloColuna = (texto, borda = false) => `<th class="text-[9px] font-black uppercase tracking-widest text-slate-500 pb-2 ${borda ? 'border-l border-slate-700' : ''}">${texto}</th>`;

// --- SEÇÕES ---
// Todas têm o prefixo "secao": os scripts dividem o mesmo espaço de nomes, e uma função com
// o nome de outra do gerador (ex.: pertoDePalavraReal, do palavras.js) a substituiria
function secaoResumo() {
    const todas = Object.values(BATERIAS).flatMap(b => Object.values(b.resultados).flatMap(rodados));
    const configs = new Set(Object.values(BATERIAS).flatMap(b => Object.keys(b.resultados)));
    const blocos = [
        [todas.length, t('p_respostas')],
        [configs.size, t('p_configs')],
        [Object.keys(BATERIAS).length, t('p_baterias')],
        ['1', t('p_janela')]
    ];
    return `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${blocos.map(([n, texto]) => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div class="text-2xl font-black text-white tabular-nums">${n}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">${texto}</div>
        </div>`).join('')}
    </div>`;
}

function secaoAchados() {
    const m = BATERIAS.morfologia;
    const logica = Object.values(m.resultados).flat();
    const v = BATERIAS.volume.resultados;
    const errosV = (c) => contar(rodados(v[c]), 'confusao', 'cortada');
    const achados = [
        t('p_achado1', { k: contar(logica, ...ACERTOU_LOGICA), n: logica.length, c: Object.keys(m.resultados).length }),
        t('p_achado2'),
        t('p_achado3', {
            cortada: `<span style="color:${COR_DO_RESULTADO.cortada}">${t('p_corta')}</span>`,
            confusao: `<span style="color:${COR_DO_RESULTADO.confusao}">${t('p_le_errado')}</span>`,
            eh: errosV('haiku-low'), nh: rodados(v['haiku-low']).length, es: errosV('sonnet-low')
        }),
        t('p_achado4')
    ];
    const nota = t('p_nota_idioma') ? `<p class="text-[11px] text-amber-300/80 mt-4">${t('p_nota_idioma')}</p>` : '';
    return cartao('lightbulb', t('p_sabemos'), t('p_sabemos_sub'),
        `<ul class="space-y-2 text-sm text-slate-300 leading-relaxed list-disc pl-5">${achados.map(a => `<li>${a}</li>`).join('')}</ul>${nota}`);
}

// Configurações da bateria de morfologia, da melhor para a pior
function ordemMorfologia() {
    const r = BATERIAS.morfologia.resultados;
    return Object.keys(r).sort((a, b) => contar(r[b], 'certo') - contar(r[a], 'certo'));
}

function secaoEscada() {
    const b = BATERIAS.morfologia;
    const barras = ordemMorfologia().map(c => barra(CONFIGURACOES[c].nome, contar(b.resultados[c], 'certo'), b.desafios.length, CONFIGURACOES[c].cor)).join('');
    return cartao('chart-column', t('p_escada'), t('p_escada_sub'),
        `<div class="space-y-2.5">${barras}</div>${legenda([], legendaIc())}`,
        `${t('p_escada_rodape')} ${linkDiario(b.diario)}`);
}

function secaoFlexoes() {
    const b = BATERIAS.morfologia;
    const linhas = ordemMorfologia().map(c => {
        const celulas = TIPOS_FLEXAO.map(tipo => {
            const idx = b.desafios.map((d, i) => d.tipo === tipo ? i : -1).filter(i => i >= 0);
            const k = idx.filter(i => b.resultados[c][i] === 'certo').length;
            const alfa = 0.12 + 0.88 * (k / idx.length);
            return `<td class="p-1"><div class="rounded-md py-2 text-center text-xs font-black tabular-nums ${k / idx.length > 0.5 ? 'text-slate-950' : 'text-white'}" style="background:rgba(16,185,129,${alfa.toFixed(2)})">${k}/${idx.length}</div></td>`;
        }).join('');
        return `<tr><td class="pr-3 py-1 text-xs font-bold text-slate-300 whitespace-nowrap">${CONFIGURACOES[c].nome}</td>${celulas}</tr>`;
    }).join('');
    return cartao('grid-3x3', t('p_flexoes'), t('p_flexoes_sub'),
        `<div class="overflow-x-auto custom-scrollbar"><table class="w-full min-w-[26rem]">
            <thead><tr><th></th>${TIPOS_FLEXAO.map(tipo => tituloColuna(t('flexao_' + tipo))).join('')}</tr></thead>
            <tbody>${linhas}</tbody>
        </table></div>`,
        t('p_flexoes_rodape'));
}

function secaoDesafios() {
    const b = BATERIAS.morfologia;
    const cabecalho = b.desafios.map(d => `<th class="px-1 pb-2 text-center"><div class="text-[10px] font-black text-slate-300">${d.id}</div><div class="text-[8px] uppercase tracking-wider text-slate-500 whitespace-nowrap">${t('flexao_' + d.tipo).split(' ')[0]}</div></th>`).join('');
    const linhas = ordemMorfologia().map(c => `
        <tr><td class="pr-3 py-1 text-xs font-bold text-slate-300 whitespace-nowrap">${CONFIGURACOES[c].nome}</td>
        ${b.resultados[c].map((s, i) => `<td class="px-1 py-1 text-center">${quadrado(s, `${CONFIGURACOES[c].nome} · ${b.desafios[i].id} (${b.desafios[i].gabarito})`)}</td>`).join('')}</tr>`).join('');
    return cartao('table-2', t('p_desafios'), t('p_desafios_sub'),
        `<div class="overflow-x-auto custom-scrollbar"><table class="min-w-[30rem]"><thead><tr><th></th>${cabecalho}</tr></thead><tbody>${linhas}</tbody></table></div>
        ${legenda(['certo', 'ambigua', 'flexao'])}`,
        t('p_desafios_rodape'));
}

function secaoVolumeSosias() {
    const b = BATERIAS.volume;
    const configs = Object.keys(b.resultados);
    const grupos = ['A', 'B'].flatMap(eixo => [20, 100, 300].map(regras => ({ eixo, regras })));
    const matriz = configs.map(c => `
        <tr><td class="pr-3 py-1.5 text-xs font-bold text-slate-300 whitespace-nowrap">${CONFIGURACOES[c].nome}</td>
        ${grupos.map((g, gi) => {
            const idx = b.desafios.map((d, i) => d.eixo === g.eixo && d.regras === g.regras ? i : -1).filter(i => i >= 0);
            return `<td class="px-2 py-1.5 ${gi === 3 ? 'border-l border-slate-700' : ''}"><div class="flex gap-1 justify-center">${idx.map(i => quadrado(b.resultados[c][i], `${CONFIGURACOES[c].nome} · ${b.desafios[i].id}`)).join('')}</div></td>`;
        }).join('')}</tr>`).join('');
    const cabecalho = `
        <tr><th></th><th colspan="3" class="text-[9px] font-black uppercase tracking-widest text-slate-500 pb-1">${t('p_volume_a')}</th>
            <th colspan="3" class="text-[9px] font-black uppercase tracking-widest text-slate-500 pb-1 border-l border-slate-700">${t('p_volume_b')}</th></tr>
        <tr><th></th>${grupos.map((g, gi) => `<th class="text-[10px] font-mono text-slate-400 pb-2 ${gi === 3 ? 'border-l border-slate-700' : ''}">${t('p_regras', { n: g.regras })}</th>`).join('')}</tr>`;
    const barras = configs.map(c => barraEmpilhada(CONFIGURACOES[c].nome, b.resultados[c])).join('');
    return cartao('layers', t('p_volume'), t('p_volume_sub'),
        `<div class="overflow-x-auto custom-scrollbar"><table class="w-full min-w-[30rem]"><thead>${cabecalho}</thead><tbody>${matriz}</tbody></table></div>
        <div class="space-y-2.5 mt-6">${barras}</div>
        ${legenda(['certo', 'hesitou', 'confusao', 'cortada'], legendaNaoRodou())}`,
        `${t('p_volume_rodape')} ${linkDiario(b.diario)}`);
}

function secaoContaminacao() {
    const b = BATERIAS.contaminacao;
    const configs = Object.keys(b.resultados);
    const eixo = (c, e) => b.resultados[c].filter((s, i) => b.desafios[i].eixo === e);
    const barrasCD = configs.map(c => ['C', 'D'].map(e => {
        const l = eixo(c, e);
        return barra(`${CONFIGURACOES[c].nome} · ${e}`, contar(l, 'certo', 'hesitou'), l.length, CONFIGURACOES[c].cor);
    }).join('')).join('<div class="h-2"></div>');
    const barrasPares = Object.entries(b.pares).map(([c, p]) => [
        barra(`${CONFIGURACOES[c].nome} · ${t('p_perto')}`, p.perto.confusoes, p.perto.pares, COR_DO_RESULTADO.confusao),
        barra(`${CONFIGURACOES[c].nome} · ${t('p_limpos')}`, p.limpos.confusoes, p.limpos.pares, '#fda4af')
    ].join('')).join('<div class="h-2"></div>');
    const matriz = configs.map(c => `
        <tr><td class="pr-3 py-1.5 text-xs font-bold text-slate-300 whitespace-nowrap">${CONFIGURACOES[c].nome}</td>
        ${['C', 'D'].map((e, ei) => `<td class="px-2 py-1.5 ${ei ? 'border-l border-slate-700' : ''}"><div class="flex gap-1">${b.desafios.map((d, i) => d.eixo === e ? quadrado(b.resultados[c][i], `${CONFIGURACOES[c].nome} · ${d.id}`) : '').join('')}</div></td>`).join('')}</tr>`).join('');
    return cartao('flask-conical', t('p_contaminacao'), t('p_contaminacao_sub'),
        `<div class="overflow-x-auto custom-scrollbar"><table class="min-w-[24rem]"><thead><tr><th></th>
            ${tituloColuna(t('p_eixo_c'))}${tituloColuna(t('p_eixo_d'), true)}</tr></thead>
            <tbody>${matriz}</tbody></table></div>
        <div class="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-6 mb-2">${t('p_logica_certa')}</div>
        <div class="space-y-2">${barrasCD}</div>
        <div class="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-6 mb-2">${t('p_taxa_confusao')}</div>
        <div class="space-y-2">${barrasPares}</div>
        ${legenda(['certo', 'hesitou', 'confusao', 'cortada'], legendaIc())}`,
        `${t('p_contaminacao_rodape')} ${linkDiario(b.diario)}`);
}

function secaoPertoDoPortugues() {
    const barras = PERTO_DO_PORTUGUES.map(p => barra(t('classe_' + p.classe), Math.round(p.pct * 10), 1000, '#94a3b8')).join('');
    return cartao('book-open', t('p_perto_titulo'), t('p_perto_sub'),
        `<div class="space-y-2.5">${barras}</div>
        <ul class="text-[10px] text-slate-500 mt-4 space-y-0.5">${PERTO_DO_PORTUGUES.map(p => `<li><b class="text-slate-400">${t('classe_' + p.classe)}:</b> ${escapeHtml(p.exemplos)}</li>`).join('')}</ul>`,
        `${t('p_perto_rodape')} ${linkDiario('testes/haiku-5.5-contaminacao.md')}`);
}

function renderPesquisa() {
    $('aba-pesquisa').innerHTML = `
        <div>
            <h2 class="text-xl font-black text-white uppercase tracking-tight">${t('p_titulo')}</h2>
            <p class="text-sm text-slate-400 mt-1">${t('p_intro')}</p>
        </div>
        ${secaoResumo()}
        ${secaoAchados()}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            ${secaoEscada()}
            ${secaoFlexoes()}
        </div>
        ${secaoDesafios()}
        ${secaoVolumeSosias()}
        ${secaoContaminacao()}
        ${secaoPertoDoPortugues()}
        <p class="text-[10px] text-slate-600 leading-relaxed">${t('p_metodo')}</p>`;
    refreshIcons();
}
