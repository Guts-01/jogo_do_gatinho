const cat = document.querySelector('.cat');
const agua = document.querySelector('.agua');
const btn_reset = document.querySelector('#reset');
const tempo_numeroDisplay = document.querySelector('#tempo_numero');
const scoreDisplay = document.querySelector('#pontuacao_numero');

let pontuacaoAtual = 0;
let temporizador;
let tempoInicial;

function jump() {
    cat.classList.add('jump');

    setTimeout(() => {
        cat.classList.remove('jump');
        incrementarPontuacao();
    }, 1000);
}

// Adiciona evento de toque
document.addEventListener('touchstart', () => {
    jump();
});

// Adiciona evento de teclado
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

const incrementarPontuacao = () => {
    pontuacaoAtual++;
    scoreDisplay.textContent = pontuacaoAtual;
};

function ResetarJogo() {
    // Recarrega a página para reiniciar o jogo
    location.reload();
}

// Função para verificar se o gato perdeu
function verificarDerrota() {
    const agua_obs = agua.offsetLeft;
    const cat_over = +window.getComputedStyle(cat).bottom.replace('px', '');

    if (agua_obs <= 70 && cat_over < 135) {
        agua.style.animation = 'none';
        agua.style.left = `${agua_obs}px`;

        cat.style.animation = 'none';
        cat.style.bottom = `${cat_over}px`;

        btn_reset.style.display = 'block';

        // Pausa o temporizador quando o gato perde
        clearInterval(temporizador);
    }
}

// Função para iniciar o temporizador
function iniciarTemporizador() {
    tempoInicial = Date.now();
    temporizador = setInterval(atualizarTemporizador, 1000);
}

// Função para atualizar o temporizador
function atualizarTemporizador() {
    const tempoAtual = Date.now();
    const tempoDecorrido = tempoAtual - tempoInicial;

    // Calcula o tempo decorrido em horas, minutos e segundos
    const segundos = Math.floor((tempoDecorrido / 1000) % 60).toString().padStart(2, '0');

    // Atualiza a exibição do tempo
    tempo_numeroDisplay.textContent = segundos;
}

// Inicia o temporizador
iniciarTemporizador();

// Verifica a derrota periodicamente
const loopDerrota = setInterval(verificarDerrota, 10);

// Event listeners para modal e reset
document.getElementById("comoJogar").addEventListener("click", function () {
    document.getElementById("myModal").style.display = "block";
});

document.getElementsByClassName("close")[0].addEventListener("click", function () {
    document.getElementById("myModal").style.display = "none";
});

window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
    }
});