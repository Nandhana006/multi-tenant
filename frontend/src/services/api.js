import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "/api";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hr_platform_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("hr_platform_token");
      localStorage.removeItem("hr_platform_user");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, required_role = null) => api.post("/auth/login", { email, password, required_role }),
  register: (data) => api.post("/auth/register", data),
  registerCompany: (data) => api.post("/auth/register-company", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};


export const documentAPI = {
  list: () => api.get("/documents"),
  upload: (formData) => api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (docId) => api.delete(`/documents/${docId}`),
};

export const companyAPI = {
  getEmployees: () => api.get("/companies/my/employees"),
  createEmployee: (data) => api.post("/companies/my/employees", data),
  getEmployeeChatHistory: (userId) => api.get(`/companies/my/employees/${userId}/chat-history`),
  getAuditLogs: () => api.get("/companies/my/logs"),
};


export const chatAPI = {
  ask: (question, topK = 4, history = []) => api.post("/chat", { question, top_k: topK, history }),
  getHistory: () => api.get("/chat/history"),
  clearHistory: () => api.delete("/chat/history"),
};

export const adminAPI = {
  getOverview: () => api.get("/admin/overview"),
  getUsers: () => api.get("/admin/users"),
  getCompanies: () => api.get("/companies"),
};

export default api;

