// 1. User signs up → email sent with token
// 2. User lands on "Email Verification Pending" page
// 3. Backend polls for emailVerified →
// 4. User can click "Resend Verification Email"
// 5. Backend sends token again
// 6. User verifies via email → account activated

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
import { BASE_URL } from "../../utils/utils";
import { authFetch } from "../../lib/api";
import { useSignupMutation } from "@/app/auth/authApi";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

// --- Validation schema ---
const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Max 50 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/\d/, "Include at least one number"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+]?[\d\s\-()]{7,20}$/.test(v),
      "Enter a valid phone number"
    ),
  location: z.string().optional(),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (v) => !Number.isNaN(Date.parse(v)),
      "Use a valid date (YYYY-MM-DD)"
    )
    .refine(
      (v) => new Date(v) <= new Date(),
      "Date of birth cannot be in the future"
    ),
  role_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupForm() {
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [roles, setRoles] = React.useState([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      location: "",
      date_of_birth: "",
      role_id: "",
    },
  });

  // Fetch available roles on component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log('Attempting to fetch roles from:', `${BASE_URL}/roles`);
        const response = await fetch(`${BASE_URL}/roles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched roles in SignUp:', data);

        // Ensure data is an array and has valid role objects
        const rolesArray = Array.isArray(data) ? data : [];
        if (rolesArray.length === 0) {
          console.warn("Roles endpoint returned empty array");
        }
        setRoles(rolesArray);
      } catch (err) {
        console.error("Error fetching roles:", err);
        toast.error("Failed to load roles. Please check your connection and refresh.");
        setRoles([]); // Ensure empty array on error
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const [signupMutation, { isLoading: signupLoading }] = useSignupMutation();

  const onSubmit = async (values) => {
    // Temporarily remove avatar requirement for debugging
    // if (!avatarFile) {
    //   setError("Profile photo is required");
    //   return;
    // }

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      phone_number: values.phone_number || null,
      location: values.location || null,
      date_of_birth: values.date_of_birth ? new Date(values.date_of_birth).toISOString().split('T')[0] : null,
      role_id: values.role_id ? parseInt(values.role_id, 10) : null,
    };

    // Log payload and endpoint to help reproduce server errors in DevTools/terminal
    console.debug("[Signup] payload:", payload, "url:", `${BASE_URL}/signup`);

    const doSignup = async () => {
      const result = await signupMutation(payload).unwrap();
      const data = result || {};
      const serverMessage = typeof data?.message === 'string' ? data.message : '';
      if (data?.error || (serverMessage && serverMessage.toLowerCase().includes('error'))) {
        throw new Error(data.message || data.error || 'Signup failed');
      }
      return data;
    };

    await toast.promise(doSignup(), {
      loading: "Creating your account…",
      success: async (data) => {
        form.reset();
        setError("");
        // If backend returned created user id and we have an avatar file, upload it
        try {
          const createdUserId = data?.user?.id || data?.id || data?.user_id;
          if (createdUserId && avatarFile) {
            const fd = new FormData();
            fd.append("avatar", avatarFile);
            // Use authFetch helper (used elsewhere in repo) to upload avatar. If auth not available, fall back to unauthenticated fetch.
            try {
              await authFetch(`${BASE_URL}/users/${createdUserId}/avatar`, {
                method: 'POST',
                body: fd,
              });
            } catch {
              // fallback to unauthenticated upload if authFetch fails
              await fetch(`${BASE_URL}/users/${createdUserId}/avatar`, {
                method: 'POST',
                body: fd,
                credentials: 'include',
              });
            }
          }
        } catch {
          console.error("Avatar upload failed");
        }

        // Store email for verification page polling
        localStorage.setItem("pending_email", values.email);

        // Store verification token for role assignment if not assigned during signup
        if (data?.verification_token && !data?.assigned_role) {
          localStorage.setItem("verification_token", data.verification_token);
        }

        // Store role info for post-verification redirection
        // First try to use the role_types returned from backend
        if (data?.user?.role_types && data.user.role_types.length > 0) {
          // Use the first role type from the backend response (prioritize caregiver if present)
          const roleType = data.user.role_types.includes("caregiver")
            ? "caregiver"
            : data.user.role_types[0];
          localStorage.setItem("pending_role_type", roleType);
        } else if (values.role_id) {
          // Fallback: use the selected role_id to find the role type
          const selectedRole = roles.find(r => r.id.toString() === values.role_id);
          if (selectedRole) {
            localStorage.setItem("pending_role_type", selectedRole.role_type);
          }
        }

        // Redirect to email verification page - email verification will handle role-based redirects
        navigate("/email-verification-pending");

        return data?.message || "Signed up successfully!";
      },
      error: (err) => {
        // Extract the actual error message from the server response
        const serverMessage = err?.data?.message || err?.message || "Something went wrong";
        setError(serverMessage);
        return serverMessage;
      },
    });
  };

  // Revoke object URL when preview changes/unmount to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(avatarPreview);
        } catch {
          // ignore
        }
      }
    };
  }, [avatarPreview]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto grid w-full max-w-md gap-4 rounded-2xl border p-6 shadow-sm bg-stone-50 dark:bg-slate-800 dark:border-gray-700"
      >
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-teal-50 flex items-center justify-center border-2 border-teal-100">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (
                <img src={logo} alt="EaseBrain" className="w-20 h-20 rounded-full" />
              )}
            </div>
            <div className="text-xs text-gray-600">Required: upload a profile picture *</div>
            <div className="w-full flex flex-col items-center gap-2">
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                           bg-teal-600 text-white cursor-pointer hover:bg-teal-700 transition
                           focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {avatarFile ? "Change profile photo" : "Upload profile photo"}
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setAvatarFile(f);
                    const url = URL.createObjectURL(f);
                    setAvatarPreview(url);
                  } else {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }
                }}
              />

              <p className="text-xs text-gray-500 text-center">
                JPG or PNG • Max 5MB
              </p>

              {avatarFile && (
                <p className="text-xs text-teal-700 font-medium">
                  Selected: {avatarFile.name}
                </p>
              )}
            </div>
          </div>
          <h2
            className="mb-2 text-xl font-semibold dark:text-teal-300"
            style={{ color: "#0D9488" }}
          >
            Create your account
          </h2>
          {error && (
            <div className="mb-2 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input placeholder="janedoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane.doe@example.com"
                    {...field}
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
                      autoComplete="new-password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="+2547..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Nairobi County" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth *</FormLabel>
                <FormControl>
                  <Input type="date" placeholder="YYYY-MM-DD" {...field} />
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
                    {rolesLoading ? (
                      <div className="text-sm text-gray-500 p-2">Loading roles...</div>
                    ) : roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-2">No roles available</div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-center">
            <a
              href="/signin"
              className="text-xs text-[#0D9488] hover:underline"
            >
              Sign in
            </a>
          </div>
          <Button
            type="submit"
            className="mt-2 bg-[#0D9488] text-white hover:bg-teal-700"
            disabled={form.formState.isSubmitting || signupLoading}
          >
            {form.formState.isSubmitting || signupLoading ? "Signing up…" : "Sign up"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Fields marked * are required.
          </p>
        </form>
      </Form>
    );
}
