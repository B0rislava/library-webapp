export const useApi = () => {
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    };

    const response = await fetch(`http://127.0.0.1:8003${url}`, {
      ...options,
      headers,
    });

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