// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Ajusta si tu backend corre en otro puerto/url

// MODIFICADO: Acepta una fecha (string YYYY-MM-DD)
export const getGamesByDate = async (dateString) => {
    try {
        // Llama al nuevo endpoint del backend, pasando la fecha como query param
        const response = await axios.get(`${API_BASE_URL}/games`, { // <- Endpoint cambiado a /games
            params: {
                date: dateString // El backend lo recibirá como req.query.date
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching games for date ${dateString} from backend:`, error);
        throw error;
    }
};

export const getGameStats = async (gameId) => {
    try {
        // La llamada a stats no cambia
        const response = await axios.get(`${API_BASE_URL}/games/${gameId}/stats`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stats for game ${gameId} from backend:`, error);
        throw error;
    }
};