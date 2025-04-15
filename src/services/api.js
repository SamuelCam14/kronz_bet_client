// RUTA: client/src/services/api.js
import axios from 'axios';

// --- ¡CAMBIO PRINCIPAL AQUÍ! ---
// Apunta a tu backend Python que corre (normalmente) en el puerto 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Obtiene los juegos para una fecha específica desde el backend Python.
 * Debería devolver un array de juegos incluyendo el 'id' que es el GameID de NBA.com.
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de juegos.
 */
export const getGamesByDate = async (dateString) => {
    if (!dateString) {
        console.error("getGamesByDate called without a dateString.");
        return [];
    }
    try {
        // La ruta del endpoint GET /api/games?date=... no cambia
        const response = await axios.get(`${API_BASE_URL}/games`, { // <--- Usa la nueva URL base
            params: {
                date: dateString
            }
        });
        console.log("[API Service] getGamesByDate Response:", response.data); // Log para verificar datos
        return response.data || [];
    } catch (error) {
        console.error(`[API Service] Error fetching games for date ${dateString}:`, error.response?.data || error.message);
        throw error; // Propaga para que HomePage lo maneje
    }
};


// --- ELIMINAMOS getGameUpdates y getBoxScore(date, home, visitor) ---
// Ya no hacemos polling ni buscamos boxscore por equipos/fecha aquí.

/**
 * Obtiene los datos del box score transformados desde el backend Python usando el GameID.
 * @param {string} gameId - El GameID de NBA.com (obtenido de la lista de juegos).
 * @returns {Promise<Array>} - Promesa que resuelve a un array de stats de jugadores transformadas.
 */
export const getBoxScoreByGameId = async (gameId) => {
    if (!gameId) {
        console.error("getBoxScoreByGameId called without a gameId.");
        return [];
    }
    try {
        // Llama a la nueva ruta del backend GET /api/boxscores/{game_id}
        const response = await axios.get(`${API_BASE_URL}/boxscores/${gameId}`); // <--- Nueva ruta y URL base
        console.log(`[API Service] getBoxScoreByGameId Response for ${gameId}:`, response.data); // Log para verificar datos
        return response.data || [];
    } catch (error) {
        console.error(`[API Service] Error fetching box score for GameID ${gameId}:`, error.response?.data || error.message);
        // Devuelve array vacío para manejo elegante en GameDetails
        return [];
    }
};

// --- Mantenemos getGameStats si AÚN lo necesitas para algo más ---
// --- pero GameDetails YA NO lo usará ---
// export const getGameStats = async (gameId) => { /* ... código anterior si es necesario ... */ };