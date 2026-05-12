import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShoppingCart, User, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../stores/auth-store';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setSession, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [loginError, setLoginError] = React.useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoginError(null);
      // @ts-ignore - api is exposed via preload
      const result = await window.api.auth.login(data);
      if (result.success) {
        setSession(result.user);
        navigate('/', { replace: true });
      } else {
        setLoginError(result.message || 'Invalid username or password');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login failed:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-10 rounded-2xl shadow-soft border border-navy/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <ShoppingCart className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Welcome Back</h1>
          <p className="text-text-secondary mt-1">
            Sign in to your POS terminal
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-text-primary"
            >
              Username
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  size={18}
                />
                <input
                  id="username"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('username')}
                  className="w-full bg-background border border-navy/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter username"
                />
              </div>
            </label>
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-text-primary"
            >
              Password
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  size={18}
                />
                <input
                  id="password"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('password')}
                  type="password"
                  className="w-full bg-background border border-navy/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter password"
                />
              </div>
            </label>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-navy/20 text-center">
          <p className="text-xs text-text-secondary">
            System strictly for authorized personnel only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
