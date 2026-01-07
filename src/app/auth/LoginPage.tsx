import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/component/ui/Input";
import { login, loginInvite, loginSso } from "@/service/auth";
import { API_BASE_URL } from "@/config/api";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramsToken = searchParams.get("token");
  const paramsState = searchParams.get("state");
  const paramsInviteToken = searchParams.get("invite_token");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Auto-login dari callback SSO
  useEffect(() => {
    const processSso = async () => {
      if (!paramsToken || !paramsState) return;

      try {
        setFormLoading(true);
        const data = await loginSso({ token: paramsToken, state: paramsState });
        setToken(data.data.access_token);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setFormLoading(false);
      }
    };

    processSso();
  }, [paramsToken, paramsState, setToken, navigate]);

  useEffect(() => {
    const processInvite = async () => {
      if (!paramsInviteToken) return;

      try {
        setFormLoading(true);
        const data = await loginInvite({
          invite_token: paramsInviteToken,
        });
        setToken(data.data.access_token);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setFormLoading(false);
      }
    };

    processInvite();
  }, [paramsInviteToken, setToken, navigate]);

  // ✅ Sudah login → redirect
  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  // ✅ Login manual
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      setError(null);

      try {
        const data = await login({ identifier, password });
        setToken(data.data.access_token);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setFormLoading(false);
      }
    },
    [identifier, password, setToken, navigate]
  );

  // ✅ Redirect ke endpoint SSO backend
  const handleSSOLogin = () => {
    window.location.href = `${API_BASE_URL}/api/v1/auth/sso`;
  };

  return (
    <>
      {/* Loading Modal Overlay */}
      {formLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-semibold text-gray-800">Logging in...</p>
            <p className="text-sm text-gray-600">
              Please wait while we authenticate your credentials
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex">
        <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center" />
        <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Welcome Back
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Email or Username
              </label>
              <Input
                value={identifier}
                onChange={setIdentifier}
                type="text"
                placeholder="Enter your email or username"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Password
              </label>
              <Input
                value={password}
                onChange={setPassword}
                type="password"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-4"
            >
              {formLoading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              onClick={handleSSOLogin}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition"
            >
              <img src="/bps.svg" alt="SSO BPS" className="w-5 h-5" /> Login
              with SSO BPS{" "}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
