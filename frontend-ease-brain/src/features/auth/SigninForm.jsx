import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
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
import { BASE_URL } from "../../config/apiConfig";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/features/auth/AuthContext";
import { authFetch } from "../../lib/api";

const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role_id: z.string().optional(),
});

export default function SigninForm() {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/easebrain";

  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [roles, setRoles] = React.useState([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);

  const form = useForm({
    resolver: zodResolver(signinSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "", role_id: "" },
  });

  // Fetch available roles on component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/roles`);
        if (!response.ok) throw new Error("Failed to fetch roles");
        const data = await response.json();
        console.log('Fetched roles in features/SigninForm:', data);
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
        navigate(from, { replace: true });
        break;
    }
  };

  const onSubmit = async (values) => {
    const doSignin = async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // Set access token directly in context
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }

      // Also dispatch event for any other listeners
      if (data?.access_token) {
        try {
          window.dispatchEvent(
            new CustomEvent("auth:set_token", { detail: data.access_token })
          );
        } catch {
          // ignore
        }
      }

      // Dispatch user role (NEW)
      if (data?.role) {
        try {
          window.dispatchEvent(
            new CustomEvent("auth:set_role", { detail: data.role })
          );
        } catch {
          //ignore
        }
      }

      return data;
    };

    await toast.promise(doSignin(), {
      loading: "Signing you in…",
      success: async (data) => {
        form.reset();
        setError("");

        // Fetch complete user data including avatar
        try {
          const userRes = await authFetch(`${BASE_URL}/me`, {
            token: data.access_token,
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
          } else {
            console.warn("Failed to fetch user data, status:", userRes.status);
          }
        } catch (err) {
          console.warn("Failed to fetch user data:", err);
        }

        // Handle role-based navigation
        // Use the role returned from the backend directly
        if (data.role) {
          handleRoleRedirect(data.role);
        } else {
          // Fallback if role is not provided
          navigate(from, { replace: true });
        }

        return data?.message || "Welcome back!";
      },
      error: (err) => {
        setError(err.message || "Something went wrong");
        return err.message || "Something went wrong";
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto grid w-full max-w-md gap-4 rounded-2xl border p-10 shadow-lg bg-stone-50 min-h-[500px]"
      >
          <div className="flex justify-center">
            <img src={logo} alt="EaseBrain" className="w-20 h-20 rounded-full mb-2" />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-[#0D9488]">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-2 text-red-600 text-sm font-medium text-center">
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
                  <Input type="email" placeholder="you@example.com" {...field} />
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
                <FormLabel>Role</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={rolesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {console.log('Rendering SelectContent in features/SigninForm with roles:', roles)}
                    {roles && roles.length > 0 ? (
                      roles.map((role) => {
                        console.log('Rendering SelectItem for role in features/SigninForm:', role);
                        return (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="p-2 text-sm text-gray-500">
                        {rolesLoading ? "Loading roles..." : "No roles available"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <Link to="/forgot-password" className="text-xs text-[#0D9488] hover:underline">
              Forgot password?
            </Link>
            <Link to="/signup" className="text-xs text-[#0D9488] hover:underline">
              Sign up
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-2 bg-[#0D9488] text-white hover:bg-teal-700"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>
    );
}
