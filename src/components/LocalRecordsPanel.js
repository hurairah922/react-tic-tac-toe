import { memo } from "react";

function LocalRecordsPanel({
  gameMode,
  boardSize,
  records,
  onClear,
  isClearDisabled,
}) {
  const isCpuMode = gameMode === "cpu";
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
          <p className="eyebrow">Local records</p>
          <h2 id="local-records-title">This browser only</h2>
        </div>

        <button
          type="button"
          className="history-sort-button clear-records-button"
          onClick={onClear}
          disabled={isClearDisabled}
        >
          Clear records
        </button>
      </div>

      <p className="local-records-copy">
        Showing {isCpuMode ? "Human vs CPU" : "Human vs Human"} on {boardSize} x{" "}
        {boardSize}.
      </p>

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

export default memo(LocalRecordsPanel);
