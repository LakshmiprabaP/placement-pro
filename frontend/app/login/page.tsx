"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            "Invalid email/phone number or password."
        );
        return;
      }

      /*
        Remember Me:
        - Checked -> localStorage
        - Not checked -> sessionStorage
      */

      if (rememberMe) {
        localStorage.setItem(
          "access_token",
          data.access
        );

        localStorage.setItem(
          "refresh_token",
          data.refresh
        );

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      } else {
        sessionStorage.setItem(
          "access_token",
          data.access
        );

        sessionStorage.setItem(
          "refresh_token",
          data.refresh
        );

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }

      router.push("/");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4efff] via-[#fff5f7] to-[#eef7ff]">

      {/* Pastel background */}

      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

      <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl" />

      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 sm:px-8">

        <div className="grid w-full overflow-hidden rounded-[34px] border border-white/80 bg-white/60 shadow-2xl backdrop-blur-xl lg:grid-cols-2">

          {/* LEFT SIDE */}

          <section className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-violet-200/70 via-pink-100 to-blue-100 p-12 lg:flex lg:flex-col lg:justify-between">

            <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />

            <div className="relative">
              <h1 className="text-3xl font-bold text-slate-800">
                Placement
                <span className="text-violet-600">
                  Pro
                </span>
              </h1>

              <p className="mt-1 text-xs font-medium tracking-[0.28em] text-slate-500">
                PLAN • PREPARE • PLACE
              </p>
            </div>

            <div className="relative max-w-lg">
              <span className="rounded-full bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-violet-600">
                Your career workspace
              </span>

              <h2 className="mt-7 text-5xl font-bold leading-[1.12] text-slate-800">
                Prepare smarter.
                <br />
                Apply better.
                <br />

                <span className="text-violet-600">
                  Get placed.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
                Organize applications,
                upcoming rounds and interview
                preparation in one place.
              </p>
            </div>

            {/* Student preparation card */}

            <div className="relative rounded-3xl border border-white/70 bg-white/45 p-7 shadow-lg backdrop-blur-lg">

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                  📚
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Today&apos;s Preparation
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Keep moving towards your
                    next opportunity.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                <Task text="Revise technical concepts" />

                <Task text="Practice interview questions" />

                <Task
                  text="Prepare for next round"
                  pending
                />

              </div>
            </div>

          </section>

          {/* LOGIN SIDE */}

          <section className="flex min-h-[720px] items-center justify-center bg-white/65 p-7 sm:p-12">

            <div className="w-full max-w-md">

              <div className="mb-10 lg:hidden">
                <h1 className="text-3xl font-bold text-slate-800">
                  Placement
                  <span className="text-violet-600">
                    Pro
                  </span>
                </h1>

                <p className="mt-1 text-xs tracking-[0.2em] text-slate-500">
                  PLAN • PREPARE • PLACE
                </p>
              </div>

              <div className="mb-9">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                  🎓
                </div>

                <h2 className="text-4xl font-bold text-slate-800">
                  Welcome back
                </h2>

                <p className="mt-3 text-slate-500">
                  Log in and continue your
                  placement journey.
                </p>

              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL / PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email or Phone Number
                  </label>

                  <input
                    required
                    value={login}
                    onChange={(e) =>
                      setLogin(e.target.value)
                    }
                    placeholder="Enter email or phone number"
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>

                  </div>

                  <div className="relative">

                    <input
                      required
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 pr-16 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-lg"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>
                </div>

                {/* REMEMBER / FORGOT */}

                <div className="flex items-center justify-between gap-4">

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-violet-600"
                    />

                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                    onClick={() =>
                      alert(
                        "Password reset will be added next."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Logging in..."
                    : "Log In"}
                </button>

              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs uppercase tracking-wider text-slate-400">
                  New to PlacementPro?
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}

                <Link
                  href="/register"
                  className="font-semibold text-violet-600 hover:text-violet-700"
                >
                  Create Account
                </Link>
              </p>

              <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                🔒 Your account and placement
                information are protected.
              </p>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}


function Task({
  text,
  pending = false,
}: {
  text: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
        {pending ? "○" : "✓"}
      </div>

      <p className="text-sm font-medium text-slate-700">
        {text}
      </p>

    </div>
  );
}