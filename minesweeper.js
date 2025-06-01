/** based on https://atuin.ru/blog/igra-saper-na-javascript/
 * Copyright (c) 2025 Alexander Bazhanov https://github.com/bazhanius
 */

function ready() {

    let l10n = {
        title: {
            ru: 'Сапёр',
            en: 'Minesweeper',
            zh: '踩地雷'
        },
        win: {
            ru: '<span>🎉 Победа!</span>',
            en: '<span>🎉 Victory!</span>',
            zh: '<span>🎉 胜利!</span>'
        },
        loose: {
            ru: '💥 Бум! Поражение',
            en: '💥 Boom! Game over',
            zh: '💥 咚!游戏结束'
        },
        hiScore: {
            ru: 'Рекорд',
            en: 'High score',
            zh: '高分'
        }
    }

    let userLang = navigator.language.indexOf('ru') !== -1 ?
        'ru'
        : navigator.language.indexOf('zh') !== -1
            ? 'zh'
            : 'en';

    let ruLangItems = document.querySelectorAll('[data-lang="ru"]');
    let enLangItems = document.querySelectorAll('[data-lang="en"]');
    let zhLangItems = document.querySelectorAll('[data-lang="zh"]');

    function updateTranslate() {
        document.title = l10n.title[userLang];
        if (userLang === 'ru') {
            ruLangItems.forEach(x => x.style.display = 'block');
            enLangItems.forEach(x => x.style.display = 'none');
            zhLangItems.forEach(x => x.style.display = 'none');
        } else if (userLang === 'zh') {
            ruLangItems.forEach(x => x.style.display = 'none');
            enLangItems.forEach(x => x.style.display = 'none');
            zhLangItems.forEach(x => x.style.display = 'block');
        } else {
            ruLangItems.forEach(x => x.style.display = 'none');
            enLangItems.forEach(x => x.style.display = 'block');
            zhLangItems.forEach(x => x.style.display = 'none');
        }
    }

    updateTranslate();

    const playButtonText = {
        'init': '🙂',
        'playing': '🤩',
        'ended': '😭',
        'won': '🥳',
    };

    let size = 10;
    let bombFrequency = 0.1;

    const board = document.querySelectorAll('.board')[0];
    let tiles;
    let boardSize;

    const restartBtn = document.querySelector('#restart-btn');
    const settingsBtn = document.querySelector('#settings-btn');
    const timerBlock = document.querySelector('#timer');
    const settingsBlock = document.querySelector('.settings');
    const endScreen = document.querySelectorAll('.end-screen')[0];
    let bombsCount = document.querySelector('.bombs-count');

    const boardSizeBtn = document.getElementById('boardSize');
    const difficultyBtns = document.querySelector('#difficulty');

    let bombs = [];
    let numbers = [];
    let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d',];

    let gameOver = false;

    // Choose click type: open a tile or mark with a flag
    let clickType = 1;
    let clickTypes = {
        flag: 0,
        open: 1
    };

    let segmentedItems = document.querySelectorAll('.segmented-item');
    let segmentedItemBg = document.querySelector('.segmented-item-selected');
    segmentedItems.forEach(btn => {
        btn.addEventListener('click', function () {
            if (clickType === clickTypes.flag) {
                segmentedItemBg.style.left = "0%";
                clickType = clickTypes.open;
            } else {
                segmentedItemBg.style.left = "50%";
                clickType = clickTypes.flag;
            }
        });
    });

    // Timer
    function secondsToMinutes(seconds) {
        let secs = Math.floor(seconds % 60);
        secs = secs < 10 ? "0" + secs : "" + secs;

        let mins = Math.floor(seconds / 60);
        mins = mins < 10 ? "0" + mins : "" + mins;

        return (mins + ":" + secs);
    }

    let timerID = null;
    let timerSeconds = 0;

    function startTimer() {
        timerSeconds = 0;
        timerID = setInterval(() => {
                if (gameOver) {
                    clearInterval(timerID);
                    timerID = null;
                } else {
                    timerSeconds += 1;
                    timerBlock.innerHTML = secondsToMinutes(timerSeconds);
                }
            }, 1000
        );
    }

    // Clear
    const clear = () => {

        clearInterval(timerID);
        timerID = null;
        timerBlock.innerHTML = '00:00';
        restartBtn.innerHTML = playButtonText.init;
        gameOver = false;
        bombs = [];
        numbers = [];
        endScreen.innerHTML = '';
        endScreen.classList.remove('show');
        tiles.forEach(tile => {
            tile.remove();
        });

        setup();
    }

    const setup = () => {
        for (let i = 0; i < Math.pow(size, 2); i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            board.appendChild(tile);
        }
        tiles = document.querySelectorAll('.tile');
        boardSize = Math.sqrt(tiles.length);

        document.documentElement.style.setProperty('--boardSize', `${boardSize}`);

        let x = 0;
        let y = 0;
        tiles.forEach((tile, i) => {
            tile.setAttribute('data-tile', `${x},${y}`);

            let random_boolean = Math.random() < bombFrequency;
            if (random_boolean) {
                bombs.push(`${x},${y}`);
                if (x > 0) numbers.push(`${x - 1},${y}`);
                if (x < boardSize - 1) numbers.push(`${x + 1},${y}`);
                if (y > 0) numbers.push(`${x},${y - 1}`);
                if (y < boardSize - 1) numbers.push(`${x},${y + 1}`);

                if (x > 0 && y > 0) numbers.push(`${x - 1},${y - 1}`);
                if (x < boardSize - 1 && y < boardSize - 1) numbers.push(`${x + 1},${y + 1}`);

                if (y > 0 && x < boardSize - 1) numbers.push(`${x + 1},${y - 1}`);
                if (x > 0 && y < boardSize - 1) numbers.push(`${x - 1},${y + 1}`);
            }

            x++;
            if (x >= boardSize) {
                x = 0;
                y++;
            }

            tile.oncontextmenu = function (e) {
                e.preventDefault();
                flag(tile);
            }

            tile.addEventListener('click', function (e) {
                if (clickType === clickTypes.flag) {
                    flag(tile);
                } else {
                    clickTile(tile);
                }
            });
        });

        numbers.forEach(num => {
            let coords = num.split(',');
            let tile = document.querySelectorAll(`[data-tile="${parseInt(coords[0])},${parseInt(coords[1])}"]`)[0];
            let dataNum = parseInt(tile.getAttribute('data-num'));
            if (!dataNum) dataNum = 0;
            tile.setAttribute('data-num', dataNum + 1);
        });

        if (bombs.length > 0) {
            bombsCount.innerHTML = '💣 ' + bombs.length;
            startTimer();
        } else {
            clear();
        }
    }

    const flag = (tile) => {
        if (gameOver) return;
        if (!tile.classList.contains('tile--checked')) {
            if (!tile.classList.contains('tile--flagged')) {
                tile.innerHTML = '🚩';
                tile.classList.add('tile--flagged');
            } else {
                tile.innerHTML = '';
                tile.classList.remove('tile--flagged');
            }
        }
    }


    const clickTile = (tile) => {
        if (gameOver) return;
        if (tile.classList.contains('tile--checked') || tile.classList.contains('tile--flagged')) return;
        let coordinate = tile.getAttribute('data-tile');
        if (bombs.includes(coordinate)) {
            endGame(tile);
        } else {

            let num = tile.getAttribute('data-num');
            if (num != null) {
                tile.classList.add('tile--checked');
                tile.innerHTML = num;
                tile.style.color = numberColors[num - 1];
                setTimeout(() => {
                    checkVictory();
                }, 100);
                return;
            }

            checkTile(tile, coordinate);
        }
        tile.classList.add('tile--checked');
    }


    const checkTile = (tile, coordinate) => {

        let coords = coordinate.split(',');
        let x = parseInt(coords[0]);
        let y = parseInt(coords[1]);

        setTimeout(() => {
            if (x > 0) {
                let targetW = document.querySelectorAll(`[data-tile="${x - 1},${y}"`)[0];
                clickTile(targetW, `${x - 1},${y}`);
            }
            if (x < boardSize - 1) {
                let targetE = document.querySelectorAll(`[data-tile="${x + 1},${y}"`)[0];
                clickTile(targetE, `${x + 1},${y}`);
            }
            if (y > 0) {
                let targetN = document.querySelectorAll(`[data-tile="${x},${y - 1}"]`)[0];
                clickTile(targetN, `${x},${y - 1}`);
            }
            if (y < boardSize - 1) {
                let targetS = document.querySelectorAll(`[data-tile="${x},${y + 1}"]`)[0];
                clickTile(targetS, `${x},${y + 1}`);
            }

            if (x > 0 && y > 0) {
                let targetNW = document.querySelectorAll(`[data-tile="${x - 1},${y - 1}"`)[0];
                clickTile(targetNW, `${x - 1},${y - 1}`);
            }
            if (x < boardSize - 1 && y < boardSize - 1) {
                let targetSE = document.querySelectorAll(`[data-tile="${x + 1},${y + 1}"`)[0];
                clickTile(targetSE, `${x + 1},${y + 1}`);
            }

            if (y > 0 && x < boardSize - 1) {
                let targetNE = document.querySelectorAll(`[data-tile="${x + 1},${y - 1}"]`)[0];
                clickTile(targetNE, `${x + 1},${y - 1}`);
            }
            if (x > 0 && y < boardSize - 1) {
                let targetSW = document.querySelectorAll(`[data-tile="${x - 1},${y + 1}"`)[0];
                clickTile(targetSW, `${x - 1},${y + 1}`);
            }
        }, 10);
    }


    // Game over - blow up
    const endGame = (tile) => {
        restartBtn.innerHTML = playButtonText.ended;
        endScreen.innerHTML = l10n.loose[userLang];
        endScreen.classList.add('show');
        gameOver = true;
        tiles.forEach(tile => {
            let coordinate = tile.getAttribute('data-tile');
            if (bombs.includes(coordinate)) {
                tile.classList.remove('tile--flagged');
                tile.classList.add('tile--checked', 'tile--bomb');
                tile.innerHTML = '💣';
            }
        });
    }

    const checkVictory = () => {
        let win = true;
        tiles.forEach(tile => {
            let coordinate = tile.getAttribute('data-tile');
            if (!tile.classList.contains('tile--checked') && !bombs.includes(coordinate)) win = false;
        });
        if (win) {
            restartBtn.innerHTML = playButtonText.won;
            endScreen.innerHTML = l10n.win[userLang];
            endScreen.classList.add('show');
            gameOver = true;
        }
    }


    // Init game
    setup();

    // New game
    restartBtn.addEventListener('click', function (e) {
        e.preventDefault();
        clear();
    });

    // Toggle settings
    settingsBtn.addEventListener('click', function (e) {
        let currentDisplay = settingsBlock.style.display || null;
        settingsBlock.style.display = currentDisplay === null || currentDisplay === 'none' ? 'flex' : 'none';
    });

    // Settings
    boardSizeBtn.addEventListener('change', function (e) {
        size = this.value;
        clear();
    });
    difficultyBtns.addEventListener('change', function () {
        bombFrequency = this.value;
        clear();
    });

    // Disable double click on page
    document.ondblclick = function (e) {
        e.preventDefault();
    }


}

document.addEventListener("DOMContentLoaded", ready);