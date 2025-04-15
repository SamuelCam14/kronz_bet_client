// RUTA: client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getGamesByDate = async (dateString) => {
    if (!dateString) { console.error("getGamesByDate called without a dateString."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/games`, { params: { date: dateString } });
        console.log("[API Service] getGamesByDate Response:", response.data);
        return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching games for date ${dateString}:`, error.response?.data || error.message); throw error; }
};

export const getBoxScoreByGameId = async (gameId) => {
    if (!gameId) { console.error("getBoxScoreByGameId called without a gameId."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/boxscores/${gameId}`);
        console.log(`[API Service] getBoxScoreByGameId Response for ${gameId}:`, response.data);
        return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching box score for GameID ${gameId}:`, error.response?.data || error.message); return []; }
};

// --- getGameDetailsById MODIFICADO PARA ENVIAR LA FECHA ---
/**
 * Obtiene los detalles completos para un GameID específico EN UNA FECHA DADA.
 * @param {string} gameId - El GameID de NBA.com.
 * @param {string} dateString - La fecha del juego en formato 'YYYY-MM-DD'.
 * @returns {Promise<object|null>} - Promesa que resuelve al objeto del juego o null.
 */
export const getGameDetailsById = async (gameId, dateString) => { // <--- Añadido dateString
    if (!gameId || !dateString) {
        console.error("getGameDetailsById called without gameId or dateString.");
        return null;
    }
    try {
        // Llama al endpoint GET /api/games/{game_id} y pasa la fecha como query param
        const response = await axios.get(`${API_BASE_URL}/games/${gameId}`, {
            params: { date: dateString } // <--- Envía la fecha aquí
        });
        console.log(`[API Service] getGameDetailsById Response for ${gameId} on ${dateString}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[API Service] Error fetching game details for ${gameId} on ${dateString}:`, error.response?.data || error.message);
        if (error.response?.status === 404) { return null; }
        return null;
    }
};