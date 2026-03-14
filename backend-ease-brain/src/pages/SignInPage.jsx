import SigninForm from "@/components/auth/SignIn";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const SignInPage = () => {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      toast.success("Email verified! Please sign in.");
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-cyan-100 dark:from-slate-900 dark:to-slate-800">
      <SigninForm />
    </div>
  );
};

export default SignInPage;
