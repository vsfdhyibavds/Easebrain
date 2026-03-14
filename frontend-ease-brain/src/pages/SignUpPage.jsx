import SignupForm from "@/components/auth/SignUp";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800">
      <SignupForm />
    </div>
  );
};

export default SignUpPage;
