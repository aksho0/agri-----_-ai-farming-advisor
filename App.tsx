// Fix: Provide the full implementation for the main App component.
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ResponsePanel from './components/ResponsePanel';
import InputPanel from './components/InputPanel';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import GovSchemePage from './components/GovSchemePage';
import CropAnalysisPage from './components/CropAnalysisPage';
import SmartAdvisorPage from './components/SmartAdvisorPage';
import WeatherDetailPage from './components/WeatherDetailPage';
import DiseaseAlertsPage from './components/DiseaseAlertsPage';
import MarketPricesPage from './components/MarketPricesPage';
import MyFarmPage from './components/MyFarmPage';
import SidePanel from './components/SidePanel';
import NotificationPanel from './components/NotificationPanel';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import LanguageToggle from './components/LanguageToggle';
import EmergencyButton from './components/EmergencyButton';

import { useSeason } from './hooks/useSeason';
import { useTranslation } from './hooks/useTranslation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { cacheService } from './services/cacheService';
import * as api from './services/mockApiService';

import { Message, View, Language, WeatherData, MarketPrice, DiseaseAlert, GovScheme, User } from './types';
import { Chat } from '@google/genai';
import { startChat, sendMessageStreamToChat } from './services/geminiService';


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { season, themeClasses } = useSeason(theme);
  const { t, language } = useTranslation();
  const isOnline = useOnlineStatus();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // Data State
  const [weather, setWeather] = useState<{ data: WeatherData | null, timestamp: number | null }>({ data: null, timestamp: null });
  const [alerts, setAlerts] = useState<{ data: DiseaseAlert[], timestamp: number | null }>({ data: [], timestamp: null });
  const [prices, setPrices] = useState<{ data: MarketPrice[], timestamp: number | null }>({ data: [], timestamp: null });
  const [schemes, setSchemes] = useState<{ data: GovScheme[], timestamp: number | null }>({ data: [], timestamp: null });
  const [isSyncing, setIsSyncing] = useState(false);

  // Chat State
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Sync data from API and update cache
  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    console.log("Syncing latest data...");
    try {
        const [weatherData, alertsData, pricesData, schemesData] = await Promise.all([
            api.fetchWeather(t),
            api.fetchAlerts(t),
            api.fetchMarketPrices(t),
            api.fetchSchemes(t),
        ]);
        
        setWeather({ data: weatherData, timestamp: Date.now() });
        cacheService.set('weather', weatherData);
        
        setAlerts({ data: alertsData, timestamp: Date.now() });
        cacheService.set('alerts', alertsData);
        
        setPrices({ data: pricesData, timestamp: Date.now() });
        cacheService.set('prices', pricesData);
        
        setSchemes({ data: schemesData, timestamp: Date.now() });
        cacheService.set('schemes', schemesData);

    } catch (e) {
        console.error("Data sync failed:", e);
    } finally {
        setIsSyncing(false);
    }
  }, [isOnline, isSyncing, t]);

  // Load from cache on initial mount
  useEffect(() => {
    console.log("Loading data from cache...");
    const cachedWeather = cacheService.get<WeatherData>('weather');
    if (cachedWeather) setWeather(cachedWeather);
    
    const cachedAlerts = cacheService.get<DiseaseAlert[]>('alerts');
    if (cachedAlerts) setAlerts(cachedAlerts);
    
    const cachedPrices = cacheService.get<MarketPrice[]>('prices');
    if (cachedPrices) setPrices(cachedPrices);
    
    const cachedSchemes = cacheService.get<GovScheme[]>('schemes');
    if (cachedSchemes) setSchemes(cachedSchemes);
  }, []);

  // Effect to sync data when coming online or language changes
  useEffect(() => {
      syncData();
  }, [isOnline, syncData]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.className = `${themeClasses.background} text-gray-800 dark:text-gray-100`;
  }, [theme, themeClasses]);
  
  useEffect(() => {
    if (isLoggedIn) {
      setChat(startChat(language));
      setMessages([]); // Clear messages on login/language change
    }
  }, [isLoggedIn, language]);
  
  const handleSubmit = async () => {
    if (!query.trim() && !image) return;
    if (!chat) {
        setError("Chat is not initialized.");
        return;
    }

    const userMessage: Message = {
        id: Date.now().toString(),
        text: query,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imagePreview: image ? URL.createObjectURL(image) : undefined,
        originalQuery: query,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery('');
    setImage(null);
    setError(null);
    setCurrentView('chat'); // Navigate to chat view on submit

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
        id: botMessageId,
        text: '',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, botMessage]);

    await sendMessageStreamToChat(chat, userMessage.text, image, (chunk) => {
        setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg));
    });

    setIsLoading(false);
  };
  
  const startListening = () => setIsListening(true);
  const stopListening = () => setIsListening(false);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setSidePanelOpen(false);
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUser({
        name: t('mock_user_name'),
        email: t('mock_user_email'),
    });
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    setUser({
        name: t('mock_user_name'),
        email: t('mock_user_email'),
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAuthView('login');
    setCurrentView('home');
  };

  const renderCurrentView = () => {
    const hasCache = !!weather.data && alerts.data.length > 0 && prices.data.length > 0;

    switch (currentView) {
      case 'home':
        return <HomePage 
            isOnline={isOnline}
            hasCache={hasCache}
            season={season} 
            seasonTheme={themeClasses} 
            weatherData={weather.data}
            weatherTimestamp={weather.timestamp}
            diseaseAlertsData={alerts.data}
            diseaseAlertsTimestamp={alerts.timestamp}
            marketPricesData={prices.data}
            marketPricesTimestamp={prices.timestamp}
            onNavigateToChat={() => handleNavigate('chat')}
            onNavigateToSchemes={() => handleNavigate('schemes')}
            onNavigateToSmartAdvisor={() => handleNavigate('smart-advisor')}
            onNavigateToWeather={() => handleNavigate('weather')}
            onNavigateToDisease={() => handleNavigate('disease')}
            onNavigateToMarket={() => handleNavigate('market')}
        />;
      case 'chat':
        return (
          <div className="flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-190px)]">
              <ResponsePanel messages={messages} isLoading={isLoading} error={error} seasonTheme={themeClasses} />
              <div className="mt-auto pt-4">
                  <InputPanel
                      query={query}
                      setQuery={setQuery}
                      image={image}
                      setImage={setImage}
                      handleSubmit={handleSubmit}
                      isLoading={isLoading}
                      seasonTheme={themeClasses}
                      isListening={isListening}
                      startListening={startListening}
                      stopListening={stopListening}
                  />
              </div>
          </div>
        );
      case 'schemes':
        return <GovSchemePage schemes={schemes.data} lastUpdated={schemes.timestamp} seasonTheme={themeClasses} />;
      case 'crop-analysis':
        return <CropAnalysisPage seasonTheme={themeClasses} onNavigateToChat={() => handleNavigate('chat')} />;
      case 'smart-advisor':
        return <SmartAdvisorPage season={season} seasonTheme={themeClasses} onNavigateHome={() => handleNavigate('home')} />;
      case 'weather':
        return <WeatherDetailPage weatherData={weather.data} lastUpdated={weather.timestamp} seasonTheme={themeClasses} />;
      case 'disease':
        return <DiseaseAlertsPage alerts={alerts.data} lastUpdated={alerts.timestamp} seasonTheme={themeClasses} />;
      case 'market':
        return <MarketPricesPage prices={prices.data} lastUpdated={prices.timestamp} seasonTheme={themeClasses} />;
      case 'farm':
        return <MyFarmPage seasonTheme={themeClasses} />;
      default:
        return <HomePage isOnline={isOnline} hasCache={hasCache} season={season} seasonTheme={themeClasses} weatherData={weather.data} weatherTimestamp={weather.timestamp} diseaseAlertsData={alerts.data} diseaseAlertsTimestamp={alerts.timestamp} marketPricesData={prices.data} marketPricesTimestamp={prices.timestamp} onNavigateToChat={() => handleNavigate('chat')} onNavigateToSchemes={() => handleNavigate('schemes')} onNavigateToSmartAdvisor={() => handleNavigate('smart-advisor')} onNavigateToWeather={() => handleNavigate('weather')} onNavigateToDisease={() => handleNavigate('disease')} onNavigateToMarket={() => handleNavigate('market')} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <main className={`min-h-screen w-full flex items-center justify-center p-4 ${themeClasses.background}`}>
        {authView === 'login' ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} seasonTheme={themeClasses} />
        ) : (
          <RegisterPage onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthView('login')} seasonTheme={themeClasses} />
        )}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        season={season}
        seasonTheme={themeClasses}
        currentView={currentView}
        user={user}
        onNavigateHome={() => handleNavigate('home')}
        onOpenSidePanel={() => setSidePanelOpen(true)}
        onOpenNotificationPanel={() => setNotificationPanelOpen(true)}
      />
       <SidePanel 
        isOpen={isSidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        seasonTheme={themeClasses}
        season={season}
        user={user}
      />
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        seasonTheme={themeClasses}
      />
      <main className="flex-grow container mx-auto px-4 py-4 md:px-6 md:py-8">
        {renderCurrentView()}
      </main>
      <Footer seasonTheme={themeClasses} />
      <BottomNav seasonTheme={themeClasses} activeView={currentView} onNavigate={(v) => handleNavigate(v as View)} />
      <LanguageToggle seasonTheme={themeClasses} />
      <EmergencyButton />
    </div>
  );
};

export default App;