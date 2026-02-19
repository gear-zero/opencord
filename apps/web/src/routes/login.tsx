import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facehash } from "facehash";

import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/mode-toggle";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      redirect({ to: "/dashboard", throw: true });
    }
  },
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-svh w-full flex bg-white dark:bg-black overflow-hidden">
      <div className="w-full flex flex-col md:flex-row h-full">
        {/* Left: Form Side */}
        <div className="w-full md:w-1/2 bg-white dark:bg-zinc-900 flex items-center justify-center p-8 md:p-12 relative min-h-svh order-2 md:order-1">
          <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
            <ModeToggle />
          </div>
          <div className="w-full max-w-sm relative min-h-[420px]">
            <AnimatePresence mode="wait" initial={false}>
              {showSignIn ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <SignInForm
                    onSwitchToSignUp={() => setShowSignIn(false)}
                    email={email}
                    onEmailChange={setEmail}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <SignUpForm
                    onSwitchToSignIn={() => setShowSignIn(true)}
                    email={email}
                    onEmailChange={setEmail}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Visual Side */}
        <div className="relative w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col items-center justify-center p-12 min-h-[300px] md:min-h-0 order-1 md:order-2 gap-4">
          {/* Facehash Avatar */}
          <div className="z-20 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-2xl">
            <Facehash name={email || "guest"} size={160} />
          </div>
          {/* Email Preview */}
          <p className="z-20 text-lg font-medium text-zinc-700 dark:text-zinc-300 text-center max-w-xs truncate">
            {email || "Enter your email"}
          </p>
          {/* App Tagline */}
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 text-right max-w-md">
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Real-time collaboration with crystal-clear voice, video, and chat.
            </p>
          </div>
          {/* Animated Gradient Blob */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 z-10 backdrop-blur-[80px]" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-60"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
                opacity: [0.6, 0.4, 0.6],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400 via-cyan-400 to-teal-400 rounded-full blur-3xl opacity-50 mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
