// RUTA: client/src/components/PlayerStatsRow.jsx
import React, { useState } from "react";

const PlayerDisplay = ({ player }) => {
  const playerId = player?.id;
  const firstName = player?.first_name || "";
  const lastName = player?.last_name || "Unknown";
  const initial = firstName ? `${firstName.charAt(0)}.` : "";
  const formattedName = `${initial} ${lastName}`;
  const imageUrl = playerId
    ? `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`
    : null;
  const [imageLoaded, setImageLoaded] = useState(!!imageUrl);
  const handleImageError = () => {
    setImageLoaded(false);
  };

  if (!playerId || !imageLoaded) {
    // Texto primario oscuro
    return (
      <span title={`${firstName} ${lastName}`} className="text-g-text-primary">
        {formattedName}
      </span>
    );
  }
  return (
    <div className="flex items-center space-x-2">
      {" "}
      <img
        src={imageUrl}
        alt={formattedName}
        title={`${firstName} ${lastName}`}
        className="h-8 w-8 rounded-full object-cover bg-g-dark-outline flex-shrink-0"
        onError={handleImageError}
        loading="lazy"
      />{" "}
      <span className="text-g-text-primary">{formattedName}</span>{" "}
    </div>
  );
};

function PlayerStatsRow({ playerStat }) {
  const player = playerStat.player || {};
  const minutes = playerStat.min || "-";
  const points = playerStat.pts ?? "-";
  const rebounds = playerStat.reb ?? "-";
  const assists = playerStat.ast ?? "-";
  const fgm = playerStat.fgm ?? "-";
  const fga = playerStat.fga ?? "-";
  const fgPct =
    playerStat.fg_pct !== null && playerStat.fg_pct !== undefined
      ? (playerStat.fg_pct * 100).toFixed(1) + "%"
      : "-";

  return (
    // Colores oscuros para borde, hover y texto secundario base
    <tr className="border-b border-g-dark-border hover:bg-g-dark-surface-hover text-xs sm:text-sm text-g-text-secondary">
      <td className="py-1 px-2 sm:px-3 text-left font-medium whitespace-nowrap">
        {" "}
        <PlayerDisplay player={player} />{" "}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center">{minutes}</td>
      {/* Texto primario para puntos */}
      <td className="py-2 px-1 sm:px-2 text-center font-semibold text-g-text-primary">
        {points}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center">{rebounds}</td>
      <td className="py-2 px-1 sm:px-2 text-center">{assists}</td>
      <td className="py-2 px-1 sm:px-2 text-center whitespace-nowrap">{`${fgm}-${fga}`}</td>
      <td className="py-2 px-1 sm:px-2 text-center">{fgPct}</td>
    </tr>
  );
}
export default PlayerStatsRow;
