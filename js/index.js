if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(error => console.error('Service Worker error:', error));
}

// Screens Elements
const menuScreen = document.querySelector('.menu-screen');
const loadingScreen = document.querySelector('.loading-screen');
const gameScreen = document.querySelector('.game-screen');
const endScreen = document.querySelector('.end-screen');
// Game Elements // Start Button
const startBtn = document.getElementById('start-btn');
const rocket = document.querySelector('.rocket');
const explosion = document.getElementById('explosion');
const scoreDisplay = document.getElementById('score-display');
// Dialog Elements
const dialogText = document.getElementById('dialog-text');
const nextBtn = document.getElementById('next-btn');
const optionTwoBtn = document.getElementById('option-two-btn');
const optionThreeBtn = document.getElementById('option-three-btn');

let musicPack = {
    bgMusic : new Audio('../audio/bg-music.mp3'),
    explosionSound: new Audio('../audio/explosion.mp3'),
    confirmSound: new Audio('../audio/confirm.mp3'),
    endingMusic: new Audio('../audio/ending-music.mp3'),
}

let survivalPoints = 0;
let currentLine = 0;
let currentQuestion = 0;

const dialogLines = [
    'Пип... Пип... Пип...',
    'О, привет! Ты кто? Неужели землянин?',
    'Да не боись ты, я не злой)',
    'Это же как тебя угораздило сюда попасть?',
    'Ну я так понял, что тебе нужно помочь.',
    'Как я вижу, ракета твоя сломана, а кислорода маловато.',
    'Но не переживай, я тебе помогу.',
    'Давай походим по окрестностям и поищем различные предметы.',
    'Они могут тебе пригодиться.',
    'А еще параллельно я буду задавать тебе вопросы, за которые ты будешь получать очки.',
    'Какие же к чёрту очки?',
    'Ну, очки выживания, конечно же!',
    'Если ты наберешь много очков, то сможешь починить свою ракету и улететь домой.',
    'А если нет, то пеняй на себя.',
    'Ну что, готов? Тогда поехали!',
];

