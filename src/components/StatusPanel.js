import { memo, useMemo } from "react";

function normalizeChip(chip, index) {
  if (typeof chip === "string") {
    return {
      id: `status-chip-${index}`,
      label: chip,
      isInteractive: false,
      tone: "default",
    };
  }

  return {
    id: chip.id ?? `status-chip-${index}`,
    label: chip.label ?? "",
    labelPrefix: chip.labelPrefix ?? "",
    isInteractive: Boolean(chip.isInteractive),
    tone: chip.tone ?? "default",
    ariaLabel: chip.ariaLabel ?? "",
    options: Array.isArray(chip.options) ? chip.options : [],
    onSelect: chip.onSelect,
  };
}

function StatusPanel({
  currentMove,
  isDraw,
  winner,
  boardSize,
  winLength,
  startingPlayer,
  xIsNext,
  gameMode,
  cpuDifficulty,
  humanPlayerSymbol,
  cpuPlayerSymbol,
  isCpuTurn,
  lastMovePlayer,
  lastMoveLocation,
  playerDisplayNames,
  statusOverride = "",
  detailOverride = "",
  statusChips = [],
}) {
  const isCpuMode = gameMode === "cpu";
  const nextPlayer = xIsNext ? "X" : "O";
  const startingPlayerLabel = `${playerDisplayNames[startingPlayer]} (${startingPlayer})`;
  const cpuDifficultyLabel =
    cpuDifficulty.charAt(0).toUpperCase() + cpuDifficulty.slice(1);
  const lastMoveSummary = lastMoveLocation
    ? `${playerDisplayNames[lastMovePlayer]} (${lastMovePlayer}) played row ${
        lastMoveLocation.row
      }, column ${lastMoveLocation.col}.`
    : null;

  let status = `Next player: ${playerDisplayNames[nextPlayer]} (${nextPlayer})`;
  let detail =
    currentMove === 0
      ? "Choose an empty square to begin the round."
      : "Choose an empty square to continue.";

  if (winner) {
    status = `Winner: ${playerDisplayNames[winner]} (${winner})`;
    detail = "The winning line is highlighted on the board.";
  } else if (isDraw) {
    status = `Draw: ${playerDisplayNames.X} and ${playerDisplayNames.O}`;
    detail = "The board is full, so the round ends in a draw.";
  } else if (currentMove === 0) {
    status = `Starting player: ${startingPlayerLabel}`;
    detail = `${playerDisplayNames[startingPlayer]} makes the first move in this round.`;
  } else if (isCpuMode) {
    status = isCpuTurn
      ? `${playerDisplayNames[cpuPlayerSymbol]} turn`
      : `${playerDisplayNames[humanPlayerSymbol]} turn`;
    detail = isCpuTurn
      ? `${playerDisplayNames[cpuPlayerSymbol]} is choosing a move. The board is locked until it finishes.`
      : lastMoveSummary ??
        `${playerDisplayNames[humanPlayerSymbol]} is playing as ${humanPlayerSymbol}. Choose an empty square to continue.`;
  } else if (lastMoveSummary) {
    detail = `${lastMoveSummary} ${detail}`;
  }

  const fallbackStatusChips = [
    `${isCpuMode ? "Human vs CPU" : "Human vs Human"}`,
    `${boardSize}x${boardSize}`,
    `${winLength} in a row`,
    `Starter: ${playerDisplayNames[startingPlayer]} (${startingPlayer})`,
  ];

  if (isCpuMode) {
    fallbackStatusChips.push(`You are ${humanPlayerSymbol}`);
    fallbackStatusChips.push(`CPU: ${cpuDifficultyLabel}`);
  }

  if (statusOverride) {
    status = statusOverride;
  }

  if (detailOverride) {
    detail = detailOverride;
  }

  const renderedStatusChips =
    Array.isArray(statusChips) && statusChips.length > 0
      ? statusChips
      : fallbackStatusChips;
  const normalizedChips = useMemo(
    () => renderedStatusChips.map(normalizeChip),
    [renderedStatusChips]
  );

  return (
    <section className="status-strip" aria-label="Game status">
      <div className="status-summary" aria-live="polite">
        <p className="eyebrow">Round status</p>
        <p className="status-text">{status}</p>
        <p className="status-detail">{detail}</p>
      </div>

      <div className="status-chip-row" aria-label="Game summary and controls">
        {normalizedChips.map((chip) =>
          chip.isInteractive ? (() => {
            const selectedOption =
              chip.options.find((option) => option.selected) ?? chip.options[0];

            return (
              <label
                className={`status-chip status-chip-select${
                  chip.tone === "strong" ? " status-chip-strong" : ""
                }`}
                key={chip.id}
              >
                <span className="status-chip-select-value">
                  {chip.labelPrefix ? (
                    <span className="status-chip-prefix">{chip.labelPrefix}</span>
                  ) : null}
                  <span className="status-chip-select-text">
                    {selectedOption?.label ?? ""}
                  </span>
                </span>
                <select
                  className="status-chip-select-control"
                  aria-label={chip.ariaLabel || chip.label || chip.labelPrefix}
                  value={selectedOption?.value ?? ""}
                  onChange={(event) => chip.onSelect?.(event.target.value)}
                >
                  {chip.options.map((option) => (
                    <option
                      key={`${chip.id}-${String(option.value)}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="status-chip-caret" aria-hidden="true">
                  ▾
                </span>
              </label>
            );
          })() : (
            <span
              className={`status-chip status-chip-readonly${
                chip.tone === "strong" ? " status-chip-strong" : ""
              }`}
              key={chip.id}
              aria-label={chip.ariaLabel || chip.label}
            >
              {chip.label}
            </span>
          )
        )}
        <span className="status-chip status-chip-strong">Move #{currentMove}</span>
      </div>
    </section>
  );
}

export default memo(StatusPanel);
