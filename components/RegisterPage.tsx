import React, { useState } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
  seasonTheme: Theme;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onSwitchToLogin, seasonTheme }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(t('register_error'));
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 1000);
  };

  return (
    <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-6 transition-colors duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('create_account')}</h2>
        <p className={`${seasonTheme.textMuted}`}>{t('join_prompt')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('full_name')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${seasonTheme.ring} focus:border-transparent sm:text-sm`}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('email_address')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${seasonTheme.ring} focus:border-transparent sm:text-sm`}
          />
        </div>
        <div>
          <label htmlFor="password"
                 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('password')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${seasonTheme.ring} focus:border-transparent sm:text-sm`}
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${seasonTheme.primaryBg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${seasonTheme.ring} disabled:bg-gray-400`}
          >
            {isLoading ? t('creating_account') : t('register')}
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('have_account')}{' '}
        <button onClick={onSwitchToLogin} className={`font-medium ${seasonTheme.text} hover:opacity-80`}>
          {t('login_here')}
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;