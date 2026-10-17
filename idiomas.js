// LOGIGEN - IDIOMAS
// Textos da interface em português e inglês, nomes dos níveis e a notação do esqueleto na tela.
// O esqueleto em niveis.js continua escrito uma vez só (em português): a lógica não muda de
// idioma, só a frase que o desafio vira (logica.js) e o que a tela mostra (aqui).

let IDIOMA = 'pt';

// Bandeiras em SVG: o Windows não desenha emoji de bandeira
const LISTRA_EUA = 20 / 13;
const IDIOMAS = {
    pt: {
        nome: 'Português',
        bandeira: `<svg viewBox="0 0 28 20" class="w-7 h-5 rounded-[3px]" aria-hidden="true">
            <rect width="28" height="20" fill="#009c3b"/>
            <path d="M14 2.4 25.6 10 14 17.6 2.4 10z" fill="#ffdf00"/>
            <circle cx="14" cy="10" r="4.6" fill="#002776"/>
            <path d="M9.5 9.1c3-.7 6.3.1 8.9 2" stroke="#fff" stroke-width=".9" fill="none"/>
        </svg>`
    },
    en: {
        nome: 'English',
        bandeira: `<svg viewBox="0 0 28 20" class="w-7 h-5 rounded-[3px]" aria-hidden="true">
            <rect width="28" height="20" fill="#fff"/>
            ${[0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${(i * LISTRA_EUA).toFixed(2)}" width="28" height="${LISTRA_EUA.toFixed(2)}" fill="#b22234"/>`).join('')}
            <rect width="11.2" height="${(7 * LISTRA_EUA).toFixed(2)}" fill="#3c3b6e"/>
            ${[[2, 2], [5.6, 2], [9.2, 2], [3.8, 4.4], [7.4, 4.4], [2, 6.8], [5.6, 6.8], [9.2, 6.8], [3.8, 9.2], [7.4, 9.2]]
                .filter(([, y]) => y < 10.5).map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".75" fill="#fff"/>`).join('')}
        </svg>`
    }
};

