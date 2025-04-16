// RUTA: client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Obtiene los juegos para una fecha específica desde el backend Python.
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de juegos.
 */
export const getGamesByDate = async (dateString) => {
    if (!dateString) { console.error("getGamesByDate called without a dateString."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/games`, { params: { date: dateString } });
        console.log("[API Service] getGamesByDate Response:", response.data);
        return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching games for date ${dateString}:`, error.response?.data || error.message); throw error; }
};

/**
 * Obtiene los datos del box score transformados desde el backend Python usando el GameID.
 * @param {string} gameId - El GameID de NBA.com (obtenido de la lista de juegos).
 * @returns {Promise<Array>} - Promesa que resuelve a un array de stats de jugadores transformadas.
 */
export const getBoxScoreByGameId = async (gameId) => {
    if (!gameId) { console.error("getBoxScoreByGameId called without a gameId."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/boxscores/${gameId}`);
        console.log(`[API Service] getBoxScoreByGameId Response for ${gameId}:`, response.data);
        return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching box score for GameID ${gameId}:`, error.response?.data || error.message); return []; }
};

/**
 * Obtiene los detalles completos (info general + period scores) para un GameID específico EN UNA FECHA DADA.
 * @param {string} gameId - El GameID de NBA.com.
 * @param {string} dateString - La fecha del juego en formato 'YYYY-MM-DD'.
 * @returns {Promise<object|null>} - Promesa que resuelve al objeto del juego o null.
 */
export const getGameDetailsById = async (gameId, dateString) => {
    if (!gameId || !dateString) { console.error("getGameDetailsById called without gameId or dateString."); return null; }
    try {
        const response = await axios.get(`${API_BASE_URL}/games/${gameId}`, { params: { date: dateString } });
        console.log(`[API Service] getGameDetailsById Response for ${gameId} on ${dateString}:`, response.data);
        return response.data;
    } catch (error) { console.error(`[API Service] Error fetching game details for ${gameId} on ${dateString}:`, error.response?.data || error.message); if (error.response?.status === 404) { return null; } return null; }
};

// --- *** NUEVA FUNCIÓN PARA SCORES EN VIVO *** ---
/**
 * Obtiene los datos simplificados del scoreboard en vivo actual.
 * @returns {Promise<Array>} - Promesa que resuelve a un array de objetos de juego en vivo.
 */
export const getLiveScores = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/live_scores`);
        // Loguear solo si hay datos para no llenar la consola
        if (response.data && response.data.length > 0) {
            console.log("[API Service] getLiveScores Response:", response.data);
        }
        return response.data || [];
    } catch (error) {
        // Loguear como warning ya que el polling puede fallar ocasionalmente
        console.warn(`[API Service] Error fetching live scores:`, error.response?.data || error.message);
        return []; // Devuelve array vacío para que el polling no rompa la app
    }
};