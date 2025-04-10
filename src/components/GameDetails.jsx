// src/components/GameDetails.jsx
import React, { useState, useEffect } from "react";
import { getGameStats } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";

function GameDetails({ gameId }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getGameStats(gameId);
        // Podrías necesitar procesar/agrupar 'data' aquí si la API devuelve una lista plana
        setStats(data);
        setError(null);
      } catch (err) {
        setError("Failed to load game stats.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchStats();
    }
  }, [gameId]); // Se ejecuta cada vez que gameId cambia

  if (loading)
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
      </div>
    );
  if (error) return <p className="p-4 text-red-500 text-center">{error}</p>;
  if (!stats || stats.length === 0)
    return (
      <p className="p-4 text-center text-gray-500">
        No stats available for this game yet.
      </p>
    );

  // Agrupa stats por equipo y luego renderiza (esto es un ejemplo, ajusta según la API)
  const homeStats = stats.filter(
    (s) => s.team.id === stats[0]?.game.home_team_id
  ); // Asume que puedes obtener el team_id
  const visitorStats = stats.filter(
    (s) => s.team.id === stats[0]?.game.visitor_team_id
  );

  const renderPlayerStats = (playerStats) => (
    <div
      key={playerStats.player.id}
      className="flex justify-between py-1 text-sm"
    >
      <span>
        {playerStats.player.first_name} {playerStats.player.last_name}
      </span>
      <span className="font-mono">
        {String(playerStats.pts ?? "-").padStart(2)} PTS /{" "}
        {String(playerStats.reb ?? "-").padStart(2)} REB /{" "}
        {String(playerStats.ast ?? "-").padStart(2)} AST
      </span>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700">
      <h4 className="font-semibold mb-2 text-center">Game Stats</h4>
      {/* Aquí renderizarías las stats, quizá en dos columnas o tabs para equipos */}
      {/* Ejemplo simple: */}
      <div className="mb-4">
        <h5 className="font-medium mb-1">
          {stats[0]?.team.full_name || "Home Team"}
        </h5>
        {homeStats.map(renderPlayerStats)}
      </div>
      <div>
        <h5 className="font-medium mb-1">
          {stats.find((s) => s.team.id !== stats[0]?.game.home_team_id)?.team
            .full_name || "Visitor Team"}
        </h5>
        {visitorStats.map(renderPlayerStats)}
      </div>
      {/* Idealmente usar una tabla para mejor alineación */}
    </div>
  );
}

export default GameDetails;
