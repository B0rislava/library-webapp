export const useApi = () => {
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return null;

    try {
      const res = await fetch("http://127.0.0.1:8003/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");

      const data = await res.json();
      localStorage.setItem("accessToken", data.access_token);
      return data.access_token;
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/signin";
      return null;
    }
  };

  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    let headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    };

    let response = await fetch(`http://127.0.0.1:8003${url}`, {
      ...options,
      headers,
    });

    // if access token has expired
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Session expired");

      headers = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(`http://127.0.0.1:8003${url}`, {
        ...options,
        headers,
      });
    }

    if (response.status === 204) {
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Request failed");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  };

  return { authFetch };
};
