/*
	Iteración 0:
    Preguntar al usuario por 2 nombres con un Input type text, y confirmar con un botón
	Iteración 1:
		Crear la cuadrícula del 3 en raya (3 x 3) mediante JavaScript
	Iteración 2:
		Cuando el usuario haga click en uno de los espacios de la cuadrícula, pintar un círculo o equis
	Iteración 3:
		Establecer un sistema de turnos, que aparezca el nombre del jugador al que le toca jugar y en su turno
		siempre se pinte el mismo símbolo.
		Un vez el usuario hace click se pasa al turno del siguiente jugador (cambiar de símbolo)
	Iteración 4:
		En el caso de que un jugador haga un 3 en raya poner que ha ganado
	Iteración 5;
		Incluir puntuaciones, cuando un jugador gana se añaden puntos al usuario y estos se almacenan en localStorage, se debe identificar al usuario en el guardado y su puntuación
	Iteración 6:
		Hacer una vista de leaderboard en la que se muestren el top 10 de puntuadores y sus puntuacione
*/



/*
	================================
		GLOBAL VARIABLES
	================================
*/

const BODY = document.querySelector("body");
// Color[0] for player0 and color[1] for player1
const Playercolors = ["#0000ff70", "#ff000070"];

/*
	================================
		LIBRARY FUNCTIONS
	================================
*/

function createDOMElement(type, parent, options = {}) {
	// Create element of the requested type
	const element = document.createElement(type);

	// for each property set the element property to the given value
	for (property in options) {
		element[property] = options[property];
	}

	// Make parent adopt the element
	parent.appendChild(element);

	// Finaly return element for use
	return element;
}

function setHoverColor(color) {
	// We get :root
	const root = document.documentElement;

	// And set the color
	root.style.setProperty("--hover-color", color);
}

/*
	================================
		DRAW HIGHSCORE
	================================
*/

function getHighScore(playerName) {
	// Get all scores as JSON
	let scores = JSON.parse(localStorage.getItem("scores"));

	if (scores) {
		if (playerName) {
			if (!scores[playerName])
				scores[playerName] = 0
			// Add 1 to the player's new score
			scores[playerName]++;
			
			// And send the scores back to the localStorage
			localStorage.setItem("scores", JSON.stringify(scores));
		}

		// Sort by puntuation, keep top 10 and users points
		// [, a] keeps the player points
		const top10 = Object.entries(scores).sort(([, a], [, b]) => b - a).filter(([name], position) => (position >= 10 && name === playerName) || position < 10);
	
		// top10 is an array of arrays, so lets convert it to an array of jsons
		return top10.reduce((array, [name, points]) => [...array, {name, points}], []);
	}
	// If we can't find previous scores, we give the player ones
	scores = {[playerName]: 1};
	if (playerName) {
		// set the score in the localStorage
		localStorage.setItem("scores", JSON.stringify(scores));
	}
	return [{name: playerName, points: 1}]

}

function drawHighScore(winner) {
	// Create a container for highScore
	const background = createDOMElement("div", BODY, {className: "highScoreBack"}); // Create a background
	const container = createDOMElement("section", background, {className: "highScore"}); // The rest of highScore
	
	// Create winner Title
	let message;
	if (winner) {
		message = `The winner is ${winner}`;
		// keep all names in lowerCase
		winner = winner.toLowerCase();
	}
	else
		message = `DRAW!`;
	createDOMElement("p", container, {innerText: message, className: "msg"});

	// Get highScore
	const highScore = getHighScore(winner);

	// Create a container for highScore
	const highScoreContainer = createDOMElement("div", container, {className: "highScoreContainer"});

	// Create a entry for every score
	highScore.map((person, position) => {
		let options = {};
		if (person.name === winner)
			options = {className: "player"};
		const highScore = createDOMElement("div", highScoreContainer, options);

		let positionIndicator = `${position + 1}.-`;
		if (position === 10)
			positionIndicator = "YOU.-";
		createDOMElement("p", highScore, {innerText: `${positionIndicator} ${person.name}`});
		createDOMElement("p", highScore, {innerText: person.points});
	})
}


/*
	================================
		LINE CHECKER
	================================
*/

function checkRow(boardValues, y) {
	// Add all of the row values
	const count = boardValues[y].reduce((count, col) => count + col, 0);

	// if absolute count === 3 then we have a row
	if (Math.abs(count) === 3)
		return true;
	// else we don't have it
	return false;
}

function checkCol(boardValues, x) {
	// Add all of the col values
	const count = boardValues.reduce((count, row) => count + row[x], 0);

	// if absolute count === 3 then we have a row
	if (Math.abs(count) === 3)
		return true;
	// else we don't have it
	return false;
}

function checkDiagonal1(boardValues) {
	let count = 0;
	// Add the diagonal
	for (let i = 0; i < 3; i++)
		count += boardValues[i][i];
	// if absolute count === 3 then we have a diagonal1 row
	if (Math.abs(count) === 3)
		return true;
	// else we don't have it
	return false;
}

function checkDiagonal2(boardValues) {
	let count = 0;
	// Add the diagonal
	for (let i = 0; i < 3; i++)
		count += boardValues[i][2 - i];
	// if absolute count === 3 then we have a diagonal2 row
	if (Math.abs(count) === 3)
		return true;
	// else we don't have it
	return false;
}

