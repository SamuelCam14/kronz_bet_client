// RUTA: client/src/components/GameCard.jsx
import React, { useState, useEffect } from "react";
import { format, parseISO, isToday, isValid } from "date-fns";
import { getLogoSrc } from "../utils/teamLogos";
import { getWinProbability } from "../services/api"; // Importa la nueva función

const formatGameTimeOrStatus = (game) => {
  const dt = game.datetime;
  const st = game.status || "";
  const p = game.period || 0;
  const isF = st.toLowerCase() === "final" || st.toLowerCase().startsWith("f/");
  if (isF) return "FIN";
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
  const hasStarted =
    game.period > 0 ||
    (!isFinal && !game.status?.match(/(\d{1,2}:\d{2}\s*(AM|PM|ET)|TBD|PPD)/i));
  const showScores = isFinal || hasStarted;
  const isUpcoming = !isFinal && !hasStarted;

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

  // Estado para probabilidad y carga
  const [winProb, setWinProb] = useState(null);
  const [loadingProb, setLoadingProb] = useState(false);

  // Efecto para buscar probabilidad
  useEffect(() => {
    setWinProb(null);
    setLoadingProb(false);
    const homeTeamId = game?.home_team?.id;
    const visitorTeamId = game?.visitor_team?.id;
    if (isUpcoming && homeTeamId && visitorTeamId) {
      setLoadingProb(true);
      let isMounted = true;
      getWinProbability(homeTeamId, visitorTeamId)
        .then((data) => {
          if (isMounted && data) {
            setWinProb(data);
          }
        })
        .catch((error) => {
          console.error(
            `[GameCard ${game.id}] Error fetching win prob:`,
            error
          );
        })
        .finally(() => {
          if (isMounted) setLoadingProb(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [game?.id, isUpcoming, game?.home_team?.id, game?.visitor_team?.id]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200 ease-in-out`}
    >
      {/* Contenedor Principal Clickeable */}
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => onCardClick(game.id, game.date?.split("T")[0] || null)}
      >
        {/* Fila Superior: Equipos y Hora/Status */}
        <div className="flex justify-between items-center mb-3">
          {" "}
          {/* Margen inferior para separar de la prob */}
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
                    <WinnerIndicator className="ml-1.5 sm:ml-2 text-gray-500 dark:text-gray-100" />
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
                    <WinnerIndicator className="mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-100 transform rotate-180" />
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

        {/* --- NUEVO: Fila Inferior para Probabilidades (solo si aplica) --- */}
        {isUpcoming && (
          <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center text-center">
            {" "}
            {/* Aumentado pt-3 */}
            {/* Probabilidad Home */}
            <div className="flex-1 px-1 flex flex-col items-center">
              {" "}
              {/* Centrado vertical */}
              {loadingProb && (
                <span className="text-xs text-gray-400 animate-pulse h-8 flex items-center">
                  Calculating...
                </span>
              )}{" "}
              {/* Placeholder de altura */}
              {winProb && !loadingProb && (
                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  {" "}
                  {/* Tamaño de texto aumentado */}
                  {(winProb.home_win_probability * 100).toFixed(0)}%
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                    Win Prob.
                  </span>
                </span>
              )}
              {/* Placeholder si no hay prob ni loading */}
              {!winProb && !loadingProb && (
                <span className="text-xs text-gray-400 h-8 flex items-center">
                  -
                </span>
              )}{" "}
              {/* Placeholder de altura */}
            </div>
            {/* Espaciador Central (opcional, visual) */}
            {/* <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div> */}
            {/* Probabilidad Visitor */}
            <div className="flex-1 px-1 flex flex-col items-center">
              {" "}
              {/* Centrado vertical */}
              {loadingProb && (
                <span className="text-xs text-gray-400 animate-pulse h-8 flex items-center">
                  Calculating...
                </span>
              )}{" "}
              {/* Placeholder de altura */}
              {winProb && !loadingProb && (
                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  {" "}
                  {/* Tamaño de texto aumentado */}
                  {(winProb.visitor_win_probability * 100).toFixed(0)}%
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                    Win Prob.
                  </span>
                </span>
              )}
              {!winProb && !loadingProb && (
                <span className="text-xs text-gray-400 h-8 flex items-center">
                  -
                </span>
              )}{" "}
              {/* Placeholder de altura */}
            </div>
          </div>
        )}
        {/* --- FIN FILA PROBABILIDADES --- */}
      </div>
    </div>
  );
}
export default GameCard;
