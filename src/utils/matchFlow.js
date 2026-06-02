export const DEFAULT_STARTING_PLAYER = "X";

export function getAlternatePlayer(player) {
  return player === "O" ? "X" : "O";
}

export function getPlayerForMove(startingPlayer, moveCount) {
  return moveCount % 2 === 0
    ? startingPlayer
    : getAlternatePlayer(startingPlayer);
}

