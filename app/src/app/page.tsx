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

  // MiniKit frame lifecycle: signal ready once mounted
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
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

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onCommunitySelect={handleCommunitySelect}>
      {renderContent()}
    </Layout>
  );
}