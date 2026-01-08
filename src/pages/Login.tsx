import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      const { user, token } = response.data;
      
      login(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-mono">
            IoT Security Audit
          </h2>
          <p className="text-gray-400 mt-2 font-mono text-sm">
            Sign in to access the security dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm font-mono mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  placeholder="admin@iotsec.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-mono mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-cyan-500/30 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-400 text-sm font-mono">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-gray-800 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-xs font-mono mb-2 text-center">Demo Credentials:</p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-cyan-400">Admin: admin@iotsec.com / admin123</p>
              <p className="text-green-400">User: user@iotsec.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;