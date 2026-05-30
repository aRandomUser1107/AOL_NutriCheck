"use client"
import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import LoginPage from "./login/LoginPage";
import RegisterPage from "./register/RegisterPage";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const toggleMode = () => setMode(mode === "login" ? "register" : "login");

  return (
    <AnimatePresence mode="wait">
      {mode === "login" ? (
        <div key="login" className="w-full">
          <LoginPage onSwitch={toggleMode} />
        </div>
      ) : (
        <div key="register" className="w-full">
          <RegisterPage onSwitch={toggleMode} />
        </div>
      )}
    </AnimatePresence>
  );
}
