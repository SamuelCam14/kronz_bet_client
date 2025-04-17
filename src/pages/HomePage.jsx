// RUTA: client/src/pages/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getGamesByDate, getLiveScores } from "../services/api"; // Importa getLiveScores
import GameCard from "../components/GameCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

const getTodaysDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const SESSION_STORAGE_KEY = "kronzSelectedDate";

// Helper para saber si hacer polling
const shouldPoll = (selectedDate, gamesList) => {
  if (selectedDate !== getTodaysDateString()) return false;
  // Hacer polling si hay algún juego que no sea estrictamente "Final" o "F/"
  return gamesList.some(
    (game) =>
      !game.status?.toLowerCase().startsWith("final") &&
      !game.status?.toLowerCase().startsWith("f/")
  );
};

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
  const intervalRef = useRef(null); // Ref para el intervalo de polling

  // --- Función para buscar y aplicar updates en vivo ---
  const fetchLiveUpdates = useCallback(async () => {
    console.log("[Polling] Fetching live score updates...");
    try {
      const liveUpdateData = await getLiveScores();
      if (liveUpdateData && liveUpdateData.length > 0) {
        setGames((prevGames) => {
          const updatesMap = new Map(liveUpdateData.map((g) => [g.id, g]));
          let stateChanged = false;
          const updatedGames = prevGames.map((prevGame) => {
            const update = updatesMap.get(prevGame.id);
            if (update) {
              if (
                prevGame.home_team_score !== update.home_team_score ||
                prevGame.visitor_team_score !== update.visitor_team_score ||
                prevGame.status !== update.status ||
                prevGame.period !== update.period
              ) {
                console.log(
                  `[Polling] Updating game ${prevGame.id}: Score ${update.visitor_team_score}-${update.home_team_score}, Status: ${update.status}`
                );
                stateChanged = true;
                return {
                  ...prevGame,
                  home_team_score: update.home_team_score,
                  visitor_team_score: update.visitor_team_score,
                  status: update.status,
                  period: update.period,
                };
              }
            }
            return prevGame;
          });
          if (stateChanged)
            console.log("[Polling] Game state updated with live data.");
          return stateChanged ? updatedGames : prevGames; // Actualiza solo si hubo cambios
        });
      } else {
        console.log("[Polling] No live updates received.");
      }
    } catch (err) {
      console.error("[Polling] Error during live update fetch process:", err);
    }
  }, []); // Sin dependencias

  // --- Efecto para carga inicial Y control de polling ---
  useEffect(() => {
    console.log(`[HomePage Effect] Running for date: ${selectedDate}`);
    setLoading(true);
    setError(null);

    // Limpiar intervalo anterior SIEMPRE al iniciar
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("[HomePage Effect] Cleared previous interval.");
    }
    let isMounted = true;

    const fetchInitialGamesAndSetupPolling = async () => {
      if (!selectedDate || !/\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
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
            const tA = a?.datetime ? Date.parse(a.datetime) : 0;
            const tB = b?.datetime ? Date.parse(b.datetime) : 0;
            if (isNaN(tA) && isNaN(tB)) return 0;
            if (isNaN(tA) || !a?.datetime) return 1;
            if (isNaN(tB) || !b?.datetime) return -1;
            return tA - tB;
          });
        } else {
          console.warn("[HomePage Effect] API did not return an array.");
        }

        if (isMounted) {
          setGames(processedGames); // Establece juegos iniciales
          setError(null);
          // Iniciar polling SI aplica (hoy y juegos no finales)
          if (shouldPoll(selectedDate, processedGames)) {
            console.log(
              "[HomePage Effect] Initial load complete. Starting polling (Interval: 30s)."
            );
            fetchLiveUpdates(); // Llamada inicial
            intervalRef.current = setInterval(fetchLiveUpdates, 30000); // Intervalo de 30 segundos
          } else {
            console.log(
              "[HomePage Effect] Initial load complete. Polling not needed."
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to load games. ${err.message || "Check API."}`);
          setGames([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("[HomePage Effect] Loading finished.");
        }
      }
    };
    fetchInitialGamesAndSetupPolling();
    // Limpieza del efecto
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log(
          "[HomePage Effect] Cleared interval on cleanup/date change."
        );
      }
    };
  }, [selectedDate, fetchLiveUpdates]); // Depende de fecha y función memoizada

  // Efecto para guardar fecha en sessionStorage
  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, selectedDate);
    }
  }, [selectedDate]);

  // Handlers
  const handleCardClick = (gameId, gameDate) => {
    if (!gameId || !gameDate) return;
    navigate(`/game/${gameId}`, { state: { gameDate: gameDate } });
  };
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      setSelectedDate(newDate);
    }
  };

  // Renderizado
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
