/**
 * OpenBands v2 - Create Community Wizard
 * 
 * Multi-step wizard for creating communities with:
 * Step 1: Community details (name, description, about, rules, images)
 * Step 2: Badge requirements (Age, Nationality, Email)
 * Step 3: Combination logic (if multiple badges)
 * Final: Success screen
 */

'use client';

import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useNationalityBadgeCheck } from '@/hooks/useNationalityBadgeCheck';
import { useBadgeCheck } from '@/hooks/useBadgeCheck';
import { useAgeBadgeCheck } from '@/hooks/useAgeBadgeCheck';
import { commonNames, getCountryFlagEmoji, normalizeMRZCode, isMRZCode } from '@/lib/utils/country-translation';
import { COUNTRY_GROUPS, type CountryGroupKey } from '@/lib/utils/country-groups';

interface BadgeRequirement {
  type: 'age' | 'nationality' | 'company';
  value?: string; // For email domain
  values?: string[]; // For nationality codes
}

interface CreateCommunityWizardProps {
  onCommunityCreated?: () => void;
  onClose: () => void;
}

export function CreateCommunityWizard({ onCommunityCreated, onClose }: CreateCommunityWizardProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { badgeData: nationalityBadge } = useNationalityBadgeCheck();
  const { badgeData: companyBadge } = useBadgeCheck();
  const { ageBadge } = useAgeBadgeCheck();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Community details
  const [communityDetails, setCommunityDetails] = useState({
    name: '',
    shortDescription: '',
    about: '',
    rules: '',
    avatarImage: null as File | null,
    avatarPreview: null as string | null,
  });

  // Step 2: Badge requirements
  const [badgeRequirements, setBadgeRequirements] = useState<BadgeRequirement[]>([]);
  const [showNationalityPicker, setShowNationalityPicker] = useState(false);
  const [showIndividualCountryPicker, setShowIndividualCountryPicker] = useState(false);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [emailDomain, setEmailDomain] = useState('');

  // Combination logic (shown in Step 2 when multiple badges)
  const [combinationLogic, setCombinationLogic] = useState<'any' | 'all'>('any');

  // Success state
  const [createdCommunity, setCreatedCommunity] = useState<any>(null);

  // Show all badge options regardless of chain/verification status
  // Users can select any badge type, verification happens on join

  // Handle avatar image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCommunityDetails(prev => ({
        ...prev,
        avatarImage: file,
        avatarPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Add badge
  const handleAddAgeBadge = () => {
    if (badgeRequirements.some(b => b.type === 'age')) return;
    setBadgeRequirements(prev => [...prev, { type: 'age' }]);
  };

  const handleAddNationalityBadge = () => {
    if (selectedNationalities.length === 0) {
      setError('Please select at least one nationality');
      return;
    }
    
    // Each nationality is a SEPARATE badge (so "match all" requires ALL countries)
    // Add each selected nationality as its own badge entry
    setBadgeRequirements(prev => {
      const newBadges = selectedNationalities
        .filter(code => !prev.some(b => b.type === 'nationality' && b.values?.includes(code))) // Avoid duplicates
        .map(code => ({ type: 'nationality' as const, values: [code] }));
      
      return [...prev, ...newBadges];
    });
    
    setSelectedNationalities([]);
    setShowNationalityPicker(false);
    setShowIndividualCountryPicker(false);
  };

  const handleAddEmailBadge = () => {
    if (!emailDomain.trim()) {
      setError('Please enter an email domain');
      return;
    }
    const domain = emailDomain.startsWith('@') ? emailDomain : `@${emailDomain}`;
    if (badgeRequirements.some(b => b.type === 'company' && b.value === domain)) {
      setError('This email domain is already added');
      return;
    }
    setBadgeRequirements(prev => [...prev, { type: 'company', value: domain }]);
    setEmailDomain('');
  };

  const removeBadge = (index: number) => {
    setBadgeRequirements(prev => prev.filter((_, i) => i !== index));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!communityDetails.name.trim()) {
        setError('Community name is required');
        return;
      }
      if (communityDetails.name.length > 20) {
        setError('Community name must be 20 characters or less');
        return;
      }
      if (!communityDetails.shortDescription.trim()) {
        setError('Short description is required');
        return;
      }
      if (communityDetails.shortDescription.trim().length < 10) {
        setError('Short description must be at least 10 characters');
        return;
      }
      if (communityDetails.shortDescription.length > 80) {
        setError('Short description must be 80 characters or less');
        return;
      }
      // Avatar is optional - will default to globe emoji if not provided
    }
    if (currentStep === 2) {
      // Validate step 2
      if (badgeRequirements.length === 0) {
        setError('Please add at least one badge requirement');
        return;
      }
      // If multiple badges, validate combination logic is selected
      if (badgeRequirements.length > 1 && !combinationLogic) {
        setError('Please select combination logic');
        return;
      }
      // Create community (no separate step 3 anymore)
      handleCreateCommunity();
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Verify user owns the required badges based on combination logic
  const verifyBadgeOwnership = (): { valid: boolean; error?: string } => {
    if (badgeRequirements.length === 0) {
      return { valid: false, error: 'Please add at least one badge requirement' };
    }

    // Get user's actual badges
    const userHasAge = ageBadge?.hasVerifiedBadge || false;
    const userNationality = nationalityBadge?.nationality || null; // e.g., "DEU" or "D<<"
    const userEmailDomain = companyBadge?.domain || null; // e.g., "openbands.xyz"

    // Normalize user nationality (MRZ format -> ISO-3 standard)
    const normalizedUserNationality = userNationality ? normalizeMRZCode(userNationality) : null;

    // Check each required badge
    const ownedBadges: string[] = [];
    const missingBadges: string[] = [];

    console.log('[Wizard] Verifying badge ownership:', {
      userHasAge,
      userNationality: normalizedUserNationality,
      userEmailDomain,
      combinationLogic,
      badgeRequirements
    });

    for (const requirement of badgeRequirements) {
      if (requirement.type === 'age') {
        if (userHasAge) {
          ownedBadges.push('Age (18+)');
        } else {
          missingBadges.push('Age (18+)');
        }
      } else if (requirement.type === 'nationality') {
        // Check if user's nationality is in the required list
        // NOTE: Multiple nationalities = ONE badge (user needs ANY of them)
        const requiredNationalities = requirement.values || [];
        const normalizedRequired = requiredNationalities.map(code => normalizeMRZCode(code));
        
        console.log('[Wizard] Checking nationality:', {
          userNationality: normalizedUserNationality,
          required: normalizedRequired,
          match: normalizedRequired.includes(normalizedUserNationality || '')
        });
        
        if (normalizedUserNationality && normalizedRequired.includes(normalizedUserNationality)) {
          ownedBadges.push(`Nationality (${commonNames[normalizedUserNationality as keyof typeof commonNames] || normalizedUserNationality})`);
        } else {
          const missingList = requiredNationalities
            .map(code => commonNames[code as keyof typeof commonNames] || code)
            .join(', ');
          missingBadges.push(`Nationality (${missingList})`);
        }
      } else if (requirement.type === 'company') {
        const requiredDomain = requirement.value?.replace('@', '').trim() || '';
        if (userEmailDomain && userEmailDomain.toLowerCase() === requiredDomain.toLowerCase()) {
          ownedBadges.push(`Email (${requirement.value})`);
        } else {
          missingBadges.push(`Email (${requirement.value})`);
        }
      }
    }

    console.log('[Wizard] Verification result:', { ownedBadges, missingBadges, combinationLogic });

    // Apply combination logic
    if (combinationLogic === 'all') {
      // User must own ALL badges
      if (missingBadges.length > 0) {
        return {
          valid: false,
          error: `You don't own all required badges. Missing: ${missingBadges.join(', ')}. You own: ${ownedBadges.length > 0 ? ownedBadges.join(', ') : 'none'}.`,
        };
      }
    } else {
      // User must own AT LEAST ONE badge
      if (ownedBadges.length === 0) {
        return {
          valid: false,
          error: `You don't own any of the required badges. Required: ${badgeRequirements.map(b => {
            if (b.type === 'age') return 'Age (18+)';
            if (b.type === 'nationality') return `Nationality (${b.values?.map(code => commonNames[code as keyof typeof commonNames] || code).join(', ') || ''})`;
            if (b.type === 'company') return `Email (${b.value})`;
            return '';
          }).join(', ')}.`,
        };
      }
    }

    return { valid: true };
  };

  // Create community
  const handleCreateCommunity = async () => {
    if (!address) return;

    setIsCreating(true);
    setError(null);

    try {
      // Verify badge ownership before proceeding
      const verification = verifyBadgeOwnership();
      if (!verification.valid) {
        setError(verification.error || 'Badge verification failed');
        setIsCreating(false);
        return;
      }

      // Prepare badge requirements for API
      // Convert badge requirements to API format
      const badgeRequirementsForAPI = badgeRequirements.map(req => {
        if (req.type === 'age') {
          return { type: 'age', value: 'verified' };
        } else if (req.type === 'nationality') {
          return { type: 'nationality', values: req.values || [] };
        } else if (req.type === 'company') {
          return { type: 'company', value: req.value?.replace('@', '').trim() || '' };
        }
        return null;
      }).filter(Boolean) as Array<{ type: 'age' | 'nationality' | 'company'; value?: string; values?: string[] }>;

      // Determine primary attestation type for backwards compatibility
      // (used for community ID generation, contract selection, and primary display)
      // Priority: Nationality > Age > Company
      // Note: All badges are verified regardless of primary type; this only affects display/contract selection
      const nationalityBadgeReq = badgeRequirements.find(b => b.type === 'nationality');
      const ageBadgeReq = badgeRequirements.find(b => b.type === 'age');
      const emailBadgeReq = badgeRequirements.find(b => b.type === 'company');

      let primaryAttestationType: 'nationality' | 'company' | 'age';
      let primaryAttestationValues: string[] | undefined;
      let primaryAttestationValue: string;

      if (nationalityBadgeReq) {
        primaryAttestationType = 'nationality';
        primaryAttestationValues = nationalityBadgeReq.values;
        primaryAttestationValue = nationalityBadgeReq.values![0];
      } else if (ageBadgeReq) {
        primaryAttestationType = 'age';
        primaryAttestationValue = 'verified';
        primaryAttestationValues = undefined;
      } else if (emailBadgeReq) {
        primaryAttestationType = 'company';
        primaryAttestationValue = emailBadgeReq.value!.replace('@', '').trim();
        primaryAttestationValues = undefined;
      } else {
        // Fallback (shouldn't happen if validation is correct)
        primaryAttestationType = 'age';
        primaryAttestationValue = 'verified';
        primaryAttestationValues = undefined;
      }

      // Generate message to sign
      const timestamp = Date.now();
      const message = JSON.stringify({
        name: communityDetails.name,
        description: communityDetails.about || communityDetails.shortDescription,
        shortDescription: communityDetails.shortDescription,
        rules: communityDetails.rules.split('\n').filter(r => r.trim()),
        badgeRequirements: badgeRequirementsForAPI,
        primaryAttestationType,
        primaryAttestationValues,
        combinationLogic: badgeRequirements.length > 1 ? combinationLogic : undefined,
        timestamp,
      });

      const signature = await signMessageAsync({ message });

      // Upload avatar image to Supabase Storage if exists
      let avatarUrl: string | null = null;
      if (communityDetails.avatarImage) {
        try {
          const formData = new FormData();
          formData.append('file', communityDetails.avatarImage);
          
          const uploadResponse = await fetch('/api/communities/upload-avatar', {
            method: 'POST',
            body: formData,
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Failed to upload avatar image');
          }
          
          avatarUrl = uploadResult.avatarUrl;
          console.log('[Create Community] Avatar uploaded:', avatarUrl);
        } catch (uploadError) {
          console.error('[Create Community] Avatar upload error:', uploadError);
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload avatar image');
          setIsCreating(false);
          return;
        }
      }

      // Call API
      const response = await fetch('/api/communities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: communityDetails.name,
          description: communityDetails.about || communityDetails.shortDescription,
          shortDescription: communityDetails.shortDescription,
          rules: communityDetails.rules.split('\n').filter(r => r.trim()),
          badgeRequirements: badgeRequirementsForAPI,
          primaryAttestationType,
          primaryAttestationValues,
          walletAddress: address,
          signature,
          timestamp,
          combinationLogic: badgeRequirements.length > 1 ? combinationLogic : undefined,
          avatarUrl, // Send Supabase Storage public URL
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Community creation failed');
      }

      setCreatedCommunity(result.community);
      setCurrentStep(3); // Success screen
      onCommunityCreated?.();
    } catch (err) {
      console.error('[Create Community] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Community Name *
            </label>
            <input
              type="text"
              value={communityDetails.name}
              onChange={(e) => setCommunityDetails(prev => ({ ...prev, name: e.target.value.slice(0, 20) }))}
              placeholder="e.g., PSE Community"
              required
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{communityDetails.name.length}/20 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Short Description *
            </label>
            <input
              type="text"
              value={communityDetails.shortDescription}
              onChange={(e) => setCommunityDetails(prev => ({ ...prev, shortDescription: e.target.value.slice(0, 80) }))}
              placeholder="Brief description of your community (at least 10 characters)"
              required
              maxLength={80}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className={`text-xs mt-1 ${communityDetails.shortDescription.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
              {communityDetails.shortDescription.length}/80 characters (minimum 10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              About (optional)
            </label>
            <textarea
              value={communityDetails.about}
              onChange={(e) => setCommunityDetails(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Detailed description of your community"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{communityDetails.about.length}/1000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Rules (optional)
            </label>
            <textarea
              value={communityDetails.rules}
              onChange={(e) => setCommunityDetails(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Enter one rule per line"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter one rule per line</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Community Logo (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {communityDetails.avatarPreview ? (
                <div className="space-y-2">
                  <img src={communityDetails.avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full mx-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => setCommunityDetails(prev => ({ ...prev, avatarImage: null, avatarPreview: null }))}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Click to upload
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Defaults to 🌍 globe emoji if not provided</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      // Get user's badges for display
      const userHasAge = ageBadge?.hasVerifiedBadge || false;
      const userNationality = nationalityBadge?.nationality || null;
      const normalizedUserNationality = userNationality ? normalizeMRZCode(userNationality) : null;
      const userEmailDomain = companyBadge?.domain || null;

      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Badge Requirements</h3>
            
            {/* User's Badges Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-2">Your verified badges:</p>
              <div className="flex flex-wrap gap-2">
                {userHasAge && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">✓ Age (18+)</span>}
                {normalizedUserNationality && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    ✓ Nationality ({commonNames[normalizedUserNationality as keyof typeof commonNames] || normalizedUserNationality})
                  </span>
                )}
                {userEmailDomain && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    ✓ Email (@{userEmailDomain})
                  </span>
                )}
                {!userHasAge && !normalizedUserNationality && !userEmailDomain && (
                  <span className="text-xs text-blue-600">No verified badges yet</span>
                )}
              </div>
            </div>
            
            {/* Age Badge - Always Show */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    🎂
                  </div>
                  <div>
                    <p className="font-medium">Age (18+)</p>
                    <p className="text-sm text-gray-500">Users must be 18 or older</p>
                  </div>
                </div>
                {badgeRequirements.some(b => b.type === 'age') ? (
                  <span className="text-sm text-green-600">Added</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddAgeBadge}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Badge
                  </button>
                )}
              </div>
            </div>

            {/* Nationality Badge - Always Show */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    🌍
                  </div>
                  <div>
                    <p className="font-medium">Nationality</p>
                    <p className="text-sm text-gray-500">Each country will be a separate badge</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Pre-populate selectedNationalities with already-selected countries
                    const existingCodes = badgeRequirements
                      .filter(b => b.type === 'nationality')
                      .flatMap(b => b.values || []);
                    setSelectedNationalities([...existingCodes]);
                    setShowNationalityPicker(!showNationalityPicker);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {badgeRequirements.some(b => b.type === 'nationality') ? 'Add More Countries' : 'Select Nationalities'}
                </button>
              </div>

              {showNationalityPicker && (
                <div className="mt-4 space-y-3">
                  {/* Quick Select Groups */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(COUNTRY_GROUPS) as CountryGroupKey[]).slice(0, 6).map(groupKey => (
                        <button
                          key={groupKey}
                          type="button"
                          onClick={() => setSelectedNationalities(COUNTRY_GROUPS[groupKey].countries)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          {COUNTRY_GROUPS[groupKey].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Individual Country Picker Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowIndividualCountryPicker(!showIndividualCountryPicker)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showIndividualCountryPicker ? '- Hide country list' : '+ Add individual countries'}
                    </button>
                  </div>

                  {/* Individual Country Picker List */}
                  {showIndividualCountryPicker && (
                    <div className="p-3 border border-gray-200 rounded-lg max-h-[200px] overflow-y-auto bg-gray-50">
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(commonNames)
                          .filter(([code]) => !isMRZCode(code)) // Filter out non-standard MRZ codes (e.g., D<<)
                          .map(([code, name]) => (
                          <label key={code} className="flex items-center gap-2 text-sm hover:bg-gray-100 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedNationalities.includes(code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNationalities(prev => [...prev, code]);
                                } else {
                                  setSelectedNationalities(prev => prev.filter(c => c !== code));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-xs">{name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Nationalities */}
                  {selectedNationalities.length > 0 && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedNationalities.map(code => (
                          <span
                            key={code}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {commonNames[code as keyof typeof commonNames] || code}
                            <button
                              type="button"
                              onClick={() => setSelectedNationalities(prev => prev.filter(c => c !== code))}
                              className="hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNationalityBadge}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Add Badge(s)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Badge - Always Show */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    ✉️
                  </div>
                  <div>
                    <p className="font-medium">Email Domain</p>
                    <p className="text-sm text-gray-500">Users must have an email from this domain</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="@openbands.xyz"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmailBadge}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add Badge
                </button>
              </div>
            </div>

            {/* Selected Badges */}
            {badgeRequirements.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-3">Selected Badges (each is separate):</p>
                <div className="space-y-2">
                  {badgeRequirements.map((badge, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex flex-wrap gap-1 items-center">
                        {badge.type === 'age' && <span className="text-sm">🎂 Age (18+)</span>}
                        {badge.type === 'nationality' && badge.values && badge.values.length === 1 && (
                          <span className="text-sm">
                            {getCountryFlagEmoji(badge.values[0])} {commonNames[badge.values[0] as keyof typeof commonNames] || badge.values[0]}
                          </span>
                        )}
                        {badge.type === 'company' && <span className="text-sm">✉️ {badge.value}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBadge(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Combination Logic - Show only if multiple badges */}
            {badgeRequirements.length > 1 && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-md font-semibold mb-2">Combination Logic</h4>
                <p className="text-sm text-gray-600 mb-4">Define how you want to compare the badges</p>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                    <input
                      type="radio"
                      name="combinationLogic"
                      value="any"
                      checked={combinationLogic === 'any'}
                      onChange={() => setCombinationLogic('any')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">Match any badge</p>
                      <p className="text-sm text-gray-500">Users with one of the listed badges can join</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                    <input
                      type="radio"
                      name="combinationLogic"
                      value="all"
                      checked={combinationLogic === 'all'}
                      onChange={() => setCombinationLogic('all')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">Match all badges</p>
                      <p className="text-sm text-gray-500">Only users matching all listed badges are allowed to join</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Community created!</h2>
            <p className="text-gray-600">
              Your community "{createdCommunity?.name || communityDetails.name}" has been successfully created and is ready to welcome members.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                // Navigate to community page
                if (createdCommunity?.communityId) {
                  window.location.href = `/communities/${createdCommunity.communityId}`;
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View the community
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Community</h2>
            {currentStep < 3 && (
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep} of 2
              </p>
            )}
          </div>
          {currentStep < 3 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {currentStep < 3 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded ${
                    step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer Navigation */}
        {currentStep < 3 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            {/* Error Message - Always at the bottom above buttons */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={isCreating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isCreating ? 'Creating...' : currentStep === 2 ? 'Create Community' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

