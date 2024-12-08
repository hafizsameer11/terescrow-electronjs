import React from "react";
// import "./Login.css"; // CSS file for styling
import '../assets/css/login.css'
const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src="/assets/logo.png" alt="Terescrow Logo" />
        </div>
        <h2>Login</h2>
        <p>Login to your admin dashboard</p>
        <form>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Johndoes@example.com" required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
