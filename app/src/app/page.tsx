"use client";
import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import MainContent from '@/components/MainContent';
import CountryCommunity from '@/components/CountryCommunity';
import BadgesPage from '@/components/BadgesPage';
// Mobile components were removed; desktop layout is used exclusively for now

// Wrapper component to handle MiniKit availability
function MiniKitWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  try {
    const { setFrameReady, isFrameReady } = useMiniKit();
    
    useEffect(() => {
      if (!isFrameReady) {
        setFrameReady();
      }
    }, [isFrameReady, setFrameReady]);

    return <>{children}</>;
  } catch (error) {
    // MiniKit not available, render children without MiniKit functionality
    return <>{children}</>;
  }
}

export default function Home() {
  const [desktopTab, setDesktopTab] = useState<'home' | 'badges' | 'employees' | 'communities'>('home');
  const [selectedCommunity, setSelectedCommunity] = useState<{ name: string; code: string; flag: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCommunitySelect = (community: { name: string; code: string; flag: string }) => {
    setSelectedCommunity(community);
  };

  const renderContent = () => {
    if (desktopTab === 'home') {
      return <HomePage />;
    } else if (desktopTab === 'badges') {
      return <BadgesPage />;
    } else if (desktopTab === 'employees') {
      return <MainContent />;
    } else if (desktopTab === 'communities') {
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
    <MiniKitWrapper>
      <Layout activeTab={desktopTab} onTabChange={setDesktopTab} onCommunitySelect={handleCommunitySelect}>
        {renderContent()}
      </Layout>
    </MiniKitWrapper>
  );
}