// RUTA: client/src/components/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { getBoxScoreByGameId } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";
import PlayerStatsRow from "./PlayerStatsRow";

function GameDetails({ gameId, homeTeamAbbr, visitorTeamAbbr }) {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId || !homeTeamAbbr || !visitorTeamAbbr) {
      setError("Missing data.");
      setLoading(false);
      setPlayerStats([]);
      return;
    }
    const fetchBoxScoreData = async () => {
      setLoading(true);
      setError(null);
      setPlayerStats([]);
      try {
        const d = await getBoxScoreByGameId(gameId);
        setPlayerStats([...d].sort((a, b) => (b.pts ?? -1) - (a.pts ?? -1)));
      } catch (e) {
        setError(e.message || "Failed");
        setPlayerStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxScoreData();
  }, [gameId, homeTeamAbbr, visitorTeamAbbr]);

  const homePlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === homeTeamAbbr
  );
  const visitorPlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === visitorTeamAbbr
  );

  return (
    <div>
      <h4 className="text-lg font-semibold mt-6 mb-3 text-center text-g-text-primary">
        Player Stats
      </h4>

      {loading && (
        <div className="p-4 text-center">
          <LoadingSpinner />
          <p className="mt-2 text-g-text-secondary">Loading Player Stats...</p>
        </div>
      )}
      {!loading && error && (
        <p className="p-4 text-g-text-error text-center">{error}</p>
      )}

      {!loading && !error && (
        <>
          {playerStats.length === 0 && (
            <p className="text-center text-g-text-secondary my-4">
              No player stats available.
            </p>
          )}
          {playerStats.length > 0 && (
            <>
              {/* Tabla Visitante */}
              <div className="mb-6">
                <h5 className="font-medium mb-2 text-g-text-primary">
                  {visitorTeamAbbr || "Visitor"}
                </h5>
                <div className="overflow-x-auto rounded-lg border border-g-dark-border">
                  <table className="min-w-full divide-y divide-g-dark-border bg-g-dark-surface">
                    <thead className="bg-g-dark-surface-hover">
                      <tr>
                        <th
                          scope="col"
                          className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          Player
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          MIN
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          PTS
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          REB
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          AST
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          FG
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          FG%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-g-dark-border">
                      {visitorPlayerStats.length > 0 ? (
                        visitorPlayerStats.map((ps) => (
                          <PlayerStatsRow
                            key={ps.player?.id || Math.random()}
                            playerStat={ps}
                          />
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-g-text-secondary"
                          >
                            No stats.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Tabla Local */}
              <div>
                <h5 className="font-medium mb-2 text-g-text-primary">
                  {homeTeamAbbr || "Home"}
                </h5>
                <div className="overflow-x-auto rounded-lg border border-g-dark-border">
                  <table className="min-w-full divide-y divide-g-dark-border bg-g-dark-surface">
                    <thead className="bg-g-dark-surface-hover">
                      <tr>
                        <th
                          scope="col"
                          className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          Player
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          MIN
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          PTS
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          REB
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          AST
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          FG
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-g-text-secondary uppercase tracking-wider"
                        >
                          FG%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-g-dark-border">
                      {homePlayerStats.length > 0 ? (
                        homePlayerStats.map((ps) => (
                          <PlayerStatsRow
                            key={ps.player?.id || Math.random()}
                            playerStat={ps}
                          />
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4 text-g-text-secondary"
                          >
                            No stats.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
export default GameDetails;
