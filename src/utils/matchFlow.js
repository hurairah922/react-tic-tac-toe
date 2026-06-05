export const DEFAULT_STARTING_PLAYER = "X";

export function getAlternatePlayer(player) {
  return player === "O" ? "X" : "O";
}

export function getPlayerForMove(startingPlayer, moveCount) {
  return moveCount % 2 === 0
    ? startingPlayer
    : getAlternatePlayer(startingPlayer);
}

export function getUndoMoveTarget(currentMove, gameMode) {
  const undoDistance = gameMode === "cpu" ? 2 : 1;

  return currentMove >= undoDistance ? currentMove - undoDistance : null;
}
