// RUTA: client/src/components/GameCard.jsx
import React from "react";
import { format, parseISO, isToday, isValid } from "date-fns";
import { getLogoSrc } from "../utils/teamLogos";

// --- formatGameTimeOrStatus (Adaptada para estados en vivo) ---
const formatGameTimeOrStatus = (game) => {
  const dateTimeString = game.datetime;
  const status_text = game.status || "";
  const period = game.period || 0;
  // Usar el status text para determinar si es final es más fiable a veces
  const isFinal =
    status_text.toLowerCase() === "final" ||
    status_text.toLowerCase().startsWith("f/");

  // 1. Juego Finalizado
  if (isFinal) {
    return (
      <span className="font-medium text-sm text-gray-500 dark:text-gray-400">
        FIN
      </span>
    );
  }

  // 2. Juego en Progreso (Detectado por periodo > 0 O por status_text específico)
  //    Prioriza status_text si contiene info útil (Qx, OT, Halftime)
  const isLiveStatus = status_text.match(/Q[1-4]|OT|Halftime/i);
  if (period > 0 || isLiveStatus) {
    // Si status_text es útil (no es "In Progress" o similar genérico), úsalo.
    const displayStatus = isLiveStatus ? status_text : "LIVE";
    // Aquí podrías añadir lógica para mostrar el game.game_clock si existe
    return (
      <span className="font-bold text-green-600 dark:text-green-400 animate-pulse text-sm">
        {displayStatus}
      </span>
    );
  }

  // 3. Juego Programado (Tiene datetime válido Y NO está en progreso/final)
  if (dateTimeString) {
    try {
      const gameDate = parseISO(dateTimeString);
      if (isValid(gameDate)) {
        const gameIsToday = isToday(gameDate);
        const localTimeString = format(gameDate, "HH:mm");
        // No mostrar hora si es el fallback de medianoche UTC
        if (
          localTimeString === "00:00" &&
          dateTimeString.endsWith("T00:00:00Z")
        ) {
          return (
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {gameIsToday ? "Hoy" : format(gameDate, "dd/MM/yy")}
            </span>
          );
        }
        // Muestra fecha/hoy y hora
        return (
          <div className="flex flex-col items-center text-center">
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {gameIsToday ? "Hoy" : format(gameDate, "dd/MM/yy")}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {localTimeString}
            </span>
          </div>
        );
      }
    } catch (e) {
      /* Ignora error de parseo aquí, usará fallback */
    }
  }

  // 4. Fallback (Status desconocido, TBD, PPD, etc.)
  return (
    <span className="text-xs text-yellow-600">{status_text || "N/A"}</span>
  );
};

const WinnerIndicator = ({ className = "" }) => (
  <svg
    className={`inline-block h-3 w-3 fill-current ${className}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="0,0 20,10 0,20" />
  </svg>
);

function GameCard({ game, onCardClick }) {
  const isFinal =
    game.status?.toLowerCase() === "final" ||
    game.status?.toLowerCase().startsWith("f/");
  // *** Muestra scores si es final O si el periodo es > 0 (juego iniciado) ***
  const showScores = isFinal || game.period > 0;

  let homeWins = false;
  let visitorWins = false;
  if (
    isFinal &&
    typeof game.home_team_score === "number" &&
    typeof game.visitor_team_score === "number"
  ) {
    homeWins = game.home_team_score > game.visitor_team_score;
    visitorWins = game.visitor_team_score > game.home_team_score;
  }
  const homeLogoSrc = getLogoSrc(game.home_team?.abbreviation);
  const visitorLogoSrc = getLogoSrc(game.visitor_team?.abbreviation);
  const getTeamDisplayName = (team) =>
    team?.abbreviation || team?.name || "TEAM";
  const homeTeamTextClass =
    isFinal && visitorWins ? "opacity-60" : "opacity-100";
  const visitorTeamTextClass =
    isFinal && homeWins ? "opacity-60" : "opacity-100";
  const logoSizeClass = "h-12 w-12 sm:h-14 sm:w-14";
  const scoreSizeClass = "text-2xl sm:text-3xl";
  const scoreWeightClass = "font-bold";
  const teamNameSizeClass = "text-xs sm:text-sm";
  const teamNameWeightClass = "font-normal";

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200 ease-in-out`}
    >
      {/* Pasa game.id y la fecha original EST/EDT */}
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => onCardClick(game.id, game.date?.split("T")[0] || null)}
      >
        <div className="flex justify-between items-center">
          {/* Equipo Home */}
          <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
            {homeLogoSrc && (
              <img
                src={homeLogoSrc}
                alt={`${getTeamDisplayName(game.home_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
            <div
              className={`flex flex-col items-start justify-center ${homeTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {showScores && (
                <div className="flex items-center">
                  <span
                    className={`${scoreSizeClass} ${scoreWeightClass} text-gray-800 dark:text-gray-100`}
                  >
                    {game.home_team_score ?? "-"}
                  </span>
                  {homeWins && (
                    <WinnerIndicator className="ml-1.5 sm:ml-2 text-gray-500 dark:text-gray-100 rotate-180" />
                  )}
                </div>
              )}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full`}
              >
                {getTeamDisplayName(game.home_team)}
              </span>
            </div>
          </div>
          {/* Centro */}
          <div className="flex-shrink-0 mx-1 sm:mx-2 min-w-[50px] text-center">
            {" "}
            {formatGameTimeOrStatus(game)}{" "}
          </div>
          {/* Equipo Visitante */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            <div
              className={`flex flex-col items-end justify-center ${visitorTeamTextClass} transition-opacity duration-300 min-w-0`}
            >
              {showScores && (
                <div className="flex items-center">
                  {visitorWins && (
                    <WinnerIndicator className="mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-100 transform" />
                  )}
                  <span
                    className={`${scoreSizeClass} ${scoreWeightClass} text-gray-800 dark:text-gray-100`}
                  >
                    {game.visitor_team_score ?? "-"}
                  </span>
                </div>
              )}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-gray-600 dark:text-gray-400 truncate block w-full text-right`}
              >
                {getTeamDisplayName(game.visitor_team)}
              </span>
            </div>
            {visitorLogoSrc && (
              <img
                src={visitorLogoSrc}
                alt={`${getTeamDisplayName(game.visitor_team)} logo`}
                className={`${logoSizeClass} object-contain flex-shrink-0`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default GameCard;
