import { GAME } from './game.js';
import { Symbols, SvgSymbols } from './symbols.js';

const STATE = { board: GAME.createBoard(), lastSymbol: Symbols.X };

const findSectionIndex = (sect) => [...document.querySelector('main').children].indexOf(sect);
const findNextSymbol = () => (STATE.lastSymbol === Symbols.O ? Symbols.X : Symbols.O);
const areEqual = (arr) => arr.every(x => x === arr[0]);
const getHtmlIndexFromGame = (y, x) => y * 3 + x;

const divEndgame = (title, buttonAction) => {
  const div = document.createElement`div`;
  div.id = 'endgame';

  const h1 = document.createElement`h1`;
  h1.innerHTML = title;

  const button = document.createElement`button`;
  button.innerText = 'Start again';
  button.addEventListener('click', buttonAction(div), { once: true });

  div.append(h1, button);

  return div;
}

const setStylesFromObject = (element, object) => {
  for (const property in object)
    element.style[property] = object[property];
}

const createLine = (animationOrder, angle, invertDiagonal) => {
  const angleValues = {
    horizontal: {
      styles: {
        transform: `translate(${animationOrder ? 0 : -30}%)`,
        borderBottom: '6px solid black',
        justifySelf: 'flex-start',
      },
      animateStyles: {
        width: '150%',
      }
    },
    vertical: {
      styles: {
        transform: `translateY(${animationOrder ? 0 : -15}%)`,
        borderRight: '6px solid black',
        alignSelf: 'flex-start',
      },
      animateStyles: {
        height: '120%',
      }
    },
    diagonal: {
      styles: {
        transform: `rotate(${invertDiagonal ? 135: 45}deg)`,
        borderBottom: '6px solid black',
        alignSelf: 'flex-start',
        marginTop: '50%'
      },
      animateStyles: {
        width: `${animationOrder ? 175 : 200}%`,
      }
    },
  }

  const currentAngle = angleValues[angle];
  const delay = animationOrder * 200 + 'ms';

  const line = document.createElement`div`;
  line.style.position     = 'absolute';
  line.style.width        = '0';
  line.style.height       = '0';
  line.style.transition   = `width 200ms ease-in ${delay}, height 200ms ease-in ${delay}`;

  setStylesFromObject(line, currentAngle.styles);

  setTimeout(() => setStylesFromObject(line, currentAngle.animateStyles));

  return line;
}


const updateView = (nextSymbol) => {
  const buttons = document.querySelectorAll('main button');
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const htmlIndex = getHtmlIndexFromGame(y, x);
      const symbol = STATE.board[y][x];
      const btn = buttons[htmlIndex];
      const svg = symbol in SvgSymbols ? SvgSymbols[symbol](true) : SvgSymbols[nextSymbol]();
      btn.innerHTML = svg;
    }
  }
};

const restartGame = (endgame) => () => {
  STATE.board = GAME.createBoard();
  STATE.lastSymbol = Symbols.X;
  updateView(Symbols.O);
  initActions();
  document.body.removeChild(endgame);
}

const finishBoard = (title) => {
  const endgame = divEndgame(title, restartGame);
  document.body.appendChild(endgame);
}

const markBoard = ([yPositions, xPositions], buttons) => {
  const angle = areEqual(xPositions) && 'vertical'
             || areEqual(yPositions) && 'horizontal'
             ||                         'diagonal';

  const invertDiagonal = angle === 'diagonal' && xPositions[0] === 2;  

  for (let i = 0; i < 3; i++) {
    const htmlIndex = getHtmlIndexFromGame(yPositions[i], xPositions[i]);
    const button = buttons[htmlIndex];
    const line = createLine(i, angle, invertDiagonal);
    button.appendChild(line)
  }
}

const removeActions = (elements, type, event) =>
  elements.forEach(el => el.removeEventListener(type, event));

const checkFinished = () => {
  const { isFinished, hasWinner, positions, symbol } = GAME.checkBoardState(STATE.board);

  if (!isFinished)
    return;

  if (!hasWinner)
    return finishBoard('Draw');

  const title = `${SvgSymbols[symbol](true)} has won`;

  const buttons = document.querySelectorAll('main button');

  removeActions(buttons, 'click', onPlayerMove);

  markBoard(positions, buttons);

  setTimeout(() => finishBoard(title), 1200);

}

const onPlayerMove = ({ currentTarget }) => {
  const sectionElement = currentTarget.parentElement;
  const htmlIndex = findSectionIndex(sectionElement);
  const symbol = findNextSymbol();
  STATE.board = GAME.updateBoard(STATE.board, symbol, htmlIndex);
  updateView(STATE.lastSymbol);
  STATE.lastSymbol = symbol;

  checkFinished();
};

const initActions = () => document.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', onPlayerMove, { once: true }));

window.onload = initActions;
