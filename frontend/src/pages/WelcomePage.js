import { Link } from "react-router-dom";

function WelcomePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", textAlign: "center" }}>
      <h1>Welcome to the Library System</h1>
      <Link to="/signin">
        <button style={{ margin: "1rem" }}>Sign In</button>
      </Link>
      <Link to="/signup">
        <button style={{ margin: "1rem" }}>Sign Up</button>
      </Link>
    </div>
  );
}

export default WelcomePage;
