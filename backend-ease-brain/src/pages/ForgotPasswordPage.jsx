import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const _navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);

    const doForgotPassword = async () => {
      const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send reset email");
      }

      return data;
    };

    await toast.promise(doForgotPassword(), {
      loading: "Sending reset email…",
      success: (data) => {
        form.reset();
        setSubmittedEmail(values.email);
        setIsSubmitted(true);
        return data?.message || "Reset email sent successfully!";
      },
      error: (err) => {
        return err.message || "Failed to send reset email";
      },
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800 p-4">
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
              Reset your password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter your email address and we'll send you instructions to reset your password.
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0D9488] text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading ? "Sending…" : "Send Reset Email"}
                </Button>
              </form>
            </Form>
          ) : (
            // Success Message
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Check your email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We've sent a password reset link to:
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-6 break-all">
                  {submittedEmail}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Check your spam or junk folder if you don't see the email within a few minutes.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Try another email
                </button>
                <Link
                  to="/signin"
                  className="block text-center px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            <p>Don't have an account? <Link to="/signup" className="text-[#0D9488] hover:underline font-medium">Sign up here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
