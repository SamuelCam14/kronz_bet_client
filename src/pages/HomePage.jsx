import React, { useState, useEffect } from "react";
import { getGamesByDate } from "../services/api";
import GameCard from "../components/GameCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

const getTodaysDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function HomePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodaysDateString());

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching games for selected date: ${selectedDate}`);
        const data = await getGamesByDate(selectedDate);

        // --- PASO DE ORDENAMIENTO ---
        if (Array.isArray(data)) {
          // Ordena los juegos usando la propiedad 'datetime'
          // Usamos Date.parse() que convierte el string ISO a un timestamp numérico
          // o puedes usar new Date().getTime()
          const sortedData = [...data].sort((gameA, gameB) => {
            const timeA = gameA.datetime ? Date.parse(gameA.datetime) : 0; // Usa 0 o Infinity para manejar nulos/inválidos
            const timeB = gameB.datetime ? Date.parse(gameB.datetime) : 0;

            // Manejo básico de errores de parseo (NaN) o fechas faltantes
            if (isNaN(timeA) && isNaN(timeB)) return 0; // Ambos inválidos, no cambian orden relativo
            if (isNaN(timeA)) return 1; // Inválido A va después de válido B
            if (isNaN(timeB)) return -1; // Inválido B va antes de válido A

            return timeA - timeB; // Orden ascendente (más temprano primero)
          });
          console.log(
            "Sorted Games:",
            sortedData.map((g) => ({ id: g.id, datetime: g.datetime }))
          ); // Log para verificar orden
          setGames(sortedData); // Guarda los datos ORDENADOS en el estado
        } else {
          console.warn("API did not return an array, cannot sort:", data);
          setGames(data || []); // Si no es array, lo guarda tal cual (o vacío)
        }
        // --- FIN PASO DE ORDENAMIENTO ---
      } catch (err) {
        setError(`Failed to load games for ${selectedDate}. Please try again.`);
        console.error(err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedDate]);

  const handleCardClick = (gameId) => {
    setExpandedGameId((prevId) => (prevId === gameId ? null : gameId));
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    // --- El JSX del return no necesita cambios ---
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          NBA Games
        </h1>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
        />
      </div>

      {loading && (
        <div className="text-center mt-10">
          <LoadingSpinner />
        </div>
      )}
      {!loading && error && (
        <p className="text-red-500 text-center mt-10">{error}</p>
      )}

      {!loading && !error && (
        // El grid ahora renderizará las tarjetas en el orden establecido por setGames(sortedData)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isExpanded={expandedGameId === game.id}
                onCardClick={handleCardClick}
              />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 dark:text-gray-400 mt-10">
              No games found for {selectedDate}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
