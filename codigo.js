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

function preProcessarFuncao(funcaoStr) {
    const replacements = [
        { regex: /\blog10\(/g, replacement: 'log10(' },
        { regex: /\be\^/g, replacement: 'exp(' },
        { regex: /\bpi\b/gi, replacement: 'PI' },
        { regex: /\bsin\(/g, replacement: 'sin(' },
        { regex: /\bcos\(/g, replacement: 'cos(' },
        { regex: /\btan\(/g, replacement: 'tan(' },
        { regex: /\^/g, replacement: '**' },
        // Adicionar mais tipos de funcao
    ];

    let resultado = funcaoStr;
    for (const rep of replacements) {
        resultado = resultado.replace(rep.regex, rep.replacement);
    }
    return resultado;
}

function avaliarFuncao(x, funcaoStr) {
    try {
        const funcaoPreparada = preProcessarFuncao(funcaoStr);
        const func = new Function('x', 'return ' + funcaoPreparada + ';');
        const y = func(x);
        if (!isFinite(y)) return NaN;
        return y;
    } catch (erro) {
        mensagemErro.textContent = "Erro ao avaliar a função: " + erro.message;
        return NaN;
    }
}

function desenharGrafico() {
    const xMin = parseFloat(inputXMin.value);
    const xMax = parseFloat(inputXMax.value);
    const yMin = parseFloat(inputYMin.value);
    const yMax = parseFloat(inputYMax.value);
    const funcaoStr = inputFuncao.value;

    mensagemErro.textContent = "";

    if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) {
        mensagemErro.textContent = "Insira valores numéricos válidos para os limites.";
        return;
    }

    if (xMin >= xMax || yMin >= yMax) {
        mensagemErro.textContent = "xMin deve ser menor que xMax e yMin menor que yMax.";
        return;
    }

    const numPontos = 500;
    const passo = (xMax - xMin) / numPontos;
    const pontos = [];

    for (let i = 0; i <= numPontos; i++) {
        const x = xMin + i * passo;
        const y = avaliarFuncao(x, funcaoStr);
        if (!isNaN(y) && isFinite(y)) {
            pontos.push({ x: x, y: y });
        }
    }

    if (pontos.length === 0) {
        mensagemErro.textContent = "Nenhum ponto válido para plotar. Verifique a função.";
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
                pointRadius: 0
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: xMin,
                    max: xMax,
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                annotation: {
                    annotations: [
                        {
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y',
                            value: 0,
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderWidth: 2,
                            label: {
                                enabled: false,
                            }
                        },
                        {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: 0,
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderWidth: 2,
                            label: {
                                enabled: false,
                            }
                        }
                    ]
                }
            }
        },
        plugins: {
            beforeDraw: (chart) => {
                if (typeof ChartAnnotation !== 'undefined') {
                    ChartAnnotation.Annotation.beforeDraw(chart);
                }
            }
        }
    });
}

tipoFuncaoSelect.addEventListener('change', () => {
    switch (tipoFuncaoSelect.value) {
        case 'logaritmica':
            inputFuncao.value = 'Math.log10(x)';
            inputXMin.value = '-10';
            inputXMax.value = '10';
            inputYMin.value = '-10';
            inputYMax.value = '10';
            break;
        case 'exponencial':
            inputFuncao.value = 'Math.exp(x)';
            inputXMin.value = '-10';
            inputXMax.value = '10';
            inputYMin.value = '-10';
            inputYMax.value = '10';
            break;
        case 'polinomial':
            inputFuncao.value = 'x^2';
            inputXMin.value = '-10';
            inputXMax.value = '10';
            inputYMin.value = '-10';
            inputYMax.value = '10';
            break;
        default:
            inputFuncao.value = 'x';
            inputXMin.value = '-10';
            inputXMax.value = '10';
            inputYMin.value = '-10';
            inputYMax.value = '10';
            break;
    }
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