function checkDiagonals(boardValues, x, y) {
	// If we don't have the new value on a diagonal, is not a diagonal
	if ((y === 1 && (x == 0 || x == 2)) || (x === 1 && (y == 0 || y == 2)))
		return false;
	if (checkDiagonal1(boardValues))
		return true
	if (checkDiagonal2(boardValues))
		return true
	// If we don't have a diagonal, then there's no row
	return false
	// We can check on which diagonal is it, but it will be loads of conditions, so we directly check if we have diagonal row

}

function checkForLines(boardValues, x, y) {
	// We do all this nested ifs for avoiding unecessary comprobations
	if (checkRow(boardValues, y))
		return true;
	else if (checkCol(boardValues, x))
		return true;
	else if (checkDiagonals(boardValues, x, y))
		return true;
	else
		return false;
}

/*
	================================
		GAME BOARD
	================================
*/

function drawGameBoard(boardValues, handleSelection, gameContainer) {
	const board = createDOMElement("div", gameContainer, {className: "board"});
	for (let y = 0; y < 3; y++) {
		// Create a new row
		const row = createDOMElement("div", board, {className: "row"});
		boardValues[y] = [];

		for (let x = 0; x < 3; x++) {
			// Create a new col
			const col = createDOMElement("div", row, {className: "col"});
			boardValues[y][x] = 0;

			// Create an eventListener for clicks on col
			col.addEventListener("click", function clickListener() {
				// We call handleSelection which will handle the boardValues
				handleSelection(x, y, col);

				// We also remove the eventListener, thats why I've created a classic function
				col.removeEventListener("click", clickListener);
			});
		}
	}
	return board;
}

function destroyGameContainer(gameContainer) {
	gameContainer.remove();
}

function createGameBoard(gameContainer, name1, name2) {
	// The game values, will be an array of [row || y][col || x] we do not respect [x][y] because of drawing logic
	// The values will be: 0 = no selected, 1 = player 1 selected, -1 = player 2 selected
	const boardValues = [];

	// As calculating if there is any movement left will be tedious to JS, we get a counter
	let movementsLeft = 9;

	// Specify whose turn is (0 = player1, 1 = player2)
	let turn = 0;
	setHoverColor(Playercolors[turn]);

	// Set the player's turn visually
	const playerName = createDOMElement("p", gameContainer, {innerText: `${name1}'s turn`, className: "playerTurn"});

	// Create a function which will handle the selections, we create it on the function for keep the turn
	const handleSelection = (x, y, col) => {
		let value;
		let newTurn;

		// Remove one movement
		movementsLeft--;

		// Set the className of col
		col.className = `col player${turn}`;

		// We set the value and change the turn
		if (turn === 0) {
			value = 1;
			newTurn = 1;
		}
		else {
			value = -1;
			newTurn = 0;
		}

		// We set it to 1 if player1 and to -1 if player 2
		boardValues[y][x] = value;

		// Check if we have a line or not moves
		if (checkForLines(boardValues, x, y) || !movementsLeft) {
			// If we have it, the player playing has won
			let name;
			if (!movementsLeft)
				name = null;
			else if (turn === 0)
				name = name1;
			else
				name = name2;

			// Delete gameBoard and drawHighScore
			destroyGameContainer(gameContainer);
			drawHighScore(name);
		}

		// Set the new turn
		turn = newTurn;
		setHoverColor(Playercolors[turn]);
		let name;
		if (turn === 0)
			name = name1;
		else
			name = name2;
		playerName.innerText = `${name}'s turn`;
	}
	// Draw a game board and generate the array of values
	const board = drawGameBoard(boardValues, handleSelection, gameContainer);

	return board;
}


/*
	================================
		GAME
	================================
*/

function startGame(name1, name2) {
	// Create a container for game
	const gameContainer = createDOMElement("section", BODY, {className: "game"});
	// Create a new Game Board
	createGameBoard(gameContainer, name1, name2);
}


/*
	================================
		START SCREEN
	================================
*/

function removeStartScreen(startScreenContainer) {
	// Remove the start screen container from DOM
	startScreenContainer.remove();
}

function drawStartScreen() {
	// Create containers for start screen
	const startScreenContainer = createDOMElement("form", BODY, {className: "startScreen"});

	// Generate player inputs container
	const namesContainer = createDOMElement("div", startScreenContainer, {className: "namesContainer"});
	const name1Container = createDOMElement("div", namesContainer);
	const name2Container = createDOMElement("div", namesContainer);

	// Generate players input
	createDOMElement("label", name1Container, {innerText: "Player's 1 name"});
	const player1Name = createDOMElement("input", name1Container, {placeholder: "Type the name of player 1"});
	createDOMElement("label", name2Container, {innerText: "Player's 2 name"});
	const player2Name = createDOMElement("input", name2Container, {placeholder: "Type the name of player 2"});

	// Draw a start game button
	const playButton = createDOMElement("button", startScreenContainer, {innerText: "Start playing"});

	// Create a variable for error message
	let errorMessage;

	// Set the playButton event
	playButton.addEventListener("click", (e) => {
		e.preventDefault();
		// Check if player1Name and player2Name are set
		if (player1Name.value && player2Name.value) {
			// Remove the start screen
			removeStartScreen(startScreenContainer);

			// Start the game
			startGame(player1Name.value, player2Name.value);
		}
		else {
			// Show an error message only if is not currently painted
			if (!errorMessage)
				errorMessage = createDOMElement("p", namesContainer, {innerText: "You must introduce 2 names", className: "error"});
		}
	});
}


/*
	================================
		MAIN LOOP
	================================
*/

drawStartScreen();