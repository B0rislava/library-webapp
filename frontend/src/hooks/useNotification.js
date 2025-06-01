import { useState } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    isError: false,
  });

  const showNotification = (message, isError = false) => {
    setNotification({ open: true, message, isError });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return { notification, showNotification, closeNotification };
};