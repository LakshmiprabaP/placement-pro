"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";


const REGISTER_URL =
  "http://127.0.0.1:8000/api/register/";


export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================
  // GET BACKEND ERROR
  // =========================================

  const getErrorMessage = (
    data: Record<string, unknown>
  ) => {
    const fields = [
      "full_name",
      "email",
      "phone_number",
      "password",
      "confirm_password",
      "detail",
      "non_field_errors",
    ];

    for (const field of fields) {
      const value = data[field];

      if (Array.isArray(value)) {
        return String(value[0]);
      }

      if (typeof value === "string") {
        return value;
      }
    }

    return JSON.stringify(
      data,
      null,
      2
    );
  };


  // =========================================
  // REGISTER
  // =========================================

  const handleRegister = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // CLIENT VALIDATION

    if (!fullName.trim()) {
      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!email.trim()) {
      setError(
        "Please enter your email."
      );

      return;
    }


    if (!phoneNumber.trim()) {
      setError(
        "Please enter your phone number."
      );

      return;
    }


    if (
      phoneNumber.length < 10
    ) {
      setError(
        "Please enter a valid phone number."
      );

      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {
      const response =
        await fetch(
          REGISTER_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              full_name:
                fullName.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              phone_number:
                phoneNumber.trim(),

              password,

              confirm_password:
                confirmPassword,
            }),
          }
        );


      let data: Record<
        string,
        unknown
      > = {};


      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      // =====================================
      // BACKEND ERROR
      // =====================================

      if (!response.ok) {
        console.error(
          "Registration error:",
          data
        );

        const message =
          getErrorMessage(data);

        setError(
          message ||
            "Unable to create account."
        );

        return;
      }


      // =====================================
      // SUCCESS
      // =====================================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );


      setTimeout(() => {
        router.push("/login");
      }, 1200);

    } catch (err) {
      console.error(
        "Registration request failed:",
        err
      );

      setError(
        "Unable to connect to the server. Make sure Django is running."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100 px-4 py-10">

      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">


        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-2xl backdrop-blur-xl lg:grid-cols-2">


          {/* ==================================
              LEFT SIDE
          ================================== */}

          <div className="hidden bg-gradient-to-br from-violet-200/70 via-pink-100/70 to-sky-200/70 p-12 lg:flex lg:flex-col lg:justify-between">


            <div>

              <div className="inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
                🎓 PlacementPro
              </div>


              <h1 className="mt-8 text-5xl font-bold leading-tight text-slate-900">

                Prepare smarter.

                <br />

                Apply better.

                <br />

                <span className="text-violet-600">
                  Get placed.
                </span>

              </h1>


              <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">

                Organize your placement
                journey, track interview
                rounds and stay prepared
                for every opportunity.

              </p>

            </div>


            <div className="grid gap-4">

              <FeatureCard
                icon="📋"
                title="Track Applications"
                text="Keep all your company applications in one place."
              />

              <FeatureCard
                icon="🎯"
                title="Track Interview Rounds"
                text="Know exactly where you are in every hiring process."
              />

              <FeatureCard
                icon="📚"
                title="Prepare Smarter"
                text="Stay organized for tests and upcoming interviews."
              />

            </div>

          </div>


          {/* ==================================
              REGISTER CARD
          ================================== */}

          <div className="p-6 sm:p-10 lg:p-12">


            <div className="mx-auto max-w-md">


              <div className="mb-8 lg:hidden">

                <p className="text-2xl font-bold text-violet-600">
                  PlacementPro
                </p>

              </div>


              <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                Create account
              </p>


              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Start your placement journey
              </h2>


              <p className="mt-2 text-slate-500">
                Create your private
                PlacementPro account.
              </p>


              {/* =============================
                  ERROR
              ============================= */}

              {error && (

                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="font-medium text-red-700">
                    Unable to create account
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-red-600">
                    {error}
                  </p>

                </div>

              )}


              {/* =============================
                  SUCCESS
              ============================= */}

              {success && (

                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

                  <p className="text-sm font-medium text-green-700">
                    ✓ {success}
                  </p>

                </div>

              )}


              <form
                onSubmit={
                  handleRegister
                }
                className="mt-7 space-y-5"
              >


                {/* FULL NAME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                </div>


                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                </div>


                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    value={
                      phoneNumber
                    }
                    onChange={(e) => {
                      const onlyNumbers =
                        e.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setPhoneNumber(
                        onlyNumbers
                      );
                    }}
                    maxLength={15}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>


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
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-14 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
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


                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>


                  <div className="relative">

                    <input
                      required
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter password again"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-14 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showConfirmPassword
                        ? "🙈"
                        : "👁️"}

                    </button>

                  </div>

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Creating account..."
                    : "Create Account"}

                </button>

              </form>


              <p className="mt-7 text-center text-sm text-slate-500">

                Already have an account?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-violet-600 hover:text-violet-700"
                >
                  Sign in
                </Link>

              </p>


              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Your password is securely
                processed by the PlacementPro
                backend.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}


// ===========================================
// FEATURE CARD
// ===========================================

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (

    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur">

      <div className="flex gap-3">

        <div className="text-2xl">
          {icon}
        </div>


        <div>

          <p className="font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            {text}
          </p>

        </div>

      </div>

    </div>

  );
}