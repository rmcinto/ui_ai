/**
 * api.ts
 * A simple helper for making API requests to the FastAPI backend.
 * You might want to install axios: `npm install axios` or just use fetch.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust as needed
})

export default api
