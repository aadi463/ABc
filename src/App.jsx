import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import strykerLogo from "./assets/stryker.png";
import birlasoftLogo from "./assets/birlasoft.png";

/* ---------- AUTH CONTEXT ---------- */
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- NAVBAR ---------- */
function Navbar() {
  const { token, logout } = useContext(AuthContext);
  if (!token) return null;

  return (
    <nav className="navbar">
      <span>Dashboard</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

/* ---------- SHARED AUTH LAYOUT ---------- */
function AuthLayout({
  title,
  onSubmit,
  emailSetter,
  passwordSetter,
  switchText,
  switchAction
}) {
  return (
    <div className="auth-container">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="brand-row">
          <img src={birlasoftLogo} alt="Birlasoft" className="logo birlasoft" />
          <span className="logo-divider-line"></span>
          <img src={strykerLogo} alt="Stryker" className="logo stryker" />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>{title}</h2>

          <input
            placeholder="Email"
            onChange={e => emailSetter(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={e => passwordSetter(e.target.value)}
          />

          <button onClick={onSubmit}>{title}</button>

          <p className="switch-text" onClick={switchAction}>
            {switchText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- LOGIN ---------- */
function Login() {
  const nav = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      login(data.token);
      nav("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <AuthLayout
      title="Login"
      onSubmit={submit}
      emailSetter={setEmail}
      passwordSetter={setPassword}
      switchText="Don’t have an account? Signup"
      switchAction={() => nav("/signup")}
    />
  );
}

/* ---------- SIGNUP ---------- */
function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    nav("/login");
  };

  return (
    <AuthLayout
      title="Signup"
      onSubmit={submit}
      emailSetter={setEmail}
      passwordSetter={setPassword}
      switchText="Already have an account? Login"
      switchAction={() => nav("/login")}
    />
  );
}

/* ---------- DASHBOARD ---------- */
function Dashboard() {
  return <h2 style={{ padding: 20 }}>Welcome 🎉 You are logged in</h2>;
}

/* ---------- PROTECTED ---------- */
function Protected({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

/* ---------- APP ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<Protected><Dashboard /></Protected>}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
