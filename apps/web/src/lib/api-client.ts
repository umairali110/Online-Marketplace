import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // localhost -> 127.0.0.1

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 5000, // ⬅️ YEH ADD KARO — 5 seconds ke baad request fail ho jayegi, hang nahi hogi
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    // ⬅️ YEH ADD KARO — /auth/me aur /auth/refresh khud ke 401 par
    // refresh-retry-redirect logic mat chalao, ye silent checks hain
    const isAuthCheckEndpoint =
      original?.url?.includes('/auth/me') || original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthCheckEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        queue.forEach((cb) => cb());
        queue = [];
        return api(original);
      } catch (refreshError) {
        queue = [];
        // ⬅️ Ye redirect ab sirf tab chalega jab koi PROTECTED page
        // (jaise /dashboard, /seller) ka request fail ho, homepage pe nahi
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);