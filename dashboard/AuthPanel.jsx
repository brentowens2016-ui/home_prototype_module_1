import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AuthPanel({ onAuth, onShowDownload }) {
  const [mode, setMode] = useState("login"); // login, signup, reset
  const [form, setForm] = useState({ email: "", password: "", new_password: "", token: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const paypalRef = useRef(null);
  const [billingConfig, setBillingConfig] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("annual");

  useEffect(() => {
    if (mode === "signup" && !billingConfig) {
      axios.get("/billing_config.json").then(res => setBillingConfig(res.data));
    }
  }, [mode, billingConfig]);

  useEffect(() => {
    if (mode === "signup" && billingConfig && paypalRef.current && !paymentComplete) {
      // Load PayPal JS SDK
      if (!window.paypal) {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=${billingConfig.currency}`;
        script.onload = renderPayPal;
        document.body.appendChild(script);
      } else {
        renderPayPal();
      }
    }
    // eslint-disable-next-line
  }, [mode, billingConfig, selectedPlan, paymentComplete]);

  function renderPayPal() {
    if (!window.paypal || !paypalRef.current) return;
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        const plan = billingConfig.billing_options.find(opt => opt.interval === selectedPlan);
        return actions.order.create({
          purchase_units: [{
            amount: { value: plan.amount.toFixed(2) },
            description: `${plan.label} Subscription`
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(() => {
          setPaymentComplete(true);
          setMessage("Payment successful! You can now sign up.");
        });
      },
      onError: (err) => {
        setError("PayPal error: " + err);
      }
    }).render(paypalRef.current);
  }

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleLogin = () => {
    setError("");
    axios.post("/login", { username: form.email, password: form.password })
      .then(res => { setMessage(""); onAuth(res.data); })
      .catch(e => setError(e.response?.data?.detail || "Login failed"));
  };

  const handleSignup = () => {
    setError("");
    axios.post("/users", { username: form.email, password: form.password, access_mode: selectedPlan === "annual" ? "paid_annual" : "paid_monthly", payment_status: paymentComplete ? "paid" : "unpaid" })
      .then(() => { setMessage("Signup successful! Please log in."); setMode("login"); })
      .catch(e => setError(e.response?.data?.detail || "Signup failed"));
  };

  const handleRequestReset = () => {
    setError("");
    axios.post("/users/request_reset", { email: form.email })
      .then(res => { setMessage("Check your email for a reset link or use the token: " + res.data.reset_token); setMode("reset"); })
      .catch(e => setError(e.response?.data?.detail || "Reset request failed"));
  };

  const handleReset = () => {
    setError("");
    axios.post("/users/reset_password", { email: form.email, token: form.token, new_password: form.new_password })
      .then(() => { setMessage("Password reset! Please log in."); setMode("login"); })
      .catch(e => setError(e.response?.data?.detail || "Reset failed"));
  };

  return (
    <div style={{ border: "1px solid #888", padding: 24, maxWidth: 400, margin: "32px auto" }}>
      <h2>{mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Reset Password"}</h2>
      {mode !== "reset" && (
        <div>
          <div>Email: <input value={form.email} onChange={e => handleChange("email", e.target.value)} /></div>
          <div>Password: <input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} /></div>
        </div>
      )}
      {mode === "signup" && billingConfig && (
        <div style={{ fontSize: 13, color: "#555", margin: "8px 0" }}>
          <div>
            <label>Choose Plan: </label>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
              {billingConfig.billing_options.map(opt => (
                <option key={opt.interval} value={opt.interval}>{opt.label} (${opt.amount}/{opt.interval})</option>
              ))}
            </select>
          </div>
          <div ref={paypalRef} style={{ margin: "16px 0" }} />
          {!paymentComplete && <div style={{ color: "#b00" }}>Payment required to sign up.</div>}
        </div>
      )}
      {mode === "reset" && (
        <div>
          <div>Email: <input value={form.email} onChange={e => handleChange("email", e.target.value)} /></div>
          <div>Reset Token: <input value={form.token} onChange={e => handleChange("token", e.target.value)} /></div>
          <div>New Password: <input type="password" value={form.new_password} onChange={e => handleChange("new_password", e.target.value)} /></div>
        </div>
      )}
      {error && <div style={{ color: "red", margin: 8 }}>{error}</div>}
      {message && <div style={{ color: "green", margin: 8 }}>{message}</div>}
      <div style={{ marginTop: 16 }}>
        {mode === "login" && <>
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setMode("signup")} style={{ marginLeft: 8 }}>Sign Up</button>
          <button onClick={() => setMode("reset")} style={{ marginLeft: 8 }}>Forgot Password?</button>
        </>}
        {mode === "signup" && <>
          <button onClick={handleSignup} disabled={!paymentComplete}>Sign Up</button>
          <button onClick={() => setMode("login")} style={{ marginLeft: 8 }}>Back to Login</button>
        </>}
        {mode === "reset" && <>
          <button onClick={handleReset}>Reset Password</button>
          <button onClick={() => setMode("login")} style={{ marginLeft: 8 }}>Back to Login</button>
        </>}
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onShowDownload}>Download Local Agent</button>
      </div>
    </div>
  );
}
