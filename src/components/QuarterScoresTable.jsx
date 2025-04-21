// RUTA: client/src/components/QuarterScoresTable.jsx
import React from "react";

function QuarterScoresTable({ periodScores, homeTeamAbbr, visitorTeamAbbr }) {
  if (!periodScores || periodScores.length === 0) return null;
  const filteredPeriodScores = periodScores.filter(
    (p) =>
      (p.period_name || "").startsWith("Q") ||
      (p.home_score !== null && p.home_score > 0) ||
      (p.visitor_score !== null && p.visitor_score > 0)
  );
  if (filteredPeriodScores.length === 0) return null;
  const periodHeaders = filteredPeriodScores.map((p) => p.period_name);

  return (
    <div className="my-4">
      <h5 className="text-sm font-semibold mb-2 text-center text-g-text-primary">
        Scores by Period
      </h5>
      <div className="overflow-x-auto rounded-lg border border-g-dark-border">
        <table className="min-w-full divide-y divide-g-dark-border text-center bg-g-dark-surface">
          <thead className="bg-g-dark-surface-hover">
            <tr>
              <th
                scope="col"
                className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-g-text-secondary uppercase tracking-wider"
              >
                Team
              </th>
              {periodHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="py-2 px-2 sm:px-3 text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-g-dark-border">
            <tr className="text-sm text-g-text-secondary hover:bg-g-dark-surface-hover">
              <td className="py-2 px-2 sm:px-3 font-medium text-left text-g-text-primary">
                {visitorTeamAbbr || "Away"}
              </td>
              {filteredPeriodScores.map((period, index) => (
                <td
                  key={`${visitorTeamAbbr}-${index}`}
                  className="py-2 px-2 sm:px-3"
                >
                  {period.visitor_score ?? "-"}
                </td>
              ))}
            </tr>
            <tr className="text-sm text-g-text-secondary hover:bg-g-dark-surface-hover">
              <td className="py-2 px-2 sm:px-3 font-medium text-left text-g-text-primary">
                {homeTeamAbbr || "Home"}
              </td>
              {filteredPeriodScores.map((period, index) => (
                <td
                  key={`${homeTeamAbbr}-${index}`}
                  className="py-2 px-2 sm:px-3"
                >
                  {period.home_score ?? "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default QuarterScoresTable;
