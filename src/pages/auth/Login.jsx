// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient"; // Import the Supabase client

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // We'll keep the role selector for now, but Supabase will be the source of truth
  const [role, setRole] = useState("student"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);

    // --- This is the REAL Supabase Authentication logic ---
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // After a successful login, we need to get the user's role from our 'profiles' table.
      // This is a crucial next step for navigation.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        setError("Could not retrieve user role.");
      } else if (profileData) {
        // Navigate based on the role from the database
        if (profileData.role === "teacher") {
          navigate("/teacher");
        } else {
          navigate("/student");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4 bg-neutral-900">
      <motion.div 
        className="w-full max-w-md bg-neutral-800 rounded-2xl shadow-2xl shadow-black/20 p-8 border border-neutral-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-3xl font-extrabold text-neutral-100 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          className="text-neutral-400 text-center mt-2 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Sign in to continue your journey.
        </motion.p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-lg font-medium border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-sm font-semibold text-neutral-300 mb-1">Email</label>
            <input
              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-semibold text-neutral-300 mb-1">Password</label>
            <input
              className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark hover:bg-primary text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:bg-neutral-600"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="text-sm text-neutral-400 text-center mt-6">
          New here? <Link to="/register" className="font-semibold text-primary-light hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}