import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// export const adminAPI = {
//   uploadGoldenImage: (formData) =>
//     api.post("/api/admin/golden-image", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),
//   getGoldenImage: () => api.get("/api/admin/golden-image"),
export const adminAPI = {
  uploadGoldenImage: (formData) =>
    api.post("/api/admin/golden-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getGoldenImage: () => api.get("/api/admin/golden-image"),
  deleteGoldenImage: () => api.delete("/api/admin/golden-image"),
  getSubmissions: () => api.get("/api/admin/submissions"),
  deleteSubmission: (id) => api.delete(`/api/admin/submissions/${id}`),
  reset: () => api.post("/api/admin/reset"),
};

export const submissionsAPI = {
  submit: (formData) =>
    api.post("/api/submissions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getLeaderboard: () => api.get("/api/submissions/leaderboard"),
  getTeam: (teamName) => api.get(`/api/submissions/team/${encodeURIComponent(teamName)}`),
};

export const roundAPI = {
  get: () => api.get("/api/round"),
  start: (config) => api.post("/api/round/start", config),
  lock: () => api.post("/api/round/lock"),
  sync: () => api.post("/api/round/sync"),
};

export default api;
