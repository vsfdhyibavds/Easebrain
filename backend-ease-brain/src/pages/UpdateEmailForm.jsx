import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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

import { useUpdateUserMutation } from "@/app/users/usersApi";

const emailUpdateSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/\d/, "Include at least one number"),
});

export default function UpdateEmailForm() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const form = useForm({
    resolver: zodResolver(emailUpdateSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const responsePromise = updateUser({
        user_id: user.id,
        email: values.email,
        password_hash: values.password,
      }).unwrap();

      await toast.promise(responsePromise, {
        loading: "Updating email...",
        success: "Email updated. Please check your inbox.",
        error: (err) => err?.message || "Something went wrong.",
      });

      form.reset();
      navigate("/email-verification-pending");
    } catch (err) {
      toast.error(err.message || "Error updating email");
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto grid w-full max-w-md gap-4 rounded-2xl border p-6 shadow-sm bg-stone-50"
        >
          <h2 className="mb-2 text-xl font-semibold text-[#0D9488]">
            Update Your Email
          </h2>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="new.email@example.com"
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
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Your current password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="mt-2 bg-[#0D9488] text-white hover:bg-teal-700"
            disabled={form.formState.isSubmitting || isLoading}
          >
            {form.formState.isSubmitting ? "Updating…" : "Update Email"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Fields marked * are required.
          </p>
        </form>
      </Form>
    </>
  );
}
