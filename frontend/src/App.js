import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import BooksPage from "./pages/BooksPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import BookDetail from "./pages/BookDetail";

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/" && localStorage.getItem("accessToken");

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route
          path="/books"
          element={
            <PrivateRoute>
              <BooksPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/books/:id"
          element={
            <PrivateRoute>
              <BookDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
