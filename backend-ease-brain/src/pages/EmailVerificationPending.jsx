// Confirm user signup was successful
// Instruct user clearly on what to do next (i.e., check email & verify)
// Provide help or options if user didn’t get the email

// flow
// User signs up →
//   Sees this page →
//      Gets prompted to check their email →
//         Meanwhile, the app checks every 5 seconds if email is verified →
//            If verified, they’re redirected to the home page →
//                If not, they can resend email or update email address
//      Gets prompted to check their email →
//         Meanwhile, the app checks every 5 seconds if email is verified →
//            If verified, they’re redirected to the home page →
//                If not, they can resend email or update email address


import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "@/assets/logo.jpg";
import { useResendVerificationEmailMutation } from "@/app/auth/authApi";
import { BASE_URL } from "@/utils/utils";

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const email = localStorage.getItem('pending_email') || "";
  const roleType = localStorage.getItem('pending_role_type') || "";
  const [isVerified, setIsVerified] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const MAX_ATTEMPTS = 20;
  const POLL_INTERVAL = 3000;

  const [resendEmail] = useResendVerificationEmailMutation();

  const checkVerification = useCallback(async () => {
    if (!email) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await fetch(`${BASE_URL}/check-verification?email=${encodeURIComponent(email)}`);
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        // Try to get error text, but handle HTML error pages
        let errText = '';
        try {
          errText = await res.text();
        } catch {
          errText = 'Unknown error';
        }
        if (contentType && contentType.includes('application/json')) {
          throw new Error(`Status ${res.status}: ${errText}`);
        } else {
          throw new Error(`Server returned non-JSON response (status ${res.status}): ${errText.substring(0, 100)}`);
        }
      }
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON. Please check your backend.');
      }
      const data = await res.json();
      if (data.verified) {
        setIsVerified(true);
        toast.success("Email verified! You can now log in.");
      }
    } catch (err) {
      setFetchError(err);
      console.error("/check-verification error:", err);
    } finally {
      setIsFetching(false);
    }
  }, [email]);

  useEffect(() => {
    if (isVerified) return;
    if (!email) return;
    setFetchError(null);
    let attemptCount = 0;
    const interval = setInterval(() => {
      attemptCount += 1;
      if (attemptCount >= MAX_ATTEMPTS) {
        setFetchError(new Error("Verification is taking too long. Please try again later."));
        clearInterval(interval);
        return;
      }
      checkVerification();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [email, isVerified, checkVerification]);

  const handleResend = async () => {
    if (!email) {
      toast.error("No email available — please sign up again.");
      // Redirect user to signup so they can re-start the flow
      navigate("/signup");
      return;
    }

    try {
      setIsResending(true);
      await resendEmail({ email }).unwrap();
      toast.success("Verification email resent!");
      checkVerification();
    } catch (error) {
      toast.error("Failed to resend verification email.");
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  // Auto-redirect after verification
  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        // Clear the stored values
        localStorage.removeItem("pending_email");
        localStorage.removeItem("pending_role_type");

        // Route based on role type
        if (roleType) {
          switch (roleType) {
            case "caregiver":
              navigate("/caregiver");
              break;
            case "admin":
              navigate("/admin");
              break;
            case "user":
            case "patient":
            default:
              navigate("/easebrain");
              break;
          }
        } else {
          // Fallback to signin if no role stored
          navigate("/signin");
        }
      }, 2000); // 2 second delay to show the success message

      return () => clearTimeout(timer);
    }
  }, [isVerified, roleType, navigate]);

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdfa] px-4 text-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#0D9488] mb-2">Something went wrong</h2>
          <p className="text-red-500 mb-4">{fetchError.message || 'An error occurred. Please try again.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0D9488] text-white py-2 px-4 rounded-md hover:bg-[#0c857a] mt-4"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdfa] px-4 text-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
          <p className="text-gray-700 mb-4">Your email has been successfully verified. Redirecting you to your dashboard...</p>
          <button
            onClick={() => {
              // Clear the stored values
              localStorage.removeItem("pending_email");
              localStorage.removeItem("pending_role_type");

              // Route based on role type
              if (roleType) {
                switch (roleType) {
                  case "caregiver":
                    navigate("/caregiver");
                    break;
                  case "admin":
                    navigate("/admin");
                    break;
                  case "user":
                  case "patient":
                  default:
                    navigate("/easebrain");
                    break;
                }
              } else {
                // Fallback to signin if no role stored
                navigate("/signin");
              }
            }}
            className="bg-[#0D9488] text-white py-2 px-4 rounded-md hover:bg-[#0c857a] mt-4"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0fdfa] px-4 text-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="EaseBrain" className="w-20 h-20 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-[#0D9488] mb-2">
          Almost there!
        </h2>
        <p className="text-gray-600 mb-1">
          We've sent a verification email to:
        </p>

        <p className="text-gray-800 font-medium mb-4">
          {email ? (
            email
          ) : isFetching ? (
            <span className="text-gray-400 text-sm">Loading email address…</span>
          ) : (
            <span className="text-gray-400 text-sm">No email found</span>
          )}
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Please check your inbox and click the link to activate your account.
          Once verified, you'll be able to log in.
        </p>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="bg-[#0D9488] text-white py-2 px-4 rounded-md hover:bg-[#0c857a] disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend Verification Email"}
          </button>

          <button
            onClick={() => navigate("/update-email")}
            className="text-[#0D9488] text-sm hover:underline"
          >
            Change email address
          </button>
        </div>

        {isFetching && (
          <p className="text-xs text-gray-400 mt-4">Checking verification status...</p>
        )}
      </div>
    </div>
  );
}