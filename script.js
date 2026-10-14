const gameboard = (() => {

    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board.slice();

    const setCell = (index, mark) => {

        if (index >= 0 && index < board.length && board[index] === '') {
            board[index] = mark;
            return true; // Movimiento exitoso
        }
        return false; // Movimiento inválido (casilla ocupada o índice fuera de rango)
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    const isFull = () => {
        return board.every(cell => cell !== '');
    };

    return {
        getBoard,
        setCell,
        resetBoard,
        isFull
    };
})();

const createPlayer = (name, mark, isBot = false) => {
    let score = 0;
    const getScore = () => score;
    const incrementScore = () => score + 1;
    const resetScore = () => score = 0;

    return { name, mark, isBot, getScore, incrementScore, resetScore };
}

const gameController = (() => {

  const player1 = createPlayer("Player 1", "X");
  const player2 = createPlayer("Player 2", "O");

  let activePlayer = player1;
  let isGameOver = false;

  // Las 8 combinaciones posibles para ganar en un tablero de 3x3
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6]             // Diagonales
  ];

  const getActivePlayer = () => activePlayer;

  const switchTurn = () => {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  const checkWinOrTie = () => {
    const board = gameboard.getBoard();

    // Comprobar combinaciones ganadoras
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
        isGameOver = true;
        return { over: true, winner: activePlayer };
      }
    }

    if (gameboard.isFull()) {
      isGameOver = true;
      return { over: true, winner: null }; // Empate
    }

    return { over: false, winner: null };
  };

  const playRound = (index) => {
    if (isGameOver) {
      return { success: false, message: "Game is over, please restart the game." };
    }

    const moveSuccessful = gameboard.setCell(index, activePlayer.mark);
    
    if (!moveSuccessful) {
      return { success: false, message: "Wrong or invalid cell!" };
    }


    const gameStatus = checkWinOrTie();

    if (!gameStatus.over) {
      switchTurn(); 
    }

    return { success: true, gameStatus };
  };


  const restartGame = () => {
    gameboard.resetBoard();
    activePlayer = player1;
    isGameOver = false;
  };


  return {
    getActivePlayer,
    playRound,
    restartGame,
    getIsGameOver: () => isGameOver
  };
})();

const displayController = (() => {
  
  const boardElement = document.querySelector('#gameboard');
  const messageElement = document.querySelector('#message');
  const restartButton = document.querySelector('#restart-btn');

  const render = () => {
    const board = gameboard.getBoard();
    
    
    boardElement.innerHTML = '';

    board.forEach((mark, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = index; // Guardamos el índice en un atributo de datos
      cell.textContent = mark;
      
      if (mark) {
        cell.classList.add(mark.toLowerCase());
      }

      boardElement.appendChild(cell);
    });
  };

  const updateMessage = (text) => {
    messageElement.textContent = text;
  };

  const bindEvents = () => {
    // Usamos delegación de eventos en el contenedor del tablero
    boardElement.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return; // Si no hizo clic en una celda válida, salimos

      const index = parseInt(cell.dataset.index, 10);

      // Enviamos la jugada al controlador lógico (Módulo C)
      const result = gameController.playRound(index);

      if (!result.success) {
        return; // Si la casilla ya estaba ocupada o el juego terminó, no hacemos nada
      }

      // Si el movimiento fue exitoso, actualizamos la vista
      render();

      // Comprobamos si el juego terminó o si continúa
      if (result.gameStatus.over) {
        if (result.gameStatus.winner) {
          updateMessage(`${result.gameStatus.winner.name} wins! (${result.gameStatus.winner.mark})!`);
        } else {
          updateMessage(`It's a draw`);
        }
      } else {
        const nextPlayer = gameController.getActivePlayer();
        updateMessage(`It's ${nextPlayer.name}'s turn (${nextPlayer.mark})`);
      }
    });

    // Evento para el botón de reinicio
    restartButton.addEventListener('click', () => {
      gameController.restartGame();
      render();
      const firstPlayer = gameController.getActivePlayer();
      updateMessage(`Turno de: ${firstPlayer.name} (${firstPlayer.mark})`);
    });
  };

  // 5. Función de inicialización para arrancar todo
  const init = () => {
    bindEvents();
    render();
    const firstPlayer = gameController.getActivePlayer();
    updateMessage(`${firstPlayer.name}'s turn (${firstPlayer.mark})`);
  };

  return {
    init
  };
})();

displayController.init();