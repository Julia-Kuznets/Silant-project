import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Добавляем "перехватчик" (interceptor).
// Он будет срабатывать перед КАЖДЫМ запросом.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Если токен есть, добавляем его в заголовки
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;