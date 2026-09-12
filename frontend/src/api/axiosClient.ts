import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access token to every API request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired access tokens
axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    // Don't attempt token refresh for authentication endpoints
    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refreshToken");

      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {
            refreshToken,
          }
        );

        const newAccessToken =
          response.data.accessToken;

        localStorage.setItem(
          "accessToken",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original failed request
        return axiosClient(originalRequest);

      } catch (refreshError) {
        clearSession();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    window.location.href = "/login";
  }
}

export default axiosClient;