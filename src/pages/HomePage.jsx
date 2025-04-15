// RUTA: client/src/pages/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { getGamesByDate } from "../services/api";
import GameCard from "../components/GameCard";
// *** Import nombrado ***
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
  // Inicialización del estado para la fecha
  const [selectedDate, setSelectedDate] = useState(getTodaysDateString());

  // Efecto principal para carga
  useEffect(() => {
    console.log(
      `[HomePage Effect] Running. Current selectedDate state: ${selectedDate}`
    );
    setLoading(true);
    setError(null);

    let isMounted = true;

    const fetchInitialGames = async () => {
      // --- *** GUARDIA IMPORTANTE *** ---
      // Verifica que selectedDate sea válido ANTES de hacer la llamada API
      // Usa el valor MÁS RECIENTE del estado en el momento de la ejecución.
      if (!selectedDate || !/\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
        console.error(
          "[HomePage Effect] Invalid or missing selectedDate BEFORE API call:",
          selectedDate
        );
        if (isMounted) {
          // Establece un error claro y detiene la carga
          setError("Invalid date state detected on load.");
          setLoading(false);
          setGames([]); // Asegura que no haya juegos mostrándose
        }
        return; // Detiene la ejecución de esta función
      }
      // --- *** FIN DE LA GUARDIA *** ---

      console.log(
        `[HomePage Effect] Proceeding to fetch games for valid date: ${selectedDate}`
      );
      try {
        const initialData = await getGamesByDate(selectedDate); // Ahora selectedDate debería ser válido
        console.log(
          "[HomePage Effect] Raw data received from API Service:",
          initialData
        );

        let processedGames = [];
        if (Array.isArray(initialData)) {
          processedGames = [...initialData].sort((a, b) => {
            const timeA = a?.datetime ? Date.parse(a.datetime) : 0;
            const timeB = b?.datetime ? Date.parse(b.datetime) : 0;
            if (isNaN(timeA) && isNaN(timeB)) return 0;
            if (isNaN(timeA) || !a?.datetime) return 1;
            if (isNaN(timeB) || !b?.datetime) return -1;
            return timeA - timeB;
          });
          console.log(
            `[HomePage Effect] Initial data sorted. Processed ${processedGames.length} games.`
          );
        } else {
          console.warn("[HomePage Effect] API did not return an array.");
        }

        console.log(
          "[HomePage Effect] Attempting to set games state with:",
          processedGames
        );
        if (isMounted) {
          setGames(processedGames);
          setError(null); // Limpia error si la llamada fue exitosa (incluso si devuelve [])
        }
      } catch (err) {
        console.error(
          "[HomePage Effect] Error during getGamesByDate call:",
          err
        );
        if (isMounted) {
          setError(
            `Failed to load games. ${err.message || "Check API connection."}`
          );
          setGames([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("[HomePage Effect] Loading finished.");
        }
      }
    };

    fetchInitialGames();

    return () => {
      isMounted = false;
    };
    // El efecto depende solo de selectedDate. Si cambia, se ejecuta de nuevo.
  }, [selectedDate]);

  const handleCardClick = (gameId) => {
    setExpandedGameId((prevId) => (prevId === gameId ? null : gameId));
  };

  // Actualiza el estado cuando el input de fecha cambia
  const handleDateChange = (event) => {
    console.log("[HomePage] Date input changed to:", event.target.value);
    setSelectedDate(event.target.value);
  };

  // --- Renderizado ---
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          NBA Games
        </h1>
        {/* *** ARREGLO INPUT: value={selectedDate || ''} *** */}
        <input
          type="date"
          value={selectedDate || ""} // Asegura que siempre sea un string controlado
          onChange={handleDateChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
          aria-label="Select game date"
        />
      </div>

      {/* Lógica de renderizado condicional (sin cambios) */}
      {loading && (
        <div className="text-center mt-10 flex flex-col items-center text-gray-500 dark:text-gray-400">
          <LoadingSpinner />
          <p className="mt-2">Loading games for {selectedDate}...</p>
        </div>
      )}
      {!loading && error && (
        <div className="text-center mt-10 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p className="mt-1 text-sm">
            Please try selecting another date or refreshing.
          </p>
        </div>
      )}
      {!loading && !error && (
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
            // Muestra este mensaje si games está vacío DESPUÉS de cargar y SIN error
            <div className="col-span-full text-center mt-10 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-600 dark:text-gray-400">
                {" "}
                No games found scheduled for{" "}
                {selectedDate || "the selected date"}.{" "}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
