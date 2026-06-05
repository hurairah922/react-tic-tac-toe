import { memo } from "react";

function MatchDisplayNamePanel({
  gameMode,
  cpuPlayerSymbol,
  matchDisplayNames,
  defaultMatchDisplayNames,
  customizedNames,
  onDisplayNameChange,
  onDisplayNameBlur,
  onDisplayNameReset,
}) {
  const isCpuMode = gameMode === "cpu";
  const humanPlayerSymbol = cpuPlayerSymbol === "X" ? "O" : "X";
  const activeNames = matchDisplayNames[gameMode];
  const activeDefaults = defaultMatchDisplayNames[gameMode];
  const activeCustomization = customizedNames[gameMode];
  const fields = isCpuMode
    ? [
        {
          player: humanPlayerSymbol,
          title: `Human player (${humanPlayerSymbol})`,
          description: `Shown for turns, wins, and move history on the ${humanPlayerSymbol} side.`,
        },
        {
          player: cpuPlayerSymbol,
          title: `CPU opponent (${cpuPlayerSymbol})`,
          description: "Defaults to CPU and can be renamed for the match.",
        },
      ]
    : [
        {
          player: "X",
          title: "Player X",
          description: "Local player on the X side.",
        },
        {
          player: "O",
          title: "Player O",
          description: "Local player on the O side.",
        },
      ];

  return (
    <section className="setup-section" aria-labelledby="match-display-name-title">
      <div className="setup-section-copy">
        <h3 id="match-display-name-title">Match display names</h3>
        <p>
          Edit the names shown during this round without changing records or the
          current board state.
        </p>
      </div>

      <div className="display-name-grid">
        {fields.map((field) => {
          const currentValue = activeNames[field.player];
          const defaultValue = activeDefaults[field.player];
          const isCustomized = activeCustomization[field.player];
          const inputId = `${gameMode}-display-name-${field.player.toLowerCase()}`;

          return (
            <div className="display-name-card" key={field.player}>
              <label className="account-field" htmlFor={inputId}>
                <span>{field.title}</span>
                <input
                  id={inputId}
                  type="text"
                  value={currentValue}
                  maxLength={24}
                  onChange={(event) =>
                    onDisplayNameChange(gameMode, field.player, event.target.value)
                  }
                  onBlur={() => onDisplayNameBlur(gameMode, field.player)}
                />
              </label>
              <p className="display-name-copy">{field.description}</p>
              <div className="display-name-footer">
                <span className="display-name-default">
                  Default: {defaultValue}
                </span>
                <button
                  type="button"
                  className="display-name-reset-button"
                  onClick={() => onDisplayNameReset(gameMode, field.player)}
                  disabled={!isCustomized}
                >
                  Use default
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default memo(MatchDisplayNamePanel);
