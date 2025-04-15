// RUTA: client/src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Clave para guardar en sessionStorage
const SESSION_STORAGE_KEY = "kronzSelectedDate";

function HomePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // *** CAMBIO: Inicializar 'selectedDate' desde sessionStorage o hoy ***
  const [selectedDate, setSelectedDate] = useState(() => {
    const storedDate = sessionStorage.getItem(SESSION_STORAGE_KEY);
    // Validar si la fecha almacenada tiene el formato correcto
    if (storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
      console.log(
        `[HomePage Init] Found valid date in sessionStorage: ${storedDate}`
      );
      return storedDate;
    }
    console.log(
      "[HomePage Init] No valid date in sessionStorage, defaulting to today."
    );
    return getTodaysDateString(); // Fallback a hoy
  });

  const navigate = useNavigate();

  // Efecto para CARGAR juegos (depende de selectedDate)
  useEffect(() => {
    console.log(`[HomePage Effect - Fetch] Running for date: ${selectedDate}`);
    setLoading(true);
    setError(null);
    let isMounted = true;

    const fetchInitialGames = async () => {
      if (!selectedDate || !/\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
        console.error(
          "[HomePage Effect - Fetch] Invalid or missing selectedDate:",
          selectedDate
        );
        if (isMounted) {
          setError("Invalid date selected.");
          setLoading(false);
          setGames([]);
        }
        return;
      }
      try {
        const initialData = await getGamesByDate(selectedDate);
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
        } else {
          console.warn(
            "[HomePage Effect - Fetch] API did not return an array."
          );
        }
        if (isMounted) {
          setGames(processedGames);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            `Failed to load games. ${err.message || "Check API connection."}`
          );
          setGames([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("[HomePage Effect - Fetch] Loading finished.");
        }
      }
    };
    fetchInitialGames();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // *** NUEVO EFECTO: Guardar selectedDate en sessionStorage cuando cambie ***
  useEffect(() => {
    console.log(
      `[HomePage Effect - Save] Saving date to sessionStorage: ${selectedDate}`
    );
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, selectedDate);
    }
  }, [selectedDate]); // Se ejecuta cada vez que selectedDate se actualiza

  // Handler para navegar (pasa la fecha en el state)
  const handleCardClick = (gameId, gameDate) => {
    if (!gameId || !gameDate) {
      console.error("handleCardClick missing gameId or gameDate");
      return;
    }
    console.log(
      `[HomePage] Navigating to game details for ID: ${gameId} on Date: ${gameDate}`
    );
    navigate(`/game/${gameId}`, { state: { gameDate: gameDate } });
  };

  // Handler para el input de fecha
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    console.log("[HomePage] Date input changed to:", newDate);
    // Validar antes de actualizar el estado (el input type=date suele dar formato correcto)
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      setSelectedDate(newDate);
    } else {
      console.warn("Invalid date selected from input:", newDate);
      // Opcional: podrías mostrar un error al usuario
    }
  };

  // --- Renderizado (sin cambios) ---
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          NBA Games
        </h1>
        <input
          type="date"
          value={selectedDate || ""}
          onChange={handleDateChange}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
          aria-label="Select game date"
        />
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
                // Pasa la fecha del juego O la fecha seleccionada como fallback
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
          )}
        </div>
      )}
    </div>
  );
}
export default HomePage;
