// RUTA: client/src/pages/GameDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getGameDetailsById } from "../services/api";
import GameDetails from "../components/GameDetails";
import QuarterScoresTable from "../components/QuarterScoresTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getLogoSrc } from "../utils/teamLogos";
import { format, parseISO, isToday, isValid } from "date-fns";

const WinnerIndicator = ({ className = "" }) => (
  <svg
    className={`inline-block h-3 w-3 fill-current ${className}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="0,0 20,10 0,20" />
  </svg>
);
const formatStatusOrTime = (game) => {
  if (!game) return "N/A";
  const dt = game.datetime;
  const st = game.status || "";
  const p = game.period || 0;
  const isF = st.toLowerCase() === "final" || st.toLowerCase().startsWith("f/");
  if (isF) return "FINAL";
  const isL = st.match(/Q[1-4]|OT|Halftime/i);
  if (p > 0 || isL) {
    const dS = isL ? st : "LIVE";
    return dS;
  }
  if (dt) {
    try {
      const gD = parseISO(dt);
      if (isValid(gD)) {
        const lts = format(gD, "HH:mm");
        if (lts === "00:00" && dt.endsWith("T00:00:00Z")) {
          return format(gD, "EEE, MMM d");
        }
        return format(gD, "EEE, MMM d - HH:mm");
      }
    } catch (e) {}
  }
  return st || "N/A";
};
const SESSION_GAME_DATE_PREFIX = "kronzGameDate_";

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [gameDate, setGameDate] = useState(() => {
    /* ... lógica sessionStorage ... */ const dS = location.state?.gameDate;
    if (dS && /^\d{4}-\d{2}-\d{2}$/.test(dS)) return dS;
    if (gameId) {
      const dSt = sessionStorage.getItem(
        `${SESSION_GAME_DATE_PREFIX}${gameId}`
      );
      if (dSt && /^\d{4}-\d{2}-\d{2}$/.test(dSt)) return dSt;
    }
    return null;
  });
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // Default, se ajusta luego

  useEffect(() => {
    if (!gameId || !gameDate || !/\d{4}-\d{2}-\d{2}/.test(gameDate)) {
      setError("Invalid Game ID or Date.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setGameData(null);
    const fetchGameData = async () => {
      try {
        const data = await getGameDetailsById(gameId, gameDate);
        if (data) {
          setGameData(data);
          const isGameFinal =
            data.status?.toLowerCase() === "final" ||
            data.status?.toLowerCase().startsWith("f/");
          if (
            !isGameFinal ||
            !data.period_scores ||
            data.period_scores.length === 0
          ) {
            setActiveTab("boxscore");
          } else {
            setActiveTab("details");
          }
        } else {
          setError(`Game details not found.`);
        }
      } catch (err) {
        setError(err.message || "Failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [gameId, gameDate]);

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
          Back{" "}
        </button>
      </div>
    );
  }
  if (!gameData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Game details could not be loaded.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />{" "}
          Back{" "}
        </button>
      </div>
    );
  }

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
  const logoSizeClass = "h-10 w-10 sm:h-12 sm:w-12";
  const scoreSizeClass = "text-3xl sm:text-4xl";
  const scoreWeightClass = "font-bold";
  const teamNameSizeClass = "text-sm sm:text-base";
  const teamNameWeightClass = "font-medium";

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* --- CAMBIO: Botón Volver AHORA SIEMPRE va a '/' --- */}
      <button
        onClick={() => navigate("/")} // Siempre vuelve a la lista principal
        className="mb-4 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <ArrowLeftIcon className="-ml-1 mr-1.5 h-4 w-4" aria-hidden="true" />
        Back
      </button>
      {/* --- FIN CAMBIO --- */}

      {/* Game Header (Sin cambios) */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          {/* Home */}{" "}
          <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
            {" "}
            {homeLogoSrc && (
              <img
                src={homeLogoSrc}
                alt={`${getTeamDisplayName(gameData.home_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}{" "}
            <div
              className={`flex flex-col items-start justify-center ${homeTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {" "}
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
              )}{" "}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full`}
              >
                {getTeamDisplayName(gameData.home_team)}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Center Spacer */}{" "}
          <div className="flex-shrink-0 mx-2 sm:mx-4"></div> {/* Visitor */}{" "}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            {" "}
            <div
              className={`flex flex-col items-end justify-center ${visitorTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {" "}
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
              )}{" "}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full text-right`}
              >
                {getTeamDisplayName(gameData.visitor_team)}
              </span>{" "}
            </div>{" "}
            {visitorLogoSrc && (
              <img
                src={visitorLogoSrc}
                alt={`${getTeamDisplayName(gameData.visitor_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="text-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {" "}
          {formatStatusOrTime(gameData)}{" "}
        </div>{" "}
      </div>
      {/* Tabs (Sin cambios) */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        {" "}
        <nav className="-mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
          {" "}
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
                {" "}
                Details{" "}
              </button>
            )}{" "}
          {(gameData.period > 0 || isFinal) && (
            <button
              onClick={() => setActiveTab("boxscore")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === "boxscore"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              {" "}
              Box Score{" "}
            </button>
          )}{" "}
        </nav>{" "}
      </div>
      {/* Contenido Condicional (Sin cambios) */}
      <div>
        {" "}
        {activeTab === "details" &&
          isFinal &&
          gameData.period_scores &&
          gameData.period_scores.length > 0 && (
            <QuarterScoresTable
              periodScores={gameData.period_scores}
              homeTeamAbbr={gameData.home_team?.abbreviation}
              visitorTeamAbbr={gameData.visitor_team?.abbreviation}
            />
          )}{" "}
        {activeTab === "boxscore" &&
          (gameData.period > 0 || isFinal) &&
          gameData.id &&
          gameData.home_team?.abbreviation &&
          gameData.visitor_team?.abbreviation && (
            <GameDetails
              gameId={gameData.id}
              homeTeamAbbr={gameData.home_team.abbreviation}
              visitorTeamAbbr={gameData.visitor_team.abbreviation}
            />
          )}{" "}
      </div>
    </div>
  );
}
export default GameDetailPage;
