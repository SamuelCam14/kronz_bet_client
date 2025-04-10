import React from "react";
import GameDetails from "./GameDetails";
import { format, parseISO, isToday, isValid } from "date-fns";
import { getLogoSrc } from "../utils/teamLogos";

// --- Función formatGameTimeOrStatus (sin cambios) ---
const formatGameTimeOrStatus = (game) => {
  // ... (código exacto de la función anterior)
  const dateTimeString = game.datetime;
  let gameDate = null;
  let parseError = false;

  if (dateTimeString) {
    try {
      gameDate = parseISO(dateTimeString);
      if (!isValid(gameDate)) {
        parseError = true;
        gameDate = null;
      }
    } catch (error) {
      parseError = true;
    }
  } else {
    parseError = true;
  }

  try {
    if (game.status === "Final" || game.status?.startsWith("F/")) {
      const localTimeString = gameDate ? format(gameDate, "HH:mm") : "--:--";
      return (
        <div className="flex flex-col items-center text-center">
          {" "}
          <span className="font-bold text-red-500 dark:text-red-400 text-sm">
            FIN
          </span>{" "}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {localTimeString}
          </span>{" "}
        </div>
      );
    }
    if (
      game.period > 0 &&
      game.status !== "Scheduled" &&
      !game.status?.startsWith("F/")
    ) {
      const liveStatus =
        game.status &&
        game.status !== "Scheduled" &&
        game.status !== game.time &&
        game.status !== "Final"
          ? game.status
          : "LIVE";
      return (
        <div className="flex flex-col items-center text-center">
          {" "}
          <span className="font-bold text-green-600 dark:text-green-400 animate-pulse text-sm">
            {liveStatus}
          </span>{" "}
        </div>
      );
    }
    if (gameDate) {
      const gameIsToday = isToday(gameDate);
      const localTimeString = format(gameDate, "HH:mm");
      return (
        <div className="flex flex-col items-center text-center">
          {" "}
          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
            {" "}
            {gameIsToday ? "Hoy" : format(gameDate, "dd/MM/yy")}{" "}
          </span>{" "}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {" "}
            {localTimeString}{" "}
          </span>{" "}
        </div>
      );
    }
    return (
      <span className="text-xs text-yellow-600">{game.status || "N/A"}</span>
    );
  } catch (error) {
    console.error("Error during formatting logic:", error, game);
    return <span className="text-xs text-red-500">Error</span>;
  }
};

// --- Componente GameCard con Lógica Condicional de Tamaño y Renderizado ---
function GameCard({ game, isExpanded, onCardClick }) {
  // Condición para mostrar scores (más estricta: solo si hay periodo > 0 o es final)
  // Opcionalmente, podrías incluir `|| game.home_team_score > 0 || game.visitor_team_score > 0` si quieres mostrar score 0-0 en Q1.
  // Por ahora, la dejaremos así para que solo aparezca cuando realmente haya actividad o haya terminado.
  const showScores =
    game.period > 0 || game.status === "Final" || game.status?.startsWith("F/");
  const isFinal = game.status === "Final" || game.status?.startsWith("F/");

  let homeWins = false;
  let visitorWins = false;
  if (isFinal) {
    homeWins = game.home_team_score > game.visitor_team_score;
    visitorWins = game.visitor_team_score > game.home_team_score;
  }

  const homeLogoSrc = getLogoSrc(game.home_team?.abbreviation);
  const visitorLogoSrc = getLogoSrc(game.visitor_team?.abbreviation);
  const getTeamDisplayName = (team) =>
    team?.abbreviation || team?.name?.substring(0, 3).toUpperCase() || "TEAM";

  const homeTeamTextClass =
    isFinal && visitorWins ? "opacity-60" : "opacity-100";
  const visitorTeamTextClass =
    isFinal && homeWins ? "opacity-60" : "opacity-100";

  const logoSizeClass = "h-12 w-12 sm:h-14 sm:w-14";

  // Clases condicionales para el tamaño del nombre del equipo
  const teamNameSizeClass = showScores
    ? "text-sm sm:text-base"
    : "text-base sm:text-lg"; // Más grande si no hay score

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isExpanded ? "ring-2 ring-teal-500 dark:ring-teal-400" : ""
      }`}
    >
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => onCardClick(game.id)}
      >
        <div className="flex justify-between items-center">
          {/* --- Equipo Home (Izquierda) --- */}
          <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
            {/* Logo Home */}
            {homeLogoSrc && (
              <img
                src={homeLogoSrc}
                alt={`${game.home_team?.full_name || "Home"} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
            {/* Contenedor Texto Home */}
            {/* Aplicamos la opacidad condicional y aseguramos centrado vertical si solo hay nombre */}
            <div
              className={`flex flex-col items-start justify-center ${homeTeamTextClass} transition-opacity duration-300`}
            >
              {/* Nombre Home con tamaño condicional */}
              <span
                className={`font-bold text-gray-900 dark:text-white truncate ${teamNameSizeClass}`}
              >
                {getTeamDisplayName(game.home_team)}
              </span>
              {/* === RENDERIZADO CONDICIONAL DEL SPAN DE SCORE === */}
              {showScores && (
                <span className="text-xl sm:text-2xl font-light text-gray-700 dark:text-gray-300">
                  {game.home_team_score ?? "-"}
                </span>
              )}
            </div>
          </div>

          {/* --- Centro: Hora/Estado --- */}
          <div className="flex-shrink-0 mx-1 sm:mx-2 min-w-[60px] text-center">
            {formatGameTimeOrStatus(game)}
          </div>

          {/* --- Equipo Visitante (Derecha) --- */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            {/* Contenedor Texto Visitante */}
            <div
              className={`flex flex-col items-end justify-center ${visitorTeamTextClass} transition-opacity duration-300`}
            >
              {/* Nombre Visitante con tamaño condicional */}
              <span
                className={`font-bold text-gray-900 dark:text-white truncate ${teamNameSizeClass}`}
              >
                {getTeamDisplayName(game.visitor_team)}
              </span>
              {/* === RENDERIZADO CONDICIONAL DEL SPAN DE SCORE === */}
              {showScores && (
                <span className="text-xl sm:text-2xl font-light text-gray-700 dark:text-gray-300">
                  {game.visitor_team_score ?? "-"}
                </span>
              )}
            </div>
            {/* Logo Visitante */}
            {visitorLogoSrc && (
              <img
                src={visitorLogoSrc}
                alt={`${game.visitor_team?.full_name || "Visitor"} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sección Expandible (sin cambios) */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <GameDetails gameId={game.id} />
        </div>
      )}
    </div>
  );
}
export default GameCard;
