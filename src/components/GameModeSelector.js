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
    detail: "Play as X against a local CPU.",
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

function GameModeSelector({
  gameMode,
  cpuDifficulty,
  onGameModeChange,
  onCpuDifficultyChange,
}) {
  const isCpuMode = gameMode === "cpu";

  return (
    <section className="board-setup" aria-labelledby="game-mode-title">
      <div className="board-setup-copy">
        <p className="eyebrow">Match setup</p>
        <h2 id="game-mode-title">Choose who plays</h2>
        <p>
          Switch between local two-player play and a browser-only CPU opponent.
        </p>
      </div>

      <fieldset
        className="board-size-options"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
      >
        <legend>Game mode</legend>
        {GAME_MODE_OPTIONS.map((option) => {
          const optionId = `game-mode-${option.value}`;
          const isSelected = gameMode === option.value;

          return (
            <label
              className={`board-size-option${
                isSelected ? " board-size-option-selected" : ""
              }`}
              htmlFor={optionId}
              key={option.value}
            >
              <input
                id={optionId}
                type="radio"
                name="game-mode"
                value={option.value}
                checked={isSelected}
                onChange={() => onGameModeChange(option.value)}
              />
              <span className="board-size-label">{option.label}</span>
              <span className="board-size-rule">{option.detail}</span>
            </label>
          );
        })}
      </fieldset>

      {isCpuMode ? (
        <fieldset className="board-size-options">
          <legend>CPU difficulty</legend>
          {CPU_DIFFICULTY_OPTIONS.map((option) => {
            const optionId = `cpu-difficulty-${option.value}`;
            const isSelected = cpuDifficulty === option.value;

            return (
              <label
                className={`board-size-option${
                  isSelected ? " board-size-option-selected" : ""
                }`}
                htmlFor={optionId}
                key={option.value}
              >
                <input
                  id={optionId}
                  type="radio"
                  name="cpu-difficulty"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onCpuDifficultyChange(option.value)}
                />
                <span className="board-size-label">{option.label}</span>
                <span className="board-size-rule">{option.detail}</span>
              </label>
            );
          })}
        </fieldset>
      ) : null}
    </section>
  );
}

export default memo(GameModeSelector);
