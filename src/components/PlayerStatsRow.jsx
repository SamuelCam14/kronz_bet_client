// RUTA: client/src/components/PlayerStatsRow.jsx
import React, { useState } from "react";

// Componente para mostrar la foto o las iniciales/nombre formateado
const PlayerDisplay = ({ player }) => {
  const playerId = player?.id;
  const firstName = player?.first_name || "";
  const lastName = player?.last_name || "Unknown";
  const initial = firstName ? `${firstName.charAt(0)}.` : "";
  const formattedName = `${initial} ${lastName}`;

  // URL estándar para headshots de NBA
  const imageUrl = playerId
    ? `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`
    : null;

  // Estado para manejar si la imagen cargó correctamente
  const [imageLoaded, setImageLoaded] = useState(!!imageUrl); // Inicia true si hay URL

  const handleImageError = () => {
    // Si la imagen falla al cargar, cambia el estado para mostrar el nombre
    console.warn(
      `Headshot not found for player ID: ${playerId}, defaulting to name.`
    );
    setImageLoaded(false);
  };

  // Si no hay ID o la imagen falló, muestra el nombre formateado
  if (!playerId || !imageLoaded) {
    return <span title={`${firstName} ${lastName}`}>{formattedName}</span>;
  }

  // Si hay ID y la imagen (aún) no ha fallado, intenta mostrarla
  return (
    <div className="flex items-center space-x-2">
      <img
        src={imageUrl}
        alt={formattedName}
        title={`${firstName} ${lastName}`} // Tooltip con nombre completo
        className="h-8 w-8 rounded-full object-cover bg-gray-200 dark:bg-gray-600 flex-shrink-0" // Tamaño pequeño, redondo, con fondo fallback
        onError={handleImageError} // Llama a esta función si la imagen no carga (404 etc.)
        loading="lazy" // Carga diferida para imágenes en tablas largas
      />
      {/* Mostramos el nombre formateado al lado también */}
      <span>{formattedName}</span>
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

  // Opcional: Filtrar DNP (Did Not Play) si minutos es 0 o nulo/vacío
  // if (!minutes || minutes === '0' || minutes === '00' || minutes.startsWith('0:')) {
  //    return null;
  // }

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-sm">
      {/* Columna Player con Foto o Nombre */}
      <td className="py-1 px-2 sm:px-3 text-left font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
        <PlayerDisplay player={player} />
      </td>
      {/* Resto de columnas de estadísticas */}
      <td className="py-2 px-1 sm:px-2 text-center text-gray-600 dark:text-gray-400">
        {minutes}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center font-semibold text-gray-800 dark:text-gray-200">
        {points}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center text-gray-600 dark:text-gray-400">
        {rebounds}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center text-gray-600 dark:text-gray-400">
        {assists}
      </td>
      <td className="py-2 px-1 sm:px-2 text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{`${fgm}-${fga}`}</td>
      <td className="py-2 px-1 sm:px-2 text-center text-gray-600 dark:text-gray-400">
        {fgPct}
      </td>
    </tr>
  );
}

export default PlayerStatsRow; // Exporta como default
