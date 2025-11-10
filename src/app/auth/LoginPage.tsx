import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/auth/useAuth";
import { login } from "@/service/auth";
import Input from "@/component/ui/Input";

const LoginPage = () => {
  const { token, setToken } = useAuth(); // rename untuk membedakan
  const navigate = useNavigate();

  // redirect jika sudah login dan refresh token selesai
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  // state untuk form login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      setError(null);

      try {
        const data = await login({ email, password });
        setToken(data.data.access_token);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setFormLoading(false);
      }
    },
    [email, password, setToken, navigate]
  );

  return (
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
              Email
            </label>
            <Input
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Enter your email"
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition"
            disabled={formLoading}
          >
            {formLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
