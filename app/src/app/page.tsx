"use client";
import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import MainContent from '@/components/MainContent';
import CountryCommunity from '@/components/CountryCommunity';
import BadgesPage from '@/components/BadgesPage';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'badges' | 'employees' | 'communities'>('home');
  const [selectedCommunity, setSelectedCommunity] = useState<{ name: string; code: string; flag: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  // MiniKit frame lifecycle: signal ready once mounted
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    setIsClient(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleCommunitySelect = (community: { name: string; code: string; flag: string }) => {
    setSelectedCommunity(community);
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return <HomePage />;
    } else if (activeTab === 'badges') {
      return <BadgesPage />;
    } else if (activeTab === 'employees') {
      return <MainContent />;
    } else if (activeTab === 'communities') {
      if (selectedCommunity) {
        return <CountryCommunity country={selectedCommunity} />;
      } else {
        return <MainContent />;
      }
    }
    return <HomePage />;
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onCommunitySelect={handleCommunitySelect}>
      {renderContent()}
    </Layout>
  );
}