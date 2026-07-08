// src/features/auth/SigninForm.jsx
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "@/features/auth/AuthContext";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_URL } from "@/utils/utils";
import { useNavigate, useLocation, Link } from "react-router-dom";

// --- Validation schema ---
const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role_id: z.string().min(1, "Please select a role"),
});

export default function SigninForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccessToken, setUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [roles, setRoles] = React.useState([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);

  // Get redirect from sessionStorage (set by ProtectedRoute) or location state, default to /easebrain
  const redirectTo =
    sessionStorage.getItem("redirectAfterLogin") || location.state?.from?.pathname || "/easebrain";

  // Fetch available roles on component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }
        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching roles:", err);
        toast.error("Failed to load roles. Please refresh the page.");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleRedirect = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin", { replace: true });
        break;
      case "caregiver":
        navigate("/caregiver", { replace: true });
        break;
      case "user":
      default:
        navigate(redirectTo, { replace: true });
        break;
    }
  };

  const onSubmit = async (values) => {
    setError("");
    setIsLoading(true);

    const doSignin = async () => {
      const payload = {
        email: values.email,
        password: values.password,
        role_id: parseInt(values.role_id, 10),
      };

      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      // Persist via AuthContext; it will handle storage/expiry
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      if (data?.user) {
        setUser(data.user);
      }

      return data;
    };

    await toast.promise(doSignin(), {
      loading: "Signing you in…",
      success: (data) => {
        form.reset();
        setError("");

        // Dispatch access token event
        if (data?.access_token) {
          try {
            window.dispatchEvent(
              new CustomEvent("auth:set_token", { detail: data.access_token })
            );
          } catch {
            // ignore
          }
        }

        // Dispatch user role event
        if (data?.role) {
          try {
            window.dispatchEvent(
              new CustomEvent("auth:set_role", { detail: data.role })
            );
          } catch {
            // ignore
          }
        }

        // Clear the stored redirect (if any)
        try {
          sessionStorage.removeItem("redirectAfterLogin");
        } catch {
          // ignore
        }

        // Handle role-based navigation
        handleRoleRedirect(data?.role);

        return data?.message || "Welcome back!";
      },
      error: (err) => {
        setError(err.message || "Something went wrong");
        return err.message || "Something went wrong";
      },
    }).finally(() => {
      setIsLoading(false);
    });
  };
  const form = useForm({
    resolver: zodResolver(signinSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      role_id: "",
    },
  });

  // Try to fetch a user's avatar by email to show a preview on the sign-in form
  const fetchAvatarByEmail = async (email) => {
    if (!email) return setAvatarPreview(null);
    try {
      // Use authFetch from lib/api for consistency; authFetch will include credentials/token if present.
      const res = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(email)}`);
      if (!res.ok) return setAvatarPreview(null);
      const data = await res.json();
      const user = data?.user || (Array.isArray(data) ? data[0] : data);
      if (user) {
        setAvatarPreview(user.avatarUrl || user.profilePicture || user.avatar || user.photo || null);
      } else {
        setAvatarPreview(null);
      }
    } catch {
      setAvatarPreview(null);
    }
  };


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`mx-auto grid w-full max-w-md gap-4 rounded-2xl border p-10 shadow-lg bg-stone-50 dark:bg-slate-800 dark:border-gray-700 min-h-[500px]`}
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-50 flex items-center justify-center mb-2 border-2 border-teal-100">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-6.075 0-11 3.582-11 8v2h22v-2c0-4.418-4.925-8-11-8z"/></svg>
              )}
            </div>
            <h2 className="mb-2 text-xl font-semibold dark:text-teal-300" style={{ color: "#0D9488" }}>
              Sign in to your account
            </h2>
          </div>
          {error && (
            <div className="mb-2 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      fetchAvatarByEmail(e.target.value);
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      // clear preview while typing
                      setAvatarPreview(null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
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
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={rolesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="border-teal-500 focus:border-teal-600 focus:ring-teal-500">
                      <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select your role"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : null}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <Link
              to="/forgot-password"
              className="text-xs text-[#0D9488] hover:underline"
            >
              Forgot password?
            </Link>
            <Link to="/signup" className="text-xs text-[#0D9488] hover:underline">
              Sign up
            </Link>
          </div>
          <Button
            type="submit"
          className={`mt-2 bg-[#0D9488] text-white hover:bg-teal-700 ${
            (isLoading || form.formState.isSubmitting) ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading || form.formState.isSubmitting}
          >
          {(isLoading || form.formState.isSubmitting) ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>
    );
  }
