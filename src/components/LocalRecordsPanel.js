import { memo } from "react";

function LocalRecordsPanel({
  gameMode,
  boardSize,
  records,
  source,
  isLoading,
  errorMessage,
  onClear,
  isClearDisabled,
}) {
  const isCpuMode = gameMode === "cpu";
  const isCloudSource = source === "cloud";
  const hasGames = statsHaveRecordedGames(records, isCpuMode);
  const stats = isCpuMode
    ? [
        { label: "Wins", value: records.wins },
        { label: "Losses", value: records.losses },
        { label: "Draws", value: records.draws },
        { label: "Current streak", value: records.currentWinStreak },
        { label: "Best streak", value: records.bestWinStreak },
        { label: "Total games", value: records.totalGames },
      ]
    : [
        { label: "X wins", value: records.xWins },
        { label: "O wins", value: records.oWins },
        { label: "Draws", value: records.draws },
        { label: "Total games", value: records.totalGames },
      ];

  return (
    <section className="sidebar-card local-records-card" aria-labelledby="local-records-title">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">{isCloudSource ? "Cloud records" : "Local records"}</p>
          <h2 id="local-records-title">
            {isCloudSource ? "Saved to your account" : "This browser only"}
          </h2>
        </div>

        <button
          type="button"
          className="history-sort-button clear-records-button"
          onClick={onClear}
          disabled={isClearDisabled}
        >
          {isCloudSource ? "Clear cloud records" : "Clear records"}
        </button>
      </div>

      <p className="local-records-copy">
        Showing {isCpuMode ? "Human vs CPU" : "Human vs Human"} on {boardSize} x{" "}
        {boardSize}.
      </p>

      {isCloudSource ? (
        <p className="local-records-copy">
          {isLoading
            ? "Loading your signed-in records."
            : "Signed-in matches stay with your account across devices."}
        </p>
      ) : null}

      {isCloudSource && !isLoading && !errorMessage && !hasGames ? (
        <p className="account-status" role="status">
          No cloud records yet. Finish a signed-in match to save one.
        </p>
      ) : null}

      {errorMessage ? <p className="account-error">{errorMessage}</p> : null}

      <dl className="records-stats" aria-label="Local records">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function statsHaveRecordedGames(records, isCpuMode) {
  if (!records || typeof records !== "object") {
    return false;
  }

  if (isCpuMode) {
    return Number(records.totalGames) > 0;
  }

  return Number(records.totalGames) > 0;
}

export default memo(LocalRecordsPanel);
