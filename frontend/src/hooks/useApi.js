import { useState } from "react";

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Request failed");
    }

    return response.json();
  };

  return { authFetch };
};