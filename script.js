/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
let boardDisabled = 0;

const Player = (name, piece, ai) => {
    // ai: 0 = human, 1 = easy AI, 2 = hard ai
    let playerPiece = piece;
    let playerName = name;
    let playerAI = ai;
    let wins = 0;

    const getName = () =>  playerName;
    const getPiece = () => playerPiece;
    const getAI = () => playerAI;
    const getWins = () => wins;

    const makeWinner = () => {
        wins++;
    }

    const changeAI = (newAI) => {
        playerAI = newAI;
    }

    const rename = () => {
        playerName = prompt('Please enter a new name');
        displayController.updateNames();
    }

    const newPiece = (newPlayerPiece) => {
        playerPiece = newPlayerPiece;
    }

    return {getName, getPiece, getAI, makeWinner, rename, 
        newPiece, getWins, changeAI};
}

// initialize player
const playerOne = Player("Player 1", "X", 0);
const playerTwo = Player("Player 2", "O", 0);

const displayController = (() => {
    const clickPiece = (event) => {
        const cell = document.getElementById(event.target.id);
        const gamePiece = gameState.placePiece(event.target.id);
        cell.textContent = gamePiece;
        cell.removeEventListener('click', displayController.clickPiece);
        gameState.checkWinner();
        if (boardDisabled === 0) {
            gameState.checkAI();
        }
    }
    const declareWinner = (winner) => {
        if (winner === null) {
            const winnerText = document.querySelector('.declareWinner');
            winnerText.textContent = `It's a tie!`;
            const wins = document.querySelector('.wins');
            wins.textContent = `${playerOne.getName()}: ${playerOne.getWins()} ${playerTwo.getName()}: ${playerTwo.getWins()}`;
            gameState.disableBoard();
        } else {
            const winnerText = document.querySelector('.declareWinner');
            winnerText.textContent = `Congratulations ${winner}, you are the winner!`;
            const wins = document.querySelector('.wins');
            wins.textContent = `${playerOne.getName()}: ${playerOne.getWins()} ${playerTwo.getName()}: ${playerTwo.getWins()}`;
        }
    }
    const reset = () => {
        const allCells = document.querySelectorAll('.gameboardCell');
        for (let i = 0; i < allCells.length; i++) {
            allCells[i].textContent = "";
            allCells[i].addEventListener('click', displayController.clickPiece);
        }
        const winnerText = document.querySelector('.declareWinner');
        winnerText.textContent = "";
    }
    const updateNames = () => {
        const playerLabel1 = document.getElementById('player1Name');
        const playerLabel2 = document.getElementById('player2Name');
        playerLabel1.textContent = `${playerOne.getName()}:`;
        playerLabel2.textContent = `${playerTwo.getName()}:`;
        const wins = document.querySelector('.wins');
        wins.textContent = `${playerOne.getName()}: ${playerOne.getWins()} ${playerTwo.getName()}: ${playerTwo.getWins()}`;
    }

    return {clickPiece, declareWinner, reset, updateNames}
})();

const gameState = (() => {
    let currentPlayer = 1;

    let gameBoard = [0,0,0,0,0,0,0,0,0]

    const _changeTurn = () => {
        if (currentPlayer === 1) {
            currentPlayer = 2;
        } else {
            currentPlayer = 1
        }
    }

    const checkWinner = () => {
        const combs = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        // eslint-disable-next-line no-restricted-syntax
        for (let comb of combs) {
            if (
                gameBoard[comb[0]] === gameBoard[comb[1]] &&
                gameBoard[comb[1]] === gameBoard[comb[2]] &&
                gameBoard[comb[0]] !== 0
                ) {
                    disableBoard();
                    // currentPlayer is opposite of winning player
                    if (currentPlayer !== 1){
                        playerOne.makeWinner();
                        displayController.declareWinner(playerOne.getName());
                    } else {
                        playerTwo.makeWinner();
                        displayController.declareWinner(playerTwo.getName());
                    }
                }
        }
        let spaceAvail = 0;
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === 0) {
                spaceAvail++;
            }
        }
        if (spaceAvail === 0) {
            displayController.declareWinner(null);
        }
    }

    const placePiece = (idStr) => {
        const id = Number(idStr);
        if (currentPlayer === 1) {
            _changeTurn();
            gameBoard[id] = playerOne.getPiece();
            return playerOne.getPiece();
        }
        _changeTurn();
        gameBoard[id] = playerTwo.getPiece();
        return playerTwo.getPiece();
    }

    const disableBoard = () => {
        boardDisabled = 1;
        const allCells = document.querySelectorAll('.gameboardCell');
        for (let i = 0; i < allCells.length; i++) {
            allCells[i].removeEventListener('click', displayController.clickPiece);
        }
    }
    const reset = () => {
        currentPlayer = 1;
        // 1 is X; -1 is O.
        player1Piece = 1;
        player2Piece = -1;
        gameBoard = [0,0,0,0,0,0,0,0,0]
        boardDisabled = 0;
        displayController.reset();
    }
    const checkAI = () => {
        if (playerTwo.getAI() > 0 && currentPlayer === 2) {
            aiLogic.makeMove(gameBoard);
        }
    }

    return {placePiece, disableBoard, checkWinner, reset, checkAI};
})();

