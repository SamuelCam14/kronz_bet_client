// RUTA: client/src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGamesByDate } from "../services/api";
import GameCard from "../components/GameCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

const getTodaysDateString = () => {
  /* ... */ const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const SESSION_STORAGE_KEY = "kronzSelectedDate"; // Para la fecha del calendario
const SESSION_GAME_DATE_PREFIX = "kronzGameDate_"; // Prefijo para fecha de juego específico

function HomePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const storedDate = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
      return storedDate;
    }
    return getTodaysDateString();
  });
  const navigate = useNavigate();

  // Efecto para CARGAR juegos
  useEffect(() => {
    console.log(`[HomePage Effect - Fetch] Running for date: ${selectedDate}`);
    setLoading(true);
    setError(null);
    let isMounted = true;
    const fetchInitialGames = async () => {
      if (!selectedDate || !/\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
        if (isMounted) {
          setError("Invalid date selected.");
          setLoading(false);
          setGames([]);
        }
        return;
      }
      try {
        const d = await getGamesByDate(selectedDate);
        let p = [];
        if (Array.isArray(d)) {
          p = [...d].sort((a, b) => {
            const tA = a?.datetime ? Date.parse(a.datetime) : 0;
            const tB = b?.datetime ? Date.parse(b.datetime) : 0;
            if (isNaN(tA) && isNaN(tB)) return 0;
            if (isNaN(tA) || !a?.datetime) return 1;
            if (isNaN(tB) || !b?.datetime) return -1;
            return tA - tB;
          });
        }
        if (isMounted) {
          setGames(p);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e.message || "Failed");
          setGames([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchInitialGames();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Efecto para GUARDAR fecha seleccionada
  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, selectedDate);
    }
  }, [selectedDate]);

  // Handler para navegar Y GUARDAR FECHA DEL JUEGO
  const handleCardClick = (gameId, gameDate) => {
    if (!gameId || !gameDate) {
      console.error("handleCardClick missing gameId or gameDate");
      return;
    }
    console.log(
      `[HomePage] Navigating to game details for ID: ${gameId} on Date: ${gameDate}`
    );
    try {
      // *** NUEVO: Guardar la fecha específica de este juego en sessionStorage ***
      sessionStorage.setItem(`${SESSION_GAME_DATE_PREFIX}${gameId}`, gameDate);
      console.log(
        `[HomePage] Saved gameDate ${gameDate} to sessionStorage for key ${SESSION_GAME_DATE_PREFIX}${gameId}`
      );
      // Navega pasando la fecha en el state (para carga inicial sin refresh)
      navigate(`/game/${gameId}`, { state: { gameDate: gameDate } });
    } catch (e) {
      console.error("Error saving gameDate to sessionStorage:", e);
      // Opcional: Navegar igualmente aunque falle el sessionStorage?
      // navigate(`/game/${gameId}`, { state: { gameDate: gameDate } });
      setError("Could not prepare navigation. Please try again."); // Muestra un error si falla el guardado
    }
  };

  const handleDateChange = (event) => {
    const d = event.target.value;
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setSelectedDate(d);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 px-2">
        {" "}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          NBA Games
        </h1>{" "}
        <input
          type="date"
          value={selectedDate || ""}
          onChange={handleDateChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
          aria-label="Select game date"
        />{" "}
      </div>
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
          <p className="mt-1 text-sm">Please try again.</p>
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {" "}
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onCardClick={(id) =>
                  handleCardClick(id, game.date?.split("T")[0] || selectedDate)
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center mt-10 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-600 dark:text-gray-400">
                {" "}
                No games found scheduled for{" "}
                {selectedDate || "the selected date"}.{" "}
              </p>
            </div>
          )}{" "}
        </div>
      )}
    </div>
  );
}
export default HomePage;