const questionsLines = [
    {
        question: 'Вот тебе первый ворос. Какого цвета Марс?',
        options: ['Красный', 'Синий', 'Зеленый'],
        answer: 0,
        feedback: ['Правильно! Марс известен своим красным цветом! +10 очков!', 'Неа! Он не синий! -10 очков!', 'Нет, не зелёный точно... -10 очков!']
    },
    {
        question: 'Пока мы болтали, мы нашли какой-то ящик. Что сделаем?',
        options: ['Откроем его', 'Пройдём мимо', 'Возьмём ящик'],
        answer: [0, 2],
        feedback: ['Мы открыли ящик и нашли что-то полезное! +10 очков!', 'Мы прошли мимо и споткнулись! Из-за подегия мы повредили ногу... -10 очков!', 'Пригодится для восстановления ракеты! +10 очков!']
    },
    {
        question: 'А вот и второй вопрос. Сколько спутников у Марса?',
        options: ['1', '2', '3'],
        answer: 1,
        feedback: ['Неа! У него не один спутник! -10 очков!', 'Правильно! У Марса два спутника: Фобос и Деймос. +10 очков!', 'К сожалению, не три спутника точно... -10 очков!']
    },
    {
        question: 'Мы нашли какой-то странный камень. Что с ним сделаем?',
        options: ['Возьмём его', 'Разобьём его', 'Пройдем мимо'],
        answer: 2,
        feedback: ['Мы чуть не надорвали спину пока его пытались поднять. -10 очков!', 'Мы разбили камень, а зечем? Зря потратили время. -10 очков!', 'Мы прошли мимо и нашли за камнем арматуру. В хозяйстве пригодится! +10 очков!']
    },
    {
        question: 'Третий вопрос. Какой газ преобладает в атмосфере Марса?',
        options: ['Кислород', 'Углекислот', 'Азот'],
        answer: 1,
        feedback: ['Неа, кислорода здесь нет. Иначе зачем тебе отсюда поскорее валить? -10 очков!', 'Правильно! Атмосфера Марса состоит в основном из углекислого газа. +10 очков!', 'Нет, азота тут мало... -10 очков!']
    },
    {
        question: 'Мы нашли какой-то странный большой камок шерсти. Что прикажешь делать?',
        options: ['Возьмём его', 'Понаблюдаем', 'Пройдём мимо'],
        answer: 2,
        feedback: ['О нет! Это оказался марсианский жук размером с собаку. Беги! -10 очков!', 'Вот так сюрприз! Камок шерсти встал и убежал от нас. Только зря время потратили... -10 очков!', 'Мы прошли мимо и нашли полезные инструменты. +10 очков!']
    },
    {
        question: 'Четвертый вопрос. Какой самый большой вулкан на Марсе?',
        options: ['Олимп', 'Этна', 'Килиманджаро'],
        answer: 0,
        feedback: ['Правильно! Олимп - самый большой вулкан в Солнечной системе. +10 очков!', 'Нет, Этна находится на Земле. -10 очков!', 'Килиманджаро самый большой на Земле, не путай! -10 очков!']
    },
    {
        question: 'Пока мы лясы точили, что-то издало странный звук из-за ракеты. Что это может быть?',
        options: ['Проверим ракету', 'Игнорируем звук', 'Позовем на помощь'],
        answer: 0,
        feedback: ['Это ваш кот Барсик! Святые метеоры, как он суда попал и как он дышит. Будет мотиватором двигаться дальше! +10 очков!', 'Мы проигнорировали звук, и он стал только громче! -10 очков!', 'Боже чел... Мы на Марсе! Какая помощь? -10 очков!']
    },
    {
        question: 'Пятый вопрос. Какая планета ближе всего к Марсу?',
        options: ['Венера','Земля', 'Юпитер'],
        answer: 1,
        feedback: ['Нет, Венера ближе к Земле, чем к нам. -10 очков!', 'Правильно! Ваша Земля ближе всего к Марсу. +10 очков!', 'Юпитер слишком далеко от Марса. -10 очков!']
    },
    {
        question: 'Пока мы восстанавливали ракету, ты повредил свой костюм. Теперь там пробоина. Чем заклеить?',
        options: ['Клеем', 'Нитками', 'Скотчем'],
        answer: 2,
        feedback: ['Мда, клей так себе работает на Марсе. -10 очков!', 'Ты не умеешь шить и бабушки рядом к сожалению нет. -10 очков!', 'Правильно! Скотч - лучший вариант для экстренного ремонта. +10 очков!']
    }
];

startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    startBtn.style.animation = 'btnAnimation .5s ease-in-out';
    musicPack.confirmSound.play();
    rocket.style.transform = 'translateX(100px) rotate(25deg) scale(0.1)';
    rocket.style.left = '1300px';

    setTimeout(() => rocket.style.display = 'none', 2000);
    setTimeout(() => {
        explosion.style.display = 'block';
        musicPack.explosionSound.play();
    }, 2100);
    setTimeout(() => explosion.style.display = 'none', 2800);
    setTimeout(() => {
        menuScreen.style.display = 'none';
        loadingScreen.style.display = 'block';
    }, 4000);
    setTimeout(() => gameScript(), 7000);
});

function gameScript() {
    musicPack.bgMusic.loop = true;
    musicPack.bgMusic.volume = 0.3;
    musicPack.bgMusic.play();

    gameScreen.style.display = 'block';
    loadingScreen.style.display = 'none';
    dialogScript();
}

function dialogScript() {
    showDialogLine();

    nextBtn.onclick = () => {
        musicPack.confirmSound.play();
        nextBtn.textContent = 'Далее';
        nextBtn.style.animation = 'btnAnimation .5s ease-in-out';
        optionTwoBtn.style.animation = 'btnAnimation .5s ease-in-out';
        optionThreeBtn.style.animation = 'btnAnimation .5s ease-in-out';
        setTimeout(() => {
            nextBtn.style.animation = 'none';
            optionTwoBtn.style.animation = 'none';
            optionThreeBtn.style.animation = 'none';
        }, 500);

        currentLine++;

        if (currentLine < dialogLines.length) {
            showDialogLine();
        } else {
            questionScript();
        }
    };
}

