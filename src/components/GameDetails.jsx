// RUTA: client/src/components/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { getBoxScoreByGameId } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";
import QuarterScoresTable from "./QuarterScoresTable";
// *** CAMBIO: Importa PlayerStatsRow ***
import PlayerStatsRow from "./PlayerStatsRow";

function GameDetails({ game }) {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gameId = game?.id;
  const homeTeamAbbr = game?.home_team?.abbreviation;
  const visitorTeamAbbr = game?.visitor_team?.abbreviation;
  const periodScores = game?.period_scores;
  const isFinal =
    game.status?.toLowerCase() === "final" ||
    game.status?.toLowerCase().startsWith("f/");

  useEffect(() => {
    if (!gameId) {
      setError("Missing Game ID.");
      setLoading(false);
      setPlayerStats([]);
      return;
    }
    const fetchBoxScoreData = async () => {
      setLoading(true);
      setError(null);
      setPlayerStats([]);
      try {
        const transformedData = await getBoxScoreByGameId(gameId);
        // *** Ordenar por PTS descendente aquí ***
        const sortedData = [...transformedData].sort(
          (a, b) => (b.pts ?? -1) - (a.pts ?? -1)
        );
        setPlayerStats(sortedData);
      } catch (err) {
        setError(err.message || "Failed to load box score.");
        setPlayerStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxScoreData();
  }, [gameId]);

  // Filtra por equipo (la ordenación por puntos se mantiene)
  const homePlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === homeTeamAbbr
  );
  const visitorPlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === visitorTeamAbbr
  );

  return (
    <div className="p-3 sm:p-4">
      {/* Tabla de Scores por Periodo (si aplica) */}
      {isFinal && periodScores && periodScores.length > 0 && (
        <QuarterScoresTable
          periodScores={periodScores}
          homeTeamAbbr={homeTeamAbbr}
          visitorTeamAbbr={visitorTeamAbbr}
        />
      )}

      <h4 className="text-lg font-semibold mt-4 mb-3 text-center text-gray-900 dark:text-white">
        Player Stats
      </h4>

      {loading && (
        <div className="p-4 text-center">
          <LoadingSpinner />
          <p>Loading Player Stats...</p>
        </div>
      )}
      {!loading && error && (
        <p className="p-4 text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {/* Tabla Visitante (Player Stats) */}
          <div className="mb-6">
            <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
              {game.visitor_team?.full_name || visitorTeamAbbr || "Visitor"}
            </h5>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Player
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      MIN
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      PTS
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      REB
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      AST
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      FG
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      FG%
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* *** CAMBIO: Usa el componente PlayerStatsRow *** */}
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
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No player stats available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Tabla Local (Player Stats) */}
          <div>
            <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
              {game.home_team?.full_name || homeTeamAbbr || "Home"}
            </h5>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Player
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      MIN
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      PTS
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      REB
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      AST
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      FG
                    </th>
                    <th
                      scope="col"
                      className="py-2 px-1 sm:px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      FG%
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* *** CAMBIO: Usa el componente PlayerStatsRow *** */}
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
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No player stats available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GameDetails;
