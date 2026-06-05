import { memo } from "react";

const GAME_MODE_OPTIONS = [
  {
    value: "human",
    label: "Human vs Human",
    detail: "Two players share the same board.",
  },
  {
    value: "cpu",
    label: "Human vs CPU",
    detail: "Play against a local CPU.",
  },
];

const CPU_DIFFICULTY_OPTIONS = [
  {
    value: "easy",
    label: "Easy",
    detail: "Random valid moves.",
  },
  {
    value: "medium",
    label: "Medium",
    detail: "Wins or blocks before going random.",
  },
  {
    value: "hard",
    label: "Hard",
    detail: "Wins, blocks, then prefers strong squares.",
  },
];

const CPU_SYMBOL_OPTIONS = [
  {
    value: "O",
    label: "Play as X",
    detail: "You move with crosses and the CPU takes noughts.",
  },
  {
    value: "X",
    label: "Play as O",
    detail: "You move with noughts and the CPU takes crosses.",
  },
];

function GameModeSelector({
  gameMode,
  cpuDifficulty,
  cpuPlayerSymbol,
  onGameModeChange,
  onCpuDifficultyChange,
  onCpuPlayerSymbolChange,
}) {
  const isCpuMode = gameMode === "cpu";

  return (
    <section className="setup-section" aria-labelledby="game-mode-title">
      <div className="setup-section-copy">
        <h3 id="game-mode-title">Mode</h3>
        <p>Switch between local play and a browser-only CPU opponent.</p>
      </div>

      <label className="control-field" htmlFor="game-mode-select">
        <span>Game mode</span>
        <select
          id="game-mode-select"
          className="control-select"
          value={gameMode}
          onChange={(event) => onGameModeChange(event.target.value)}
        >
          {GAME_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <small className="control-help">
          {
            GAME_MODE_OPTIONS.find((option) => option.value === gameMode)?.detail
          }
        </small>
      </label>

      {isCpuMode ? (
        <div className="setup-control-grid">
          <label className="control-field" htmlFor="cpu-symbol-select">
            <span>Your side</span>
            <select
              id="cpu-symbol-select"
              className="control-select"
              value={cpuPlayerSymbol}
              onChange={(event) => onCpuPlayerSymbolChange(event.target.value)}
            >
              {CPU_SYMBOL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="control-help">
              {
                CPU_SYMBOL_OPTIONS.find(
                  (option) => option.value === cpuPlayerSymbol
                )?.detail
              }
            </small>
          </label>

          <label className="control-field" htmlFor="cpu-difficulty-select">
            <span>CPU difficulty</span>
            <select
              id="cpu-difficulty-select"
              className="control-select"
              value={cpuDifficulty}
              onChange={(event) => onCpuDifficultyChange(event.target.value)}
            >
              {CPU_DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="control-help">
              {
                CPU_DIFFICULTY_OPTIONS.find(
                  (option) => option.value === cpuDifficulty
                )?.detail
              }
            </small>
          </label>
        </div>
      ) : null}
    </section>
  );
}

export default memo(GameModeSelector);
