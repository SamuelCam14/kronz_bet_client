// RUTA: client/src/pages/GameDetailPage.jsx
import React, { useState, useEffect } from "react";
// *** CAMBIO: Importa useLocation para leer el state ***
import { useParams, useNavigate, useLocation } from "react-router-dom";
// *** CAMBIO: Importa getGameDetailsById (que ahora necesita fecha) ***
import { getGameDetailsById } from "../services/api";
import GameDetails from "../components/GameDetails";
import QuarterScoresTable from "../components/QuarterScoresTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  // *** CAMBIO: Obtener el state de la navegación ***
  const location = useLocation();
  // Obtiene la fecha del state, o usa null como fallback
  const gameDate = location.state?.gameDate;

  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // *** CAMBIO: Validar gameId Y gameDate ***
    if (!gameId) {
      setError("Game ID not found in URL.");
      setLoading(false);
      return;
    }
    if (!gameDate) {
      setError(
        "Game Date not found in navigation state. Please go back and select the game again."
      );
      setLoading(false);
      return;
    }
    // Validar formato de fecha por si acaso
    if (!/\d{4}-\d{2}-\d{2}/.test(gameDate)) {
      setError("Invalid game date format received.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setGameData(null);

    const fetchGameData = async () => {
      try {
        console.log(
          `[GameDetailPage] Fetching details for GameID: ${gameId} on Date: ${gameDate}`
        );
        // *** CAMBIO: Pasar gameId Y gameDate ***
        const data = await getGameDetailsById(gameId, gameDate);
        if (data) {
          setGameData(data);
        } else {
          setError(
            `Game details not found for ID: ${gameId} on date ${gameDate}.`
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load game details.");
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();

    // *** CAMBIO: Añadir gameDate a las dependencias ***
  }, [gameId, gameDate]);

  // --- Renderizado Condicional (sin cambios) ---
  if (loading) {
    return (
      <div className="text-center mt-20 flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-2">Loading Game Details...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />{" "}
          Back to Games List{" "}
        </button>
      </div>
    );
  }
  if (!gameData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Game details could not be loaded for ID: {gameId}.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />{" "}
          Back to Games List{" "}
        </button>
      </div>
    );
  }

  const isFinal =
    gameData.status?.toLowerCase() === "final" ||
    gameData.status?.toLowerCase().startsWith("f/");

  // --- Renderizado Principal (sin cambios funcionales) ---
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {" "}
        <ArrowLeftIcon
          className="-ml-1 mr-1.5 h-4 w-4"
          aria-hidden="true"
        />{" "}
        Back{" "}
      </button>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {gameData.visitor_team?.full_name ||
            gameData.visitor_team?.abbreviation}{" "}
          @ {gameData.home_team?.full_name || gameData.home_team?.abbreviation}
        </h2>
        {gameData.period > 0 || isFinal ? (
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {gameData.visitor_team_score} - {gameData.home_team_score}
            {isFinal && (
              <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                FINAL
              </span>
            )}
          </p>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {gameData.status}
          </p>
        )}
        {/* ... (resto del header) ... */}
      </div>
      {isFinal &&
        gameData.period_scores &&
        gameData.period_scores.length > 0 && (
          <QuarterScoresTable
            periodScores={gameData.period_scores}
            homeTeamAbbr={gameData.home_team?.abbreviation}
            visitorTeamAbbr={gameData.visitor_team?.abbreviation}
          />
        )}
      {gameData.id &&
      gameData.home_team?.abbreviation &&
      gameData.visitor_team?.abbreviation ? (
        <GameDetails
          gameId={gameData.id}
          homeTeamAbbr={gameData.home_team.abbreviation}
          visitorTeamAbbr={gameData.visitor_team.abbreviation}
        />
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          Missing data to load player stats.
        </p>
      )}
    </div>
  );
}
export default GameDetailPage;
