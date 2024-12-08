import React from 'react'
// import "./Login.css"; // CSS file for styling
import '../assets/css/login.css'
import Button from './Button'
import { Images } from '@renderer/constant/Image'
const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={Images.logo} alt="Terescrow Logo" />
        </div>
        <h2>Login</h2>
        <p>Login to your admin dashboard</p>
        <form>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Johndoes@example.com" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="********" required />
          </div>
          <div className="input-group">
            <Button title="Sign Up" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