const aiLogic = (() => {
    const winCombs = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    const _checkWin = (board, depth) => {
        // eslint-disable-next-line no-restricted-syntax
        for (let comb of winCombs) {
            if (
                board[comb[0]] === board[comb[1]] &&
                board[comb[1]] === board[comb[2]] &&
                board[comb[0]] !== 0
                ) {
                    if (board[comb[0]] === playerTwo.getPiece()) {
                        return (100 - depth);
                    }
                    return (-100 + depth);
                }
        }
        let spaceAvail = 0;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === 0) {
                spaceAvail++;
            }
        }
        if (spaceAvail > 0) {
            return null;
        }
        return 0;
    }

    const _minimax = (board, depth, isPlayerTwo) => {
        const result = _checkWin(board, depth);
        if (result !== null) {
            return result;
        }
        if (isPlayerTwo) {
            let newBoard = board;
            let bestScore = -Infinity;
            for (let i = 0; i < newBoard.length; i++) {
                if (newBoard[i] === 0) {
                    newBoard[i] = playerTwo.getPiece();
                    const score = _minimax(newBoard, depth + 1, false);
                    newBoard[i] = 0;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        }
        let newBoard = board;
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === 0) {
                newBoard[i] = playerOne.getPiece();
                const score = _minimax(newBoard, depth + 1, true);
                newBoard[i] = 0;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }

    const _makeMoveEasy = (gameBoard) => {
        let move = Math.floor(Math.random() * 9);
        for (let i = 0; i < 100; i++) {
            if (gameBoard[move] === 0) {
                break;
            }
            move = Math.floor(Math.random() * 9);
        }
        const cell = document.getElementById(move);
        const gamePiece = gameState.placePiece(move);
        cell.textContent = gamePiece;
        gameState.checkWinner();
        cell.removeEventListener('click', displayController.clickPiece);
    }
    const makeMove = (board) => {
        if (playerTwo.getAI() === 1) {
            _makeMoveEasy(board);
        } else if (playerTwo.getAI() === 2) {
            _bestMove(board);
        }

    }
    const _bestMove = (board) => {
        const newBoard = board;
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === 0) {
                newBoard[i] = playerTwo.getPiece();
                const score = _minimax(newBoard, 0, false);
                newBoard[i] = 0;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        console.log(move);
        const cell = document.getElementById(move);
        const gamePiece = gameState.placePiece(move);
        cell.textContent = gamePiece;
        gameState.checkWinner();
        cell.removeEventListener('click', displayController.clickPiece);
    }

    return {makeMove};
})();

const init = (() => {
    // make cells clickable
    const allCells = document.querySelectorAll('.gameboardCell');
    for (let i = 0; i < allCells.length; i++) {
        allCells[i].addEventListener('click', displayController.clickPiece);
    }
    // initialize wins
    const wins = document.querySelector('.wins');
    wins.textContent = `${playerOne.getName()}: ${playerOne.getWins()} ${playerTwo.getName()}: ${playerTwo.getWins()}`;

    // initialize reset button
    const resetBtn = document.getElementById('reset');
    resetBtn.addEventListener('click', gameState.reset);

    // initialize name change
    const playerOneName = document.getElementById('player1Name');
    const playerTwoName = document.getElementById('player2Name');
    playerOneName.addEventListener('click', playerOne.rename);
    playerTwoName.addEventListener('click', playerTwo.rename);

    // initialize submit button
    const submitBtn = document.getElementById('gameStart');
    submitBtn.addEventListener('click', () => {
        const aiPicker = document.getElementById('player2');
        const piecePicker = document.getElementById('player1');
        if (piecePicker.value === "x") {
            playerOne.newPiece("X");
            playerTwo.newPiece("O");
        } else {
            playerOne.newPiece("O");
            playerTwo.newPiece("X");
        }
        if (aiPicker.value === "aiEasy") {
            playerTwo.changeAI(1);
        } else if (aiPicker.value === "aiHard") {
            playerTwo.changeAI(2);
        }
        gameState.reset();
    })
})();

