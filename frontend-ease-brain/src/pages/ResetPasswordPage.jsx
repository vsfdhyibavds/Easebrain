import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Lock } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BASE_URL } from "@/config/apiConfig";

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Validate token on mount
  React.useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid or missing reset link");
      setTimeout(() => navigate("/signin"), 3000);
    }
  }, [token, email, navigate]);

  const onSubmit = async (values) => {
    setIsLoading(true);

    const doResetPassword = async () => {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to reset password");
      }

      return data;
    };

    await toast.promise(doResetPassword(), {
      loading: "Resetting password…",
      success: (data) => {
        form.reset();
        setIsSubmitted(true);
        return data?.message || "Password reset successfully!";
      },
      error: (err) => {
        return err.message || "Failed to reset password";
      },
    }).finally(() => {
      setIsLoading(false);
    });
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Invalid or missing reset link</p>
          <Link
            to="/signin"
            className="text-[#0D9488] hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-10 shadow-lg bg-stone-50 dark:bg-slate-800 dark:border-gray-700">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-[#0D9488] hover:underline text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Create new password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter a new password for your account.
            </p>
          </div>

          {!isSubmitted ? (
            // Form
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 text-xs text-[#0D9488]"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={0}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 text-xs text-[#0D9488]"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            tabIndex={0}
                            aria-label={
                              showConfirmPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showConfirmPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    <strong>Password requirements:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>✓ At least 8 characters</li>
                      <li>✓ One uppercase letter</li>
                      <li>✓ One lowercase letter</li>
                      <li>✓ One number</li>
                    </ul>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0D9488] text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading ? "Resetting…" : "Reset Password"}
                </Button>
              </form>
            </Form>
          ) : (
            // Success Message
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                  <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Password reset successful!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>

              <Link
                to="/signin"
                className="block text-center px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
