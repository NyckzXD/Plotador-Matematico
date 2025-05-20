const canvas = document.getElementById('meuGrafico');
const ctx = canvas.getContext('2d');
const inputFuncao = document.getElementById('funcao');
const inputXMin = document.getElementById('xMin');
const inputXMax = document.getElementById('xMax');
const inputYMin = document.getElementById('yMin');
const inputYMax = document.getElementById('yMax');
const botaoDesenhar = document.getElementById('desenharGrafico');
const mensagemErro = document.getElementById('mensagem');
const tipoFuncaoSelect = document.getElementById('tipoFuncao');

let grafico;

// Agora usa math.js e não a gambiarra de antes
function compilarFuncao(funcaoStr) {
    try {
        return math.compile(funcaoStr);
    } catch (err) {
        mensagemErro.textContent = 'Erro ao compilar a função: ' + err.message;
        return null;
    }
}

// Avalia a função
function avaliarFuncao(compilada, x) {
    try {
        const y = compilada.evaluate({ x });
        return isFinite(y) ? y : NaN;
    } catch {
        return NaN;
    }
}

function desenharGrafico() {
    const xMin = parseFloat(inputXMin.value);
    const xMax = parseFloat(inputXMax.value);
    const yMin = parseFloat(inputYMin.value);
    const yMax = parseFloat(inputYMax.value);
    const funcaoStr = inputFuncao.value.trim();

    mensagemErro.textContent = '';

    if ([xMin, xMax, yMin, yMax].some(isNaN)) {
        mensagemErro.textContent = 'Insira valores numéricos válidos para os limites.';
        return;
    }

    if (xMin >= xMax || yMin >= yMax) {
        mensagemErro.textContent = 'xMin deve ser menor que xMax e yMin menor que yMax.';
        return;
    }

    const funcaoCompilada = compilarFuncao(funcaoStr);
    if (!funcaoCompilada) return;

    const numPontos = 500;
    const passo = (xMax - xMin) / numPontos;
    const pontos = [];

    for (let i = 0; i <= numPontos; i++) {
        const x = xMin + i * passo;
        const y = avaliarFuncao(funcaoCompilada, x);
        if (!isNaN(y)) {
            pontos.push({ x, y });
        }
    }

    if (!pontos.length) {
        mensagemErro.textContent = 'Nenhum ponto válido para plotar. Verifique a função.';
        if (grafico) grafico.destroy();
        return;
    }

    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'y = ' + funcaoStr,
                data: pontos,
                borderColor: 'lightgreen',
                fill: false,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: true,
            scales: {
                x: {
                    type: 'linear',
                    min: xMin,
                    max: xMax,
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    type: 'linear',
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            },
            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: {
                        linhaHorizontal: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderWidth: 1
                        },
                        linhaVertical: {
                            type: 'line',
                            xMin: 0,
                            xMax: 0,
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderWidth: 1
                        }
                    }
                }
            }
        }
    });
}

tipoFuncaoSelect.addEventListener('change', () => {
    const tipo = tipoFuncaoSelect.value;
    const exemplos = {
        'logaritmica': { func: 'log10(x)', xMin: 0.1, xMax: 10, yMin: -1, yMax: 2 },
        'exponencial': { func: 'exp(x)', xMin: -2, xMax: 5, yMin: -1, yMax: 150 },
        'polinomial': { func: 'x^2', xMin: -10, xMax: 10, yMin: -10, yMax: 100 },
        'linear': { func: 'x', xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
    };

    const ex = exemplos[tipo] || exemplos['linear'];
    inputFuncao.value = ex.func;
    inputXMin.value = ex.xMin;
    inputXMax.value = ex.xMax;
    inputYMin.value = ex.yMin;
    inputYMax.value = ex.yMax;

    desenharGrafico();
});

if (!inputFuncao.value) {
    inputFuncao.value = 'x';
    inputXMin.value = '-10';
    inputXMax.value = '10';
    inputYMin.value = '-10';
    inputYMax.value = '10';
}

botaoDesenhar.addEventListener('click', desenharGrafico);

desenharGrafico();
