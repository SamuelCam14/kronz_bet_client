// RUTA: client/src/components/GameCard.jsx
import React, { useState, useEffect } from "react";
import { format, parseISO, isToday, isValid } from "date-fns";
import { getLogoSrc } from "../utils/teamLogos";
import { getWinProbability } from "../services/api";

// Función de formato (simplificada para colores dark)
const formatGameTimeOrStatus = (game) => {
  const dt = game.datetime;
  const st = game.status || "";
  const p = game.period || 0;
  const isF = st.toLowerCase() === "final" || st.toLowerCase().startsWith("f/");
  if (isF)
    return (
      <span className="font-medium text-sm text-g-text-secondary">FIN</span>
    ); // Texto secundario
  const isL = st.match(/Q[1-4]|OT|Halftime/i);
  if (p > 0 || isL) {
    const dS = isL ? st : "LIVE";
    return (
      <span className="font-bold text-green-400 animate-pulse text-sm">
        {dS}
      </span>
    );
  } // Verde LIVE
  if (dt) {
    try {
      const gD = parseISO(dt);
      if (isValid(gD)) {
        const gIT = isToday(gD);
        const lts = format(gD, "HH:mm");
        if (lts === "00:00" && dt.endsWith("T00:00:00Z")) {
          return (
            <span className="font-medium text-sm text-g-text-secondary">
              {gIT ? "Hoy" : format(gD, "dd/MM/yy")}
            </span>
          );
        }
        return (
          <div className="flex flex-col items-center text-center">
            <span className="font-medium text-sm text-g-text-secondary">
              {gIT ? "Hoy" : format(gD, "dd/MM/yy")}
            </span>
            <span className="text-xs text-gray-400">{lts}</span>
          </div>
        );
      }
    } catch (e) {}
  }
  return <span className="text-xs text-yellow-600">{st || "N/A"}</span>; // Amarillo TBD/PPD
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
  const [winProb, setWinProb] = useState(null);
  const [loadingProb, setLoadingProb] = useState(false);
  useEffect(() => {
    setWinProb(null);
    setLoadingProb(false);
    const hId = game?.home_team?.id;
    const vId = game?.visitor_team?.id;
    if (isUpcoming && hId && vId) {
      setLoadingProb(true);
      let iM = true;
      getWinProbability(hId, vId)
        .then((d) => {
          if (iM && d) setWinProb(d);
        })
        .catch((e) => console.error(e))
        .finally(() => {
          if (iM) setLoadingProb(false);
        });
      return () => {
        iM = false;
      };
    }
  }, [game?.id, isUpcoming, game?.home_team?.id, game?.visitor_team?.id]);

  return (
    <div
      className={`bg-g-dark-surface rounded-xl shadow-md overflow-hidden border border-g-dark-border`}
    >
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-g-dark-surface-hover"
        onClick={() => onCardClick(game.id, game.date?.split("T")[0] || null)}
      >
        <div className="flex justify-between items-center mb-3">
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
                    className={`${scoreSizeClass} ${scoreWeightClass} text-g-text-primary`}
                  >
                    {game.home_team_score ?? "-"}
                  </span>
                  {homeWins && (
                    <WinnerIndicator className="ml-1.5 sm:ml-2 text-g-text-secondary" />
                  )}
                </div>
              )}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-g-text-secondary truncate block w-full`}
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
                    <WinnerIndicator className="mr-1.5 sm:mr-2 text-g-text-secondary transform rotate-180" />
                  )}
                  <span
                    className={`${scoreSizeClass} ${scoreWeightClass} text-g-text-primary`}
                  >
                    {game.visitor_team_score ?? "-"}
                  </span>
                </div>
              )}
              <span
                className={`${teamNameSizeClass} ${teamNameWeightClass} text-g-text-secondary truncate block w-full text-right`}
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
        {/* Fila Inferior (Probabilidades) */}
        {isUpcoming && (
          <div className="mt-2 pt-3 border-t border-g-dark-border flex justify-around items-center text-center">
            <div className="flex-1 px-1 flex flex-col items-center">
              {loadingProb && (
                <span className="text-xs text-g-text-secondary animate-pulse h-8 flex items-center">
                  Calculating...
                </span>
              )}
              {/* Usa color link */}
              {winProb && !loadingProb && (
                <span className="text-base font-semibold text-g-text-link">
                  {(winProb.home_win_probability * 100).toFixed(0)}%
                  <span className="block text-xs font-normal text-g-text-secondary mt-0.5">
                    Win Prob.
                  </span>
                </span>
              )}
              {!winProb && !loadingProb && (
                <span className="text-xs text-g-text-secondary h-8 flex items-center">
                  -
                </span>
              )}
            </div>
            <div className="flex-1 px-1 flex flex-col items-center">
              {loadingProb && (
                <span className="text-xs text-g-text-secondary animate-pulse h-8 flex items-center">
                  Calculating...
                </span>
              )}
              {winProb && !loadingProb && (
                <span className="text-base font-semibold text-g-text-link">
                  {(winProb.visitor_win_probability * 100).toFixed(0)}%
                  <span className="block text-xs font-normal text-g-text-secondary mt-0.5">
                    Win Prob.
                  </span>
                </span>
              )}
              {!winProb && !loadingProb && (
                <span className="text-xs text-g-text-secondary h-8 flex items-center">
                  -
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default GameCard;
