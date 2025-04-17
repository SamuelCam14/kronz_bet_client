// RUTA: client/src/pages/GameDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getGameDetailsById } from "../services/api";
import GameDetails from "../components/GameDetails"; // Contiene Player Stats
import QuarterScoresTable from "../components/QuarterScoresTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
// Importar utilidades/componentes necesarios del GameCard
import { getLogoSrc } from "../utils/teamLogos"; // Para los logos
import { format, parseISO, isToday, isValid } from "date-fns"; // Para formatear datetime

// --- Componente interno WinnerIndicator (copiado de GameCard o importado si lo separaste) ---
const WinnerIndicator = ({ className = "" }) => (
  <svg
    className={`inline-block h-3 w-3 fill-current ${className}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="0,0 20,10 0,20" />
  </svg>
);
// --- Función interna formatStatusOrTime (adaptada de GameCard) ---
const formatStatusOrTime = (game) => {
  // Similar a la de GameCard, pero simplificada para el header de detalle
  const dateTimeString = game.datetime;
  const status_text = game.status || "";
  const period = game.period || 0;
  const isFinal =
    status_text.toLowerCase() === "final" ||
    status_text.toLowerCase().startsWith("f/");

  if (isFinal) {
    return "FINAL";
  }
  const isLiveStatus = status_text.match(/Q[1-4]|OT|Halftime/i);
  if (period > 0 || isLiveStatus) {
    return status_text;
  } // Muestra el status en vivo directamente
  if (dateTimeString) {
    try {
      const gameDate = parseISO(dateTimeString);
      if (isValid(gameDate)) {
        const localTimeString = format(gameDate, "HH:mm");
        if (
          localTimeString === "00:00" &&
          dateTimeString.endsWith("T00:00:00Z")
        ) {
          return format(gameDate, "EEE, MMM d"); // Solo fecha si es fallback
        }
        return format(gameDate, "EEE, MMM d - HH:mm"); // Fecha y hora
      }
    } catch (e) {
      /* Ignora */
    }
  }
  return status_text || "N/A"; // Fallback
};

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const gameDate = location.state?.gameDate;

  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // *** NUEVO: Estado para la pestaña activa ***
  const [activeTab, setActiveTab] = useState("details"); // 'details' o 'boxscore'

  useEffect(() => {
    if (!gameId || !gameDate || !/\d{4}-\d{2}-\d{2}/.test(gameDate)) {
      setError("Invalid Game ID or Date provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setGameData(null);
    setActiveTab("details"); // Resetea tab
    const fetchGameData = async () => {
      try {
        const data = await getGameDetailsById(gameId, gameDate);
        if (data) {
          setGameData(data);
        } else {
          setError(
            `Game details not found (ID: ${gameId}, Date: ${gameDate}).`
          );
        }
      } catch (err) {
        setError(err.message || "Failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [gameId, gameDate]);

  // --- Lógica de renderizado ---
  if (loading) {
    return (
      <div className="text-center mt-20 flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-2">Loading Game Details...</p>
      </div>
    );
  }
  if (error) {
    /* ... (Manejo de error con botón atrás) ... */ return (
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
    /* ... (Manejo de no data con botón atrás) ... */ return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Game details could not be loaded.
        </p>
        <button onClick={() => navigate("/")} className="...">
          Back to Games List
        </button>
      </div>
    );
  }

  // Variables para el header (similar a GameCard)
  const isFinal =
    gameData.status?.toLowerCase() === "final" ||
    gameData.status?.toLowerCase().startsWith("f/");
  const showScores = isFinal || gameData.period > 0;
  let homeWins = false;
  let visitorWins = false;
  if (
    isFinal &&
    typeof gameData.home_team_score === "number" &&
    typeof gameData.visitor_team_score === "number"
  ) {
    homeWins = gameData.home_team_score > gameData.visitor_team_score;
    visitorWins = gameData.visitor_team_score > gameData.home_team_score;
  }
  const homeLogoSrc = getLogoSrc(gameData.home_team?.abbreviation);
  const visitorLogoSrc = getLogoSrc(gameData.visitor_team?.abbreviation);
  const getTeamDisplayName = (team) =>
    team?.abbreviation || team?.name || "TEAM";
  const homeTeamTextClass =
    isFinal && visitorWins ? "opacity-60" : "opacity-100";
  const visitorTeamTextClass =
    isFinal && homeWins ? "opacity-60" : "opacity-100";
  const logoSizeClass = "h-10 w-10 sm:h-12 sm:w-12"; // Ligeramente más pequeño que en card? O igual?
  const scoreSizeClass = "text-3xl sm:text-4xl"; // Más grande en detalles
  const scoreWeightClass = "font-bold";
  const teamNameSizeClass = "text-sm sm:text-base"; // Un poco más grande que en card
  const teamNameWeightClass = "font-medium"; // Peso medio

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Botón Volver */}
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

      {/* === NUEVO GAME HEADER === */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center">
          {/* Equipo Home (Izquierda) */}
          <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
            {homeLogoSrc && (
              <img
                src={homeLogoSrc}
                alt={`${getTeamDisplayName(gameData.home_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
            <div
              className={`flex flex-col items-start justify-center ${homeTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {/* Score Home */}
              {showScores && (
                <div className="flex items-center">
                  <span
                    className={`${scoreSizeClass} ${scoreWeightClass} text-gray-800 dark:text-gray-100`}
                  >
                    {gameData.home_team_score ?? "-"}
                  </span>
                  {homeWins && (
                    <WinnerIndicator className="ml-1.5 sm:ml-2 text-gray-500 dark:text-gray-100" />
                  )}
                </div>
              )}
              {/* Nombre Home */}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full`}
              >
                {getTeamDisplayName(gameData.home_team)}
              </span>
            </div>
          </div>
          {/* Centro: NADA (el estado va abajo ahora) */}
          <div className="flex-shrink-0 mx-2 sm:mx-4"></div>
          {/* Equipo Visitante (Derecha) */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            <div
              className={`flex flex-col items-end justify-center ${visitorTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {/* Score Visitante */}
              {showScores && (
                <div className="flex items-center">
                  {visitorWins && (
                    <WinnerIndicator className="mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-100 transform rotate-180" />
                  )}
                  <span
                    className={`${scoreSizeClass} ${scoreWeightClass} text-gray-800 dark:text-gray-100`}
                  >
                    {gameData.visitor_team_score ?? "-"}
                  </span>
                </div>
              )}
              {/* Nombre Visitante */}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full text-right`}
              >
                {getTeamDisplayName(gameData.visitor_team)}
              </span>
            </div>
            {visitorLogoSrc && (
              <img
                src={visitorLogoSrc}
                alt={`${getTeamDisplayName(gameData.visitor_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
          </div>
        </div>
        {/* Estado del partido CENTRADO ABAJO */}
        <div className="text-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {formatStatusOrTime(gameData)}
        </div>
      </div>
      {/* === FIN NUEVO GAME HEADER === */}

      {/* === TABS / SLIDER HORIZONTAL === */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
          {/* Botón/Tab "Details" (Scores por periodo) */}
          {/* Solo se muestra si el juego es final y hay datos */}
          {isFinal &&
            gameData.period_scores &&
            gameData.period_scores.length > 0 && (
              <button
                onClick={() => setActiveTab("details")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
                  activeTab === "details"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }`}
              >
                Details
              </button>
            )}

          {/* Botón/Tab "Box Score" (Player Stats) */}
          {/* Se muestra siempre que el juego haya empezado o terminado */}
          {(gameData.period > 0 || isFinal) && (
            <button
              onClick={() => setActiveTab("boxscore")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === "boxscore"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              Box Score
            </button>
          )}
          {/* Puedes añadir más tabs aquí en el futuro */}
        </nav>
      </div>
      {/* === FIN TABS === */}

      {/* === CONTENIDO CONDICIONAL BASADO EN TAB ACTIVA === */}
      <div>
        {/* Mostrar Scores por Periodo si la tab 'details' está activa */}
        {activeTab === "details" &&
          isFinal &&
          gameData.period_scores &&
          gameData.period_scores.length > 0 && (
            <QuarterScoresTable
              periodScores={gameData.period_scores}
              homeTeamAbbr={gameData.home_team?.abbreviation}
              visitorTeamAbbr={gameData.visitor_team?.abbreviation}
            />
          )}

        {/* Mostrar Player Stats si la tab 'boxscore' está activa */}
        {activeTab === "boxscore" && (gameData.period > 0 || isFinal) && (
          <GameDetails
            gameId={gameData.id}
            homeTeamAbbr={gameData.home_team?.abbreviation}
            visitorTeamAbbr={gameData.visitor_team?.abbreviation}
          />
        )}

        {/* Mensaje por defecto si ninguna tab está activa o aplica */}
        {/* (No debería pasar con la lógica actual si hay datos) */}
      </div>
      {/* === FIN CONTENIDO CONDICIONAL === */}
    </div>
  );
}

export default GameDetailPage;
