// RUTA: client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getGamesByDate = async (dateString) => {
    if (!dateString) { console.error("getGamesByDate called without a dateString."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/games`, { params: { date: dateString } }); console.log("[API Service] getGamesByDate Response:", response.data); return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching games for date ${dateString}:`, error.response?.data || error.message); throw error; }
};

export const getBoxScoreByGameId = async (gameId) => {
    if (!gameId) { console.error("getBoxScoreByGameId called without a gameId."); return []; }
    try {
        const response = await axios.get(`${API_BASE_URL}/boxscores/${gameId}`); console.log(`[API Service] getBoxScoreByGameId Response for ${gameId}:`, response.data); return response.data || [];
    } catch (error) { console.error(`[API Service] Error fetching box score for GameID ${gameId}:`, error.response?.data || error.message); return []; }
};

export const getGameDetailsById = async (gameId, dateString) => {
    if (!gameId || !dateString) { console.error("getGameDetailsById called without gameId or dateString."); return null; }
    try {
        const response = await axios.get(`${API_BASE_URL}/games/${gameId}`, { params: { date: dateString } }); console.log(`[API Service] getGameDetailsById Response for ${gameId} on ${dateString}:`, response.data); return response.data;
    } catch (error) { console.error(`[API Service] Error fetching game details for ${gameId} on ${dateString}:`, error.response?.data || error.message); if (error.response?.status === 404) { return null; } return null; }
};

export const getLiveScores = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/live_scores`); if (response.data && response.data.length > 0) { console.log("[API Service] getLiveScores Response:", response.data); } return response.data || [];
    } catch (error) { console.warn(`[API Service] Error fetching live scores:`, error.response?.data || error.message); return []; }
};

// --- *** NUEVA FUNCIÓN PARA PREDICCIÓN DE VICTORIA *** ---
/**
 * Obtiene la probabilidad de victoria calculada por el backend.
 * @param {number|string} homeTeamId - ID del equipo local.
 * @param {number|string} visitorTeamId - ID del equipo visitante.
 * @returns {Promise<object|null>} - Promesa que resuelve a { home_win_probability, visitor_win_probability } o null.
 */
export const getWinProbability = async (homeTeamId, visitorTeamId) => {
    if (!homeTeamId || !visitorTeamId) {
        console.error("getWinProbability called without home or visitor team ID.");
        return null;
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/predictions/win_probability`, {
            params: {
                home_team_id: homeTeamId,
                visitor_team_id: visitorTeamId
            }
        });
        console.log(`[API Service] getWinProbability Response for H:${homeTeamId} V:${visitorTeamId}:`, response.data);
        return response.data;
    } catch (error) {
        console.warn(`[API Service] Error fetching win probability for H:${homeTeamId} V:${visitorTeamId}:`, error.response?.data || error.message);
        return null; // Devuelve null si falla para no mostrar nada
    }
};