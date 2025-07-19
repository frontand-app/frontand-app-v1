import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SignUpFormProps {
  onToggleMode: () => void;
}

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (!error) return '';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('user already registered') || message.includes('email already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
  }
  if (message.includes('too many requests')) {
    return 'Too many signup attempts. Please wait a few minutes before trying again.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  if (message.includes('signup disabled')) {
    return 'New registrations are temporarily disabled. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength checker
const getPasswordStrength = (password: string): { score: number; message: string; color: string } => {
  if (!password) return { score: 0, message: '', color: '' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  score = Object.values(checks).filter(Boolean).length;
  
  if (score < 2) return { score, message: 'Weak', color: 'text-red-600' };
  if (score < 4) return { score, message: 'Fair', color: 'text-yellow-600' };
  if (score < 5) return { score, message: 'Good', color: 'text-blue-600' };
  return { score, message: 'Strong', color: 'text-green-600' };
};

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUpWithEmail } = useAuth();

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string, confirmPassword?: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError && newEmail) {
      validateEmail(newEmail);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (passwordError && newPassword) {
      validatePassword(newPassword, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (passwordError && password) {
      validatePassword(password, newConfirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password, confirmPassword);

    if (!isEmailValid || !isPasswordValid) {
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUpWithEmail(email, password);
      
      if (error) {
        setError(getErrorMessage(error));
      } else {
        setSuccess(true);
        // Show welcome message for new users
        setTimeout(() => {
          // The auth context will handle the redirect to dashboard
          // where users can see their welcome credits and explore workflows
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    }
    
    setIsLoading(false);
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Front&!
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent you a confirmation link. You're almost ready to start building workflows!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              <strong>🎉 Welcome bonus waiting!</strong> Once you confirm your email, you'll receive <strong>100 free credits</strong> to start exploring our workflow library.
            </AlertDescription>
          </Alert>
          
          <Alert className="border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Please check your email at <strong>{email}</strong> and click the confirmation link to activate your account.
            </AlertDescription>
          </Alert>
          
          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the email? Check your spam folder or</p>
            <Button
              variant="link"
              onClick={() => setSuccess(false)}
              className="text-primary-600 hover:text-primary-700 p-0 h-auto"
            >
              try again with a different email
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={onToggleMode}
              className="text-primary-600 hover:text-primary-700 p-0"
            >
              Back to sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white">
      <CardHeader className="text-center pb-6">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create your account
        </CardTitle>
        <CardDescription className="text-gray-600">
          Join Front& and start automating your workflows
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => email && validateEmail(email)}
                className={`pl-10 h-11 border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                  emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {emailError}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
                className={`pl-10 pr-10 h-11 border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                  passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 text-sm">
                <span>Password strength:</span>
                <span className={passwordStrength.color}>{passwordStrength.message}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all ${
                      passwordStrength.score < 2 ? 'bg-red-500' :
                      passwordStrength.score < 4 ? 'bg-yellow-500' :
                      passwordStrength.score < 5 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`pl-10 pr-10 h-11 border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                  passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </p>
            )}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-primary-600 hover:text-primary-700 p-0"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 