function showDialogLine() {
    dialogText.textContent = dialogLines[currentLine];

    if (currentLine === dialogLines.length - 1) {
        nextBtn.textContent = 'Поехали!';
    }
}

function questionScript() {
    const current = questionsLines[currentQuestion];

    dialogText.textContent = current.question;
    scoreDisplay.style.display = 'block';
    nextBtn.style.display = 'inline-block';
    optionTwoBtn.style.display = 'inline-block';
    optionThreeBtn.style.display = 'inline-block';

    nextBtn.textContent = current.options[0];
    optionTwoBtn.textContent = current.options[1];
    optionThreeBtn.textContent = current.options[2];

    nextBtn.onclick = null;
    optionTwoBtn.onclick = null;
    optionThreeBtn.onclick = null;

    nextBtn.onclick = () => handleAnswer(0);
    optionTwoBtn.onclick = () => handleAnswer(1);
    optionThreeBtn.onclick = () => handleAnswer(2);
}

function handleAnswer(selectedIndex) {
    const current = questionsLines[currentQuestion];
    const correct = current.answer;

    dialogText.textContent = current.feedback[selectedIndex];

    musicPack.confirmSound.play();
    nextBtn.style.display = 'none';
    optionTwoBtn.style.display = 'none';
    optionThreeBtn.style.display = 'none';

    const isCorrect = Array.isArray(correct) // Написанно GPT // Array нужен для работы с массивами ведь у меня может быть несколько правильных ответов
        ? correct.includes(selectedIndex)
        : selectedIndex === correct;

    survivalPoints += isCorrect ? 10 : -10;

    scoreDisplay.textContent = `Очки выживания: ${survivalPoints}`;

    currentQuestion++;

    setTimeout(() => {
        if (currentQuestion < questionsLines.length) {
            questionScript();
        } else {
            showFinalResult();
        }
    }, 5500);
}

showFinalResult = () => {
    dialogText.textContent = `Вы завершили игру! Ваши очки выживания: ${survivalPoints}.`;

    nextBtn.style.display = 'none';
    optionTwoBtn.style.display = 'none';
    optionThreeBtn.style.display = 'none';

    setTimeout(() => {
        gameScreen.style.display = 'none';
        loadingScreen.style.display = 'block';
        musicPack.bgMusic.pause();
    }, 5500);

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        endScreen.style.display = 'block';
        musicPack.endingMusic.loop = true;
        musicPack.endingMusic.volume = 0.3;
        musicPack.endingMusic.play();
        if (survivalPoints >= 50) {
            document.getElementById('final-score').textContent = `Ваши очки: ${survivalPoints}`;
            document.getElementById('final-message').textContent = 'Вы успешно выжили и покинули Марс починив ракету!';
            document.getElementById('final-story').textContent = 'Вы спаслись набрав больше 50 очков! Вы смогли починить свою ракету и вернуться домой. Марсианин долго радовался вашему достижению, но потом ему стало одиноко и он собрав летающий корабль решил отправиться за вами на Землю. Продолжение следует!';
        }else if (survivalPoints >= 20) {
            document.getElementById('final-score').textContent = `Ваши очки: ${survivalPoints}`;
            document.getElementById('final-message').textContent = 'Вы выжили на Марсе, но не смогли починить ракету.';
            document.getElementById('final-story').textContent = 'Вы провели на Марсе много времени, но в конце концов вам не хватило ресурсов для починки ракеты. Но вы наладили пробелму с кислородом. Марсианин остался с вами, теперь вы лучшие друзья. Вы решили исследовать планету вместе. Кто его знает, может быть, вы найдете способ вернуться домой позже.';
        }else {
            document.getElementById('final-score').textContent = `Ваши очки: ${survivalPoints}`;
            document.getElementById('final-message').textContent = 'Вы не смогли дожить и до утра на Марсе.';
            document.getElementById('final-story').textContent = 'Вы сделали все возможное, но в конце концов вы были бессильны и кислород закончился. Марсианин остался один на планете, ему стало грустно от утраты своего нового друга...';
        }
    }, 10000);
}