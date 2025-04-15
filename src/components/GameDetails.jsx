// RUTA: client/src/components/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { getBoxScoreByGameId } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";
// Ya no importa QuarterScoresTable
import PlayerStatsRow from "./PlayerStatsRow"; // Asegúrate que PlayerStatsRow esté correcto

// Recibe props individuales
function GameDetails({ gameId, homeTeamAbbr, visitorTeamAbbr }) {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Valida props necesarios
    if (!gameId || !homeTeamAbbr || !visitorTeamAbbr) {
      setError(
        "Missing required data (Game ID or Team Abbr) for player stats."
      );
      setLoading(false);
      setPlayerStats([]);
      return;
    }

    const fetchBoxScoreData = async () => {
      setLoading(true);
      setError(null);
      setPlayerStats([]);
      try {
        console.log(
          `[GameDetails] Fetching player stats for GameID: ${gameId}`
        );
        const transformedData = await getBoxScoreByGameId(gameId);
        const sortedData = [...transformedData].sort(
          (a, b) => (b.pts ?? -1) - (a.pts ?? -1)
        );
        setPlayerStats(sortedData);
      } catch (err) {
        setError(err.message || "Failed to load player stats.");
        setPlayerStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxScoreData();
  }, [gameId, homeTeamAbbr, visitorTeamAbbr]); // Depende de las props

  // Filtra usando las props
  const homePlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === homeTeamAbbr
  );
  const visitorPlayerStats = playerStats.filter(
    (s) => s.team?.abbreviation === visitorTeamAbbr
  );

  // Renderizado solo de Player Stats
  return (
    <div>
      <h4 className="text-lg font-semibold mt-6 mb-3 text-center text-gray-900 dark:text-white">
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

      {/* Mostrar tablas solo si no hay loading/error */}
      {!loading && !error && (
        <>
          {/* Mensaje si playerStats está vacío después de cargar sin errores */}
          {playerStats.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 my-4">
              No player stats available for this game.
            </p>
          )}

          {/* Renderiza tablas solo si hay datos */}
          {playerStats.length > 0 && (
            <>
              {/* Tabla Visitante */}
              <div className="mb-6">
                <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  {visitorTeamAbbr || "Visitor"}
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
                            No stats for this team.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Tabla Local */}
              <div>
                <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  {homeTeamAbbr || "Home"}
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
                            No stats for this team.
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
