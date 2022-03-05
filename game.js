import { symbolsToArray } from "./symbols.js";

const createBoard = () => {
  const board = [];
  for (let y = 0; y < 3; y++) {
    const row = [];
    for (let x = 0; x < 3; x++) row.push('');
    board.push(row);
  }
  return board;
};

const findBoardY = (flatIndex) => Math.floor(flatIndex);
const findBoardX = (flatIndex) => Math.round((flatIndex - parseInt(`${flatIndex}`)) * 3);

const updateBoard = (board, symbol, flatIndex) => {
	const mappedIndex = flatIndex / 3;
	const y = findBoardY(mappedIndex);
	const x = findBoardX(mappedIndex);
	board[y][x] = symbol;
	return board;
}

const isSymbolWinner = (board, symbol) =>{
  let positions;

  const fillArray = (value) => new Array(3).fill(value);
  const xWin = board.some(y => {
    const result = y.every(playedSymbol => playedSymbol === symbol);
    if (result) {
      const yPos = board.indexOf(y);
      positions = [fillArray(yPos), [0,1,2]];
    }
    return result;
  });

  if (xWin)
    return positions;

  const checkYwin = (result, xs) => {
    for (let i = 0; i < 3; i++)
      result[i] = result[i] && xs[i] === symbol;
    return result;
  }
  const yArr = board.reduce(checkYwin, fillArray(true));
  const yWin = yArr.some(win => win);

  if (yWin) {
    const xPos = yArr.indexOf(true);
    positions = [[0,1,2], fillArray(xPos)];
    return positions;
  }

  const checkYxWin = (yxTuples) => yxTuples.every(([y, x]) => board[y][x] === symbol);
  const parseYxPositions = (yxTuples) => yxTuples.reduce(([yPos, xPos] , [y, x]) => [[...yPos, y], [...xPos, x]],[[], []]);

  const yxCombos1 = [[0, 0], [1, 1], [2, 2]];
  const yxCombos2 = [[0, 2], [1, 1], [2, 0]];

  if (checkYxWin(yxCombos1))
    positions = parseYxPositions(yxCombos1);

  if (checkYxWin(yxCombos2))
    positions = parseYxPositions(yxCombos2);

  return positions;
}

const checkBoardState = (board) => {
  let positions, symbol;

  for (symbol of symbolsToArray) {
    positions = isSymbolWinner(board, symbol);
    if (positions)
      break;
  }

  const hasWinner = !!positions;
  const isFinished = hasWinner || board.every(y => y.every(x => symbolsToArray.includes(x)))

  return {isFinished, hasWinner, positions, symbol};
}



export const GAME = {
  createBoard,
	updateBoard,
  checkBoardState,
};