const TEXTOS = {
    pt: {
        titulo_pagina: 'LogiGen | Gerador de Lógica',
        slogan: 'Lógica em português com palavras que nenhuma IA viu',
        aba_gerador: 'Gerador', aba_pesquisa: 'Pesquisa', aba_benchmarks: 'Benchmarks', em_breve: 'em breve',
        benchmarks_title: 'Benchmarks: em breve, quando as bases dos níveis estiverem prontas',
        gerar_titulo: '1. Gerar', nivel: 'Nível', esqueleto: 'Esqueleto', desafios_rotulo: 'Desafios', semente: 'Semente',
        nova_semente: 'Sortear outra semente', botao_gerar: 'Gerar desafios',
        nota_semente: 'A mesma semente gera sempre os mesmos desafios. Use-a para testar várias IAs com a mesma prova.',
        testar_titulo: '2. Testar', copiar_prompt: 'Copiar prompt para a IA', resposta_ia: 'Resposta da IA',
        resposta_placeholder: 'Cole aqui a resposta completa da IA...', corrigir: 'Corrigir',
        desafios_titulo: 'Desafios', gabarito_toggle: 'Gabarito e esqueleto',
        nivel_opcao: 'Nível {n} — {nome}', passos_ate: 'Passos até a resposta: {n}.', armadilhas_n: 'Armadilhas: {n}.',
        lote_info: 'nível {nivel} · {qtd} desafios · semente {semente}',
        desafio_n: 'Desafio {n}', copiar: 'Copiar', copiado: 'Copiado!', copiar_um: 'Copiar só este desafio para mandar manualmente',
        prova: 'Prova', armadilha: '⚠ Armadilha', lida_ao_contrario: 'lida ao contrário', armadilha_title: 'Armadilha da recíproca',
        gabarito: 'Gabarito', ia: 'IA', nao_respondeu: '(não respondeu)', passo: 'passo', passos: 'passos',
        selo_certo: '✔ Acertou', selo_ambigua: '≈ Flexão ambígua', selo_flexao: '⚠ Flexão errada',
        selo_armadilha: '🪤 Caiu na armadilha', selo_errado: '✘ Errou', 'selo_sem-resposta': 'Sem resposta',
        totalmente_certos: '{pct}% totalmente certos', logica: 'Lógica', morfologia: 'Morfologia',
        palavra_certa: 'palavra certa', forma_certa: 'forma certa',
        det_ambigua: 'flexão ambígua (deu mais de uma forma)', det_flexao: 'flexão errada (lógica certa)',
        det_armadilha: 'caíram na armadilha da recíproca', det_errado: 'errados', 'det_sem-resposta': 'sem resposta reconhecida (use "1: resposta")',
        cole_primeiro: 'Cole a resposta da IA primeiro.',
        erro_palavra: 'Não consegui gerar uma palavra inédita. Tente menos desafios por lote.',
        erro_dicionario: 'Não consegui carregar o dicionário de inglês: as palavras não serão conferidas.',
        classe_nome: 'nome', classe_substantivo: 'substantivo', classe_adjetivo: 'adjetivo', classe_verbo: 'verbo',

        p_titulo: 'Pesquisa',
        p_intro: 'O que as baterias de teste com IAs mostraram até agora. Os métodos, as respostas e as conclusões completas estão nos diários em <code class="text-slate-300">testes/</code>.',
        p_respostas: 'respostas corrigidas', p_configs: 'configurações testadas', p_baterias: 'baterias com gráfico', p_janela: 'janela por desafio, sem gabarito',
        p_sabemos: 'O que já sabemos', p_sabemos_sub: 'Resumo das baterias até aqui. Cada gráfico abaixo é recalculado a partir das respostas, desafio a desafio.',
        p_achado1: '<b>A lógica dos níveis 1 a 3 saturou:</b> {k} de {n} respostas com a palavra certa, nas {c} configurações. Quem separa os modelos é a morfologia.',
        p_achado2: '<b>A concordância de gênero com o personagem é o item mais difícil:</b> a forma da regra costuma ser copiada sem concordar.',
        p_achado3: '<b>A lógica do Haiku low quebra de dois jeitos:</b> com 100 regras ou mais ele {cortada}, e com palavras sósias ele {confusao} ({eh} erros em {nh}). O Sonnet low só errou com sósias em 300 regras ({es}), e o Sonnet max não errou nenhuma.',
        p_corta: 'corta a cadeia no meio', p_le_errado: 'lê uma pela outra',
        p_achado4: '<b>Sósias perto do português confundem um pouco mais</b>, mas a diferença ainda não é conclusiva. Por isso o gerador agora descarta toda palavra a uma letra de uma palavra real.',
        p_nota_idioma: '',
        p_escada: 'Escada da morfologia',
        p_escada_sub: 'Em quantos dos 10 desafios cada configuração escreveu exatamente a forma pedida (feminino, plural, gerúndio). Na lógica, todas acertaram 100%.',
        p_escada_rodape: 'Com 10 desafios por configuração, o intervalo de confiança é largo: só as pontas da escada se separam com segurança.',
        p_ic: 'intervalo de confiança de 95%', p_diario: 'Diário',
        p_flexoes: 'Morfologia por tipo de flexão', p_flexoes_sub: 'Quantas formas certas em cada tipo de flexão. Quanto mais verde, mais acertos.',
        p_flexoes_rodape: 'O gerúndio separou bem os modelos menores. O gênero só caiu por inteiro para o Opus max.',
        p_desafios: 'Desafio a desafio', p_desafios_sub: 'Cada quadrado é uma resposta. Passe o mouse para ver o gabarito.',
        p_desafios_rodape: 'O B1 (gênero, nível 1, sem armadilha) foi o item mais difícil: só o Opus max acertou sem hesitar.',
        p_volume: 'Onde a lógica quebra: volume e sósias',
        p_volume_sub: 'Cadeia de 3 passos escondida entre 20, 100 ou 300 regras. No eixo B, o mesmo texto ganha 4 iscas sósias, a uma vogal de diferença das palavras da cadeia ("Bromar" × "Bramar").',
        p_volume_a: 'A · volume puro', p_volume_b: 'B · com sósias', p_regras: '{n} regras',
        p_volume_rodape: 'O Haiku low corta a cadeia com volume e confunde sósias. O Sonnet low só confundiu sósias com 300 regras, e o Sonnet max acertou tudo. O max rodou só os desafios de 300 regras.',
        p_contaminacao: 'Contaminação: sósias perto do português',
        p_contaminacao_sub: 'Os mesmos 10 textos em dois eixos: no C, as sósias ficam longe de qualquer palavra real; no D, ficam a uma letra de uma (Jelhice → velhice, sapacho → capacho).',
        p_eixo_c: 'C · sósias limpas', p_eixo_d: 'D · perto do português', p_logica_certa: 'Lógica certa',
        p_taxa_confusao: 'Taxa de confusão por par de sósias (baterias 6 e 7 somadas)', p_perto: 'perto', p_limpos: 'limpos',
        p_contaminacao_rodape: 'No Haiku low, os pares perto do português confundiram mais (4 em 45) que os limpos (2 em 100), mas os intervalos se sobrepõem. O Sonnet low quase não confundiu.',
        p_perto_titulo: 'Palavras inventadas perto do português (antes do filtro)',
        p_perto_sub: 'Quantas palavras do gerador antigo viravam uma palavra real tirando, pondo ou trocando uma letra. Hoje são 0%: o gerador confere cada forma num dicionário de 243 mil palavras.',
        p_perto_rodape: 'Os nomes próprios eram os mais afetados, porque são curtos.',
        p_metodo: 'Intervalos de confiança de 95% pelo método de Wilson. Cada configuração respondeu cada desafio uma única vez, numa janela nova, sem acesso ao gabarito.',
        p_nao_rodou: 'não rodou',
        status_certo: 'certo', status_hesitou: 'certo, mas hesitou', status_ambigua: 'flexão ambígua', status_flexao: 'flexão errada',
        status_confusao: 'confusão com sósia', status_cortada: 'cadeia cortada',
        flexao_gerundio: 'Gerúndio', 'flexao_verbo-plural': 'Verbo plural', flexao_genero: 'Gênero', 'flexao_adj-plural': 'Adjetivo plural',

        reais_toggle: 'Palavras reais',
        reais_title: 'Mostra o mesmo desafio com palavras de verdade, só para conferir se faz sentido. O prompt copiado continua com as palavras inventadas.',
        reais_aviso: '<b>Palavras reais</b>, só para conferir: cada palavra inventada virou uma de verdade, da mesma classe e na mesma forma. As frases podem ficar absurdas ("Toda baleia voa."), mas a lógica vale do mesmo jeito. O prompt copiado continua com as palavras inventadas.',
        v_reais: 'Jogar com palavras reais',
        v_reais_dica: 'Você vê palavras de verdade; a IA continua com as inventadas. O sentido pode ajudar, ou atrapalhar quando a frase é absurda.',
        v_reais_nota: 'Você jogou com palavras reais; a IA, com as inventadas.',

        aba_versus: 'Humano × IA',
        v_titulo: 'Humano × IA',
        v_intro: 'Resolva os mesmos desafios que a IA, na sua língua. A IA recebe exatamente a mesma lógica no idioma dela. As duas respostas passam pelo mesmo corretor, e o placar mostra quem ganhou.',
        v_seu_idioma: 'Seu idioma', v_idioma_ia: 'Idioma da IA', v_comecar: 'Começar', v_novo: 'Novo jogo',
        v_justo: 'As palavras são inventadas para você também: ninguém leva vantagem de memória. Os desafios aparecem sem cores e sem esqueleto, do jeito que a IA vê.',
        v_antes: 'Escolha as opções e clique em Começar. O relógio dispara na hora.',
        v_seus_desafios: 'Seus desafios', v_sua_resposta: 'Sua resposta', v_terminar: 'Terminar e corrigir', v_tempo: 'Tempo',
        v_em_branco: '(em branco)', v_gabarito_ia: 'na versão da IA',
        v_ia_titulo: 'A IA', v_ia_passos: 'Copie o prompt, cole na IA que quiser testar e traga a resposta dela de volta.',
        v_copiar_ia: 'Copiar prompt para a IA ({idioma})', v_resposta_ia: 'Resposta da IA', v_corrigir_ia: 'Corrigir a IA',
        v_ia_sem_jogo: 'Comece um jogo para gerar o prompt da IA.',
        v_ia_corrigida: 'IA corrigida. O resultado aparece no placar quando você terminar.',
        v_placar: 'Placar', v_voce: 'Você', v_ia: 'IA',
        v_falta_voce: 'Termine seus desafios para ver o placar.', v_falta_ia: 'Corrija a resposta da IA para ver quem ganhou.',
        v_venceu_voce: '🏆 Você venceu!', v_venceu_ia: '🤖 A IA venceu!', v_empate: '🤝 Empate!',
        v_criterio: 'Vence quem acerta mais a lógica (a palavra certa). No empate, a morfologia (a forma certa) desempata.',
        v_idiomas_diferentes: 'Os idiomas são diferentes: a lógica é idêntica, mas a morfologia não (em inglês o adjetivo não flexiona).',
        v_certos: 'totalmente certos', v_desafio: 'Desafio', v_gabarito: 'Gabarito'
    },
    en: {
        titulo_pagina: 'LogiGen | Logic Generator',
        slogan: 'Logic in English with words no AI has ever seen',
        aba_gerador: 'Generator', aba_pesquisa: 'Research', aba_benchmarks: 'Benchmarks', em_breve: 'coming soon',
        benchmarks_title: 'Benchmarks: coming soon, once the foundations of the levels are ready',
        gerar_titulo: '1. Generate', nivel: 'Level', esqueleto: 'Skeleton', desafios_rotulo: 'Challenges', semente: 'Seed',
        nova_semente: 'Draw another seed', botao_gerar: 'Generate challenges',
        nota_semente: 'The same seed always generates the same challenges. Use it to test several AIs on the same exam.',
        testar_titulo: '2. Test', copiar_prompt: 'Copy prompt for the AI', resposta_ia: "AI's answer",
        resposta_placeholder: "Paste the AI's full answer here...", corrigir: 'Grade',
        desafios_titulo: 'Challenges', gabarito_toggle: 'Answer key and skeleton',
        nivel_opcao: 'Level {n} — {nome}', passos_ate: 'Steps to the answer: {n}.', armadilhas_n: 'Traps: {n}.',
        lote_info: 'level {nivel} · {qtd} challenges · seed {semente}',
        desafio_n: 'Challenge {n}', copiar: 'Copy', copiado: 'Copied!', copiar_um: 'Copy just this challenge to send it manually',
        prova: 'Proof', armadilha: '⚠ Trap', lida_ao_contrario: 'read backwards', armadilha_title: 'Converse trap',
        gabarito: 'Answer', ia: 'AI', nao_respondeu: '(no answer)', passo: 'step', passos: 'steps',
        selo_certo: '✔ Correct', selo_ambigua: '≈ Ambiguous form', selo_flexao: '⚠ Wrong form',
        selo_armadilha: '🪤 Fell for the trap', selo_errado: '✘ Wrong', 'selo_sem-resposta': 'No answer',
        totalmente_certos: '{pct}% fully correct', logica: 'Logic', morfologia: 'Morphology',
        palavra_certa: 'right word', forma_certa: 'right form',
        det_ambigua: 'ambiguous form (gave more than one)', det_flexao: 'wrong form (right logic)',
        det_armadilha: 'fell for the converse trap', det_errado: 'wrong', 'det_sem-resposta': 'no answer recognized (use "1: answer")',
        cole_primeiro: "Paste the AI's answer first.",
        erro_palavra: 'Could not generate a new word. Try fewer challenges per batch.',
        erro_dicionario: 'Could not load the English dictionary: words will not be checked.',
        classe_nome: 'name', classe_substantivo: 'noun', classe_adjetivo: 'adjective', classe_verbo: 'verb',

        p_titulo: 'Research',
        p_intro: 'What the test batteries with AIs have shown so far. Methods, answers and full conclusions are in the logs under <code class="text-slate-300">testes/</code> (in Portuguese).',
        p_respostas: 'graded answers', p_configs: 'configurations tested', p_baterias: 'batteries charted', p_janela: 'window per challenge, no answer key',
        p_sabemos: 'What we know so far', p_sabemos_sub: 'Summary of the batteries so far. Every chart below is recomputed from the answers, challenge by challenge.',
        p_achado1: '<b>The logic of levels 1 to 3 is saturated:</b> {k} of {n} answers with the right word, across all {c} configurations. Morphology is what separates the models.',
        p_achado2: '<b>Gender agreement with the character is the hardest item:</b> models tend to copy the form written in the rule instead of agreeing.',
        p_achado3: "<b>Haiku low's logic breaks in two ways:</b> with 100 rules or more it {cortada}, and with look-alike words it {confusao} ({eh} errors in {nh}). Sonnet low only failed with look-alikes at 300 rules ({es}), and Sonnet max made no mistakes.",
        p_corta: 'cuts the chain short', p_le_errado: 'reads one word as the other',
        p_achado4: '<b>Look-alikes close to real Portuguese words confuse a bit more</b>, but the difference is not conclusive yet. That is why the generator now discards any word one letter away from a real word.',
        p_nota_idioma: 'All batteries so far were run in Portuguese.',
        p_escada: 'Morphology ladder',
        p_escada_sub: 'In how many of the 10 challenges each configuration wrote exactly the requested form (feminine, plural, gerund). On logic, all of them scored 100%.',
        p_escada_rodape: 'With 10 challenges per configuration the confidence interval is wide: only the ends of the ladder are clearly apart.',
        p_ic: '95% confidence interval', p_diario: 'Log',
        p_flexoes: 'Morphology by type of inflection', p_flexoes_sub: 'Right forms for each type of inflection. The greener, the more correct answers.',
        p_flexoes_rodape: 'The gerund separated the smaller models well. Gender only fell entirely for Opus max.',
        p_desafios: 'Challenge by challenge', p_desafios_sub: 'Each square is one answer. Hover to see the expected answer.',
        p_desafios_rodape: 'B1 (gender, level 1, no trap) was the hardest item: only Opus max got it without hesitating.',
        p_volume: 'Where logic breaks: volume and look-alikes',
        p_volume_sub: 'A 3-step chain hidden among 20, 100 or 300 rules. On axis B the same text gets 4 look-alike decoys, one vowel away from the chain words ("Bromar" × "Bramar").',
        p_volume_a: 'A · volume only', p_volume_b: 'B · with look-alikes', p_regras: '{n} rules',
        p_volume_rodape: 'Haiku low cuts the chain with volume and confuses look-alikes. Sonnet low only confused look-alikes at 300 rules, and Sonnet max got everything right. Max only ran the 300-rule challenges.',
        p_contaminacao: 'Contamination: look-alikes close to Portuguese',
        p_contaminacao_sub: 'The same 10 texts on two axes: on C the look-alikes are far from any real word; on D they are one letter away from one (Jelhice → velhice, sapacho → capacho).',
        p_eixo_c: 'C · clean look-alikes', p_eixo_d: 'D · close to Portuguese', p_logica_certa: 'Right logic',
        p_taxa_confusao: 'Confusion rate per look-alike pair (batteries 6 and 7 combined)', p_perto: 'close', p_limpos: 'clean',
        p_contaminacao_rodape: 'For Haiku low, pairs close to Portuguese caused more confusion (4 in 45) than clean ones (2 in 100), but the intervals overlap. Sonnet low barely got confused.',
        p_perto_titulo: 'Invented words close to Portuguese (before the filter)',
        p_perto_sub: 'How many words from the old generator became a real word by removing, adding or changing one letter. Now it is 0%: the generator checks every form against a dictionary.',
        p_perto_rodape: 'Proper names were the most affected, because they are short.',
        p_metodo: '95% confidence intervals by the Wilson method. Each configuration answered each challenge once, in a fresh window, with no access to the answer key.',
        p_nao_rodou: 'not run',
        status_certo: 'correct', status_hesitou: 'correct, but hesitated', status_ambigua: 'ambiguous form', status_flexao: 'wrong form',
        status_confusao: 'look-alike confusion', status_cortada: 'chain cut short',
        flexao_gerundio: 'Gerund', 'flexao_verbo-plural': 'Verb plural', flexao_genero: 'Gender', 'flexao_adj-plural': 'Adjective plural',

        reais_toggle: 'Real words',
        reais_title: 'Shows the same challenge with real words, just to check that it makes sense. The copied prompt still uses the invented words.',
        reais_aviso: '<b>Real words</b>, just for checking: each invented word became a real one, of the same class and in the same form. Sentences may sound absurd ("Every whale flies."), but the logic holds all the same. The copied prompt still uses the invented words.',
        v_reais: 'Play with real words',
        v_reais_dica: 'You see real words; the AI still gets the invented ones. Meaning may help, or get in the way when a sentence is absurd.',
        v_reais_nota: 'You played with real words; the AI, with invented ones.',

        aba_versus: 'Human × AI',
        v_titulo: 'Human × AI',
        v_intro: 'Solve the same challenges as the AI, in your own language. The AI gets exactly the same logic in its language. Both answers go through the same grader, and the scoreboard shows who won.',
        v_seu_idioma: 'Your language', v_idioma_ia: "AI's language", v_comecar: 'Start', v_novo: 'New game',
        v_justo: 'The words are invented for you too: nobody gets a memory advantage. Challenges appear without colors or skeleton, just as the AI sees them.',
        v_antes: 'Pick the options and click Start. The clock starts right away.',
        v_seus_desafios: 'Your challenges', v_sua_resposta: 'Your answer', v_terminar: 'Finish and grade', v_tempo: 'Time',
        v_em_branco: '(blank)', v_gabarito_ia: "in the AI's version",
        v_ia_titulo: 'The AI', v_ia_passos: 'Copy the prompt, paste it into the AI you want to test and bring its answer back.',
        v_copiar_ia: 'Copy prompt for the AI ({idioma})', v_resposta_ia: "AI's answer", v_corrigir_ia: 'Grade the AI',
        v_ia_sem_jogo: "Start a game to generate the AI's prompt.",
        v_ia_corrigida: 'AI graded. The result shows up on the scoreboard when you finish.',
        v_placar: 'Scoreboard', v_voce: 'You', v_ia: 'AI',
        v_falta_voce: 'Finish your challenges to see the scoreboard.', v_falta_ia: "Grade the AI's answer to see who won.",
        v_venceu_voce: '🏆 You won!', v_venceu_ia: '🤖 The AI won!', v_empate: '🤝 It\'s a tie!',
        v_criterio: 'Whoever gets more logic right (the right word) wins. On a tie, morphology (the right form) breaks it.',
        v_idiomas_diferentes: 'The languages differ: the logic is identical, but the morphology is not (English adjectives do not inflect).',
        v_certos: 'fully correct', v_desafio: 'Challenge', v_gabarito: 'Answer'
    }
};

// Texto no idioma atual; {chave} é trocado pelo valor correspondente em vars
function t(chave, vars) {
    const s = TEXTOS[IDIOMA][chave] ?? TEXTOS.pt[chave] ?? chave;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s;
}

// --- NÍVEIS NA TELA ---
const NIVEIS_EN = {
    1: { nome: 'Direct deduction', descricao: 'Two rules and one fact. The fact links the character to one of the rules, which gives the answer in one step; the other rule is a distractor. The blank has no options and the answer must take the right form.' },
    2: { nome: 'Two-step chain', descricao: 'Two chained rules lead to the answer; an identical chain is the distractor. The middle link changes with the variant: a group, a verb or an adjective.' },
    3: { nome: 'Converse trap', descricao: 'A two-step chain with a rule that fools whoever reads it backwards: "every trovel is a jafleck" does not mean every jafleck is a trovel. The trap moves around depending on the variant.' }
};
// Em inglês o adjetivo não tem gênero: a variante "gênero" vira o adjetivo no singular
const VARIANTES_EN = {
    'adjetivo · gênero': 'adjective · singular',
    'adjetivo · plural': 'adjective · plural',
    'verbo · gerúndio': 'verb · gerund (-ing)',
    'verbo · plural': 'verb · plural'
};
const COMENTARIOS_EN = {
    'leva à resposta': 'leads to the answer',
    'distração': 'distractor',
    'passo 1': 'step 1',
    'passo 2': 'step 2',
    'passo 1 (elo: grupo)': 'step 1 (link: group)',
    'passo 1 (elo: verbo)': 'step 1 (link: verb)',
    'passo 1 (elo: adjetivo)': 'step 1 (link: adjective)',
    'o que a armadilha daria': 'what the trap would give',
    'armadilha: ao contrário, X1 viraria G3': 'trap: read backwards, X1 would become G3',
    'armadilha: eles fazem V1, mas isso não os torna G2': 'trap: they do V1, but that does not make them G2',
    'armadilha: X1 é A1, mas isso não o torna G2': 'trap: X1 is A1, but that does not make it G2',
    'armadilha: ao contrário, eles virariam G3': 'trap: read backwards, they would become G3'
};

const nomeDoNivel = (n) => IDIOMA === 'en' ? NIVEIS_EN[n]?.nome ?? NIVEIS[n].nome : NIVEIS[n].nome;
const descricaoDoNivel = (n) => IDIOMA === 'en' ? NIVEIS_EN[n]?.descricao ?? NIVEIS[n].descricao : NIVEIS[n].descricao;
const nomeDaVariante = (v) => IDIOMA === 'en' ? VARIANTES_EN[v] ?? v : v;
const comentarioNoIdioma = (c) => IDIOMA === 'en' ? COMENTARIOS_EN[c.trim()] ?? c.trim() : c.trim();

// A notação do esqueleto na tela: "todo G1 é A1" vira "every G1 is A1" em inglês
function esqueletoNoIdioma(texto) {
    if (IDIOMA !== 'en') return texto;
    return texto
        .replace(/^pergunta:/, 'question:').replace(/^resposta:/, 'answer:')
        .replace(/\btodo\b/g, 'every')
        .replace(/ está ___/g, ' is ___ing').replace(/ estão ___/g, ' are ___ing')
        .replace(/ é /g, ' is ').replace(/ são /g, ' are ')
        .replace(/ e (?=X\d)/g, ' and ');
}
