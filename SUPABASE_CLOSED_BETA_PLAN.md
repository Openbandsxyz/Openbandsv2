# OpenBands v2 - Supabase Closed Beta Plan

**Version**: 1.0  
**Date**: October 31, 2025  
**Status**: Ready for Implementation  
**Target**: Closed beta with 50-100 users

---

## Executive Summary

This document outlines a **centralized, Supabase-first approach** for the closed beta launch of permissionless community creation. The focus is on rapid iteration, gathering user feedback, and validating core assumptions before investing in full decentralization.

**Key Principle**: Keep it simple. Validate product-market fit first, then decentralize.

**Critical Constraints**:
1. Users can ONLY create communities for badges they possess (on-chain verified)
2. Users can ONLY join communities if they have the required badge (on-chain verified)
3. Users can ONLY post/comment if they have joined AND still possess the required badge
4. All verification happens against deployed smart contracts (no mock data)

---

## Table of Contents

1. [Beta Goals & Success Criteria](#1-beta-goals--success-criteria)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [Verification & Access Control](#4-verification--access-control)
5. [API Design](#5-api-design)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Security Model](#7-security-model)
8. [Testing Strategy](#8-testing-strategy)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Migration Path to Decentralized](#10-migration-path-to-decentralized)
11. [Critical Issues & Solutions](#11-critical-issues--solutions)

---

## 1. Beta Goals & Success Criteria

### 1.1 Primary Goals

**Product Validation**:
- ✅ Users can create communities for their verified badges
- ✅ Badge-gated access works reliably
- ✅ Users understand the flow without confusion
- ✅ Core UX is smooth (< 5 seconds for any action)

**User Feedback**:
- ✅ Gather feedback on community creation flow
- ✅ Identify pain points in badge verification
- ✅ Understand desired community types
- ✅ Test posting and engagement patterns

**Technical Validation**:
- ✅ On-chain verification is reliable
- ✅ Access control prevents unauthorized access
- ✅ Supabase performance is adequate (< 500ms queries)
- ✅ No critical bugs or security issues

### 1.2 Success Metrics

**Week 1-2 (Launch)**:
- 50 users onboarded
- 10+ communities created
- 100+ posts created
- Zero security breaches

**Week 3-4 (Growth)**:
- 80% user retention
- 5+ communities with 10+ members
- 50+ posts/day
- < 5% error rate in badge verification

**Feedback Quality**:
- 20+ detailed feedback responses
- Identified 3-5 major UX improvements
- Clear understanding of which badge types users want most

### 1.3 Beta Constraints

**User Limits**:
- Max 100 invited users (closed beta)
- Invite-only signup (no public access)
- Manual approval for first 50 users

**Feature Scope**:
- ❌ No IPFS (coming in V2)
- ❌ No on-chain registry (coming in V2)
- ❌ No content moderation (manual for beta)
- ❌ No notifications (coming in V2)
- ✅ Nationality communities only (simplest to verify)
- ✅ Company communities (already working)
- ⚠️ Age communities (if time permits)

**Data**:
- All content stored in Supabase (centralized)
- Easy to export for IPFS migration later
- Clear data ownership and privacy policy

---

## 2. Architecture Overview

### 2.1 Simplified Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Community Creation │ Join Flow │ Post/Comment       │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐   ┌─────────────────┐
│   Wagmi/Viem  │   │  Next.js APIs   │
│  (Read Only)  │   │  (Server-Side)  │
└───────┬───────┘   └────────┬────────┘
        │                    │
        ▼                    ▼
┌──────────────────┐   ┌──────────────────┐
│ Smart Contracts  │   │    Supabase      │
│ - Nationality    │   │  - Communities   │
│ - Age            │   │  - Members       │
│ - Company Email  │   │  - Posts         │
└──────────────────┘   │  - Comments      │
                       └──────────────────┘
```

### 2.2 Component Responsibilities

**Smart Contracts** (Read-Only):
- Source of truth for badge ownership
- No writes needed for beta
- Queries: `isUserVerified()`, `getUserNationality()`, etc.

**Next.js Backend APIs**:
- Verify badge ownership before any write
- CRUD operations for communities, posts, comments
- Access control enforcement
- Rate limiting

**Supabase**:
- Store ALL content (communities, posts, comments)
- User membership tracking
- Fast queries for feeds and discovery
- Row-level security policies

**Frontend**:
- Badge verification UI
- Community creation form
- Join button with verification
- Post/comment composers (only if authorized)

### 2.3 Data Flow

**Community Creation**:
1. User has verified badge on-chain (prerequisite)
2. User fills out community form (name, description)
3. Frontend reads badge from smart contract
4. Frontend calls API: `/api/communities/create`
5. API verifies badge on-chain (double-check)
6. API inserts into Supabase `communities` table
7. Return community to user

**Joining Community**:
1. User clicks "Join" button
2. Frontend reads user's badge from smart contract
3. Frontend calls API: `/api/communities/[id]/join`
4. API verifies badge matches community requirement
5. API inserts into Supabase `community_members` table
6. Return success

**Creating Post**:
1. User writes post in community
2. Frontend checks user is a member (read from Supabase)
3. Frontend calls API: `/api/communities/[id]/posts`
4. API verifies user is member + still has badge
5. API inserts into Supabase `posts` table
6. Return post to user

---

## 3. Database Schema

### 3.1 Core Tables

#### `communities` Table

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  community_id VARCHAR(255) UNIQUE NOT NULL, -- Generated: "nationality-DEU-1730332800000"
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Badge Requirements
  attestation_type VARCHAR(50) NOT NULL CHECK (attestation_type IN ('nationality', 'age', 'company')),
  attestation_value VARCHAR(100) NOT NULL, -- "DEU", "21+", "google.com"
  
  -- Contract Info (for verification)
  required_contract_address VARCHAR(42) NOT NULL,
  required_contract_network VARCHAR(20) NOT NULL, -- "celo", "base"
  required_contract_chain_id INTEGER NOT NULL,
  
  -- Creator Info
  creator_address VARCHAR(42) NOT NULL,
  creator_verified_at BIGINT NOT NULL, -- When creator verified their badge
  
  -- Metadata
  rules TEXT[], -- Array of community rules
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communities_attestation_type ON communities(attestation_type);
CREATE INDEX idx_communities_attestation_value ON communities(attestation_value);
CREATE INDEX idx_communities_creator ON communities(creator_address);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX idx_communities_active ON communities(is_active) WHERE is_active = true;

-- Unique constraint: One community per attestation
CREATE UNIQUE INDEX idx_communities_unique_attestation 
  ON communities(attestation_type, attestation_value) 
  WHERE is_active = true;

-- Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active communities
CREATE POLICY "Communities are viewable by everyone" 
  ON communities FOR SELECT 
  USING (is_active = true);

-- Policy: Only authenticated users can create (verified in API)
CREATE POLICY "Authenticated users can create communities" 
  ON communities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```

#### `community_members` Table

```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  member_address VARCHAR(42) NOT NULL,
  
  -- Verification Info
  attestation_verified_at BIGINT NOT NULL, -- When user's badge was verified at join time
  attestation_value VARCHAR(100) NOT NULL, -- Snapshot of their badge value at join time
  
  -- Status
  is_active BOOLEAN DEFAULT true, -- Can be set to false if they lose badge (future)
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  -- Unique constraint: One membership per user per community
  UNIQUE(community_id, member_address)
);

-- Indexes
CREATE INDEX idx_members_community ON community_members(community_id, joined_at DESC);
CREATE INDEX idx_members_user ON community_members(member_address, joined_at DESC);
CREATE INDEX idx_members_active ON community_members(is_active) WHERE is_active = true;

-- Row Level Security
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active members
CREATE POLICY "Community members are viewable by everyone" 
  ON community_members FOR SELECT 
  USING (is_active = true);

-- Policy: Only authenticated users can join (verified in API)
CREATE POLICY "Authenticated users can join communities" 
  ON community_members FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```

#### `posts` Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  
  -- Author Info (anonymous but verifiable)
  author_address VARCHAR(42) NOT NULL,
  author_anonymous_id VARCHAR(100) NOT NULL, -- "Anon-DEU-1234"
  
  -- Content
  title VARCHAR(255), -- Optional
  content TEXT NOT NULL CHECK (char_length(content) <= 10000),
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false, -- For moderation
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_community ON posts(community_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_address, created_at DESC);
CREATE INDEX idx_posts_active ON posts(is_active) WHERE is_active = true;
CREATE INDEX idx_posts_hot ON posts(community_id, like_count DESC, created_at DESC);

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active posts
CREATE POLICY "Posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (is_active = true);

-- Policy: Only authenticated members can create posts (verified in API)
CREATE POLICY "Authenticated members can create posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update their own posts" 
  ON posts FOR UPDATE 
  USING (author_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
```

#### `comments` Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  
  -- Author Info
  author_address VARCHAR(42) NOT NULL,
  author_anonymous_id VARCHAR(100) NOT NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_author ON comments(author_address, created_at DESC);
CREATE INDEX idx_comments_active ON comments(is_active) WHERE is_active = true;
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active comments
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (is_active = true);

-- Policy: Only authenticated members can create comments (verified in API)
CREATE POLICY "Authenticated members can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```

#### `likes` Table (Optional but Recommended)

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  
  user_address VARCHAR(42) NOT NULL,
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: One like per user per target
  UNIQUE(target_type, target_id, user_address)
);

-- Indexes
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_user ON likes(user_address, created_at DESC);

-- Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" 
  ON likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like" 
  ON likes FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```

### 3.2 Helper Views

#### `community_stats` View

```sql
CREATE OR REPLACE VIEW community_stats AS
SELECT 
  c.id,
  c.community_id,
  c.name,
  c.attestation_type,
  c.attestation_value,
  COUNT(DISTINCT cm.member_address) FILTER (WHERE cm.is_active = true) as member_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) as post_count,
  MAX(p.created_at) as last_post_at
FROM communities c
LEFT JOIN community_members cm ON c.community_id = cm.community_id
LEFT JOIN posts p ON c.community_id = p.community_id
WHERE c.is_active = true
GROUP BY c.id, c.community_id, c.name, c.attestation_type, c.attestation_value;
```

---

## 4. Verification & Access Control

### 4.1 Badge Verification Logic

#### Server-Side Verification Functions

```typescript
// lib/verification/badge-verification.ts
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi-config';

/**
 * Verify user has nationality badge
 */
export async function verifyNationalityBadge(
  userAddress: string
): Promise<{ 
  isVerified: boolean; 
  nationality: string | null;
  verifiedAt: bigint | null;
}> {
  try {
    const NATIONALITY_REGISTRY = "0x5aCA8d5C9F44D69Fa48cCeCb6b566475c2A5961a";
    const CELO_MAINNET = 42220;
    
    // Check if user is verified
    const isVerified = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY as `0x${string}`,
      abi: nationalityRegistryAbi,
      functionName: 'isUserVerified',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    });
    
    if (!isVerified) {
      return { isVerified: false, nationality: null, verifiedAt: null };
    }
    
    // Get nationality
    const nationality = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY as `0x${string}`,
      abi: nationalityRegistryAbi,
      functionName: 'getUserNationality',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as string;
    
    // Get record for timestamp
    const record = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY as `0x${string}`,
      abi: nationalityRegistryAbi,
      functionName: 'getNationalityRecord',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as { verifiedAt: bigint };
    
    return {
      isVerified: true,
      nationality,
      verifiedAt: record.verifiedAt,
    };
  } catch (error) {
    console.error('Nationality verification failed:', error);
    return { isVerified: false, nationality: null, verifiedAt: null };
  }
}

/**
 * Verify user has company email badge
 */
export async function verifyCompanyBadge(
  userAddress: string
): Promise<{
  isVerified: boolean;
  domain: string | null;
  verifiedAt: bigint | null;
}> {
  try {
    const ZKJWT_MANAGER = process.env.NEXT_PUBLIC_ZKJWT_PROOF_MANAGER_ADDRESS!;
    const BASE_MAINNET = 8453;
    
    // Get all proofs
    const allProofs = await readContract(wagmiConfig, {
      address: ZKJWT_MANAGER as `0x${string}`,
      abi: zkJwtProofManagerAbi,
      functionName: 'getPublicInputsOfAllProofs',
      chainId: BASE_MAINNET,
    }) as Array<{
      domain: string;
      walletAddress: string;
      createdAt: string;
    }>;
    
    // Find proof for this user
    const userProof = allProofs.find(
      proof => proof.walletAddress.toLowerCase() === userAddress.toLowerCase()
    );
    
    if (!userProof || !userProof.domain) {
      return { isVerified: false, domain: null, verifiedAt: null };
    }
    
    return {
      isVerified: true,
      domain: userProof.domain,
      verifiedAt: BigInt(userProof.createdAt),
    };
  } catch (error) {
    console.error('Company verification failed:', error);
    return { isVerified: false, domain: null, verifiedAt: null };
  }
}

/**
 * Verify user has age badge
 */
export async function verifyAgeBadge(
  userAddress: string
): Promise<{
  isVerified: boolean;
  verifiedAt: bigint | null;
}> {
  try {
    const AGE_REGISTRY = "0x72f1619824bcD499F4a27E28Bf9F1aa913c2EF2a";
    const CELO_MAINNET = 42220;
    
    const isVerified = await readContract(wagmiConfig, {
      address: AGE_REGISTRY as `0x${string}`,
      abi: ageRegistryAbi,
      functionName: 'isUserVerified',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    });
    
    if (!isVerified) {
      return { isVerified: false, verifiedAt: null };
    }
    
    const record = await readContract(wagmiConfig, {
      address: AGE_REGISTRY as `0x${string}`,
      abi: ageRegistryAbi,
      functionName: 'getAgeRecord',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as { verifiedAt: bigint };
    
    return {
      isVerified: true,
      verifiedAt: record.verifiedAt,
    };
  } catch (error) {
    console.error('Age verification failed:', error);
    return { isVerified: false, verifiedAt: null };
  }
}

/**
 * Generic verification router
 */
export async function verifyUserBadge(
  userAddress: string,
  attestationType: 'nationality' | 'age' | 'company',
  requiredValue?: string // Only for nationality/company
): Promise<{
  isVerified: boolean;
  actualValue: string | null;
  verifiedAt: bigint | null;
  error?: string;
}> {
  switch (attestationType) {
    case 'nationality': {
      const result = await verifyNationalityBadge(userAddress);
      
      if (!result.isVerified) {
        return { 
          isVerified: false, 
          actualValue: null, 
          verifiedAt: null,
          error: 'User has not verified nationality' 
        };
      }
      
      // Check if nationality matches required value
      if (requiredValue && result.nationality !== requiredValue) {
        return {
          isVerified: false,
          actualValue: result.nationality,
          verifiedAt: result.verifiedAt,
          error: `User nationality (${result.nationality}) does not match required (${requiredValue})`,
        };
      }
      
      return {
        isVerified: true,
        actualValue: result.nationality,
        verifiedAt: result.verifiedAt,
      };
    }
    
    case 'company': {
      const result = await verifyCompanyBadge(userAddress);
      
      if (!result.isVerified) {
        return {
          isVerified: false,
          actualValue: null,
          verifiedAt: null,
          error: 'User has not verified company email',
        };
      }
      
      // Check if domain matches required value
      if (requiredValue && result.domain !== requiredValue) {
        return {
          isVerified: false,
          actualValue: result.domain,
          verifiedAt: result.verifiedAt,
          error: `User domain (${result.domain}) does not match required (${requiredValue})`,
        };
      }
      
      return {
        isVerified: true,
        actualValue: result.domain,
        verifiedAt: result.verifiedAt,
      };
    }
    
    case 'age': {
      const result = await verifyAgeBadge(userAddress);
      
      if (!result.isVerified) {
        return {
          isVerified: false,
          actualValue: null,
          verifiedAt: null,
          error: 'User has not verified age',
        };
      }
      
      return {
        isVerified: true,
        actualValue: 'verified', // Age doesn't have specific value in MVP
        verifiedAt: result.verifiedAt,
      };
    }
    
    default:
      return {
        isVerified: false,
        actualValue: null,
        verifiedAt: null,
        error: 'Invalid attestation type',
      };
  }
}
```

### 4.2 Membership Verification

```typescript
// lib/verification/membership.ts
import { supabase } from '@/lib/supabase';

/**
 * Check if user is a member of a community
 */
export async function isCommunityMember(
  userAddress: string,
  communityId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('member_address', userAddress.toLowerCase())
    .eq('is_active', true)
    .single();
  
  return !!data && !error;
}

/**
 * Check if user can join a community (has required badge)
 */
export async function canJoinCommunity(
  userAddress: string,
  communityId: string
): Promise<{
  canJoin: boolean;
  reason?: string;
  community?: any;
}> {
  // Get community info
  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .single();
  
  if (error || !community) {
    return { canJoin: false, reason: 'Community not found' };
  }
  
  // Check if already a member
  const isAlreadyMember = await isCommunityMember(userAddress, communityId);
  if (isAlreadyMember) {
    return { canJoin: false, reason: 'Already a member', community };
  }
  
  // Verify user has required badge
  const verification = await verifyUserBadge(
    userAddress,
    community.attestation_type,
    community.attestation_value
  );
  
  if (!verification.isVerified) {
    return {
      canJoin: false,
      reason: verification.error || 'Badge verification failed',
      community,
    };
  }
  
  return { canJoin: true, community };
}

/**
 * Check if user can post in a community
 */
export async function canPostInCommunity(
  userAddress: string,
  communityId: string
): Promise<{
  canPost: boolean;
  reason?: string;
}> {
  // Check membership
  const isMember = await isCommunityMember(userAddress, communityId);
  if (!isMember) {
    return { canPost: false, reason: 'Not a member of this community' };
  }
  
  // Get community to check badge requirement
  const { data: community } = await supabase
    .from('communities')
    .select('attestation_type, attestation_value')
    .eq('community_id', communityId)
    .single();
  
  if (!community) {
    return { canPost: false, reason: 'Community not found' };
  }
  
  // Re-verify user still has the badge (in case revoked)
  const verification = await verifyUserBadge(
    userAddress,
    community.attestation_type,
    community.attestation_value
  );
  
  if (!verification.isVerified) {
    return {
      canPost: false,
      reason: 'Badge verification failed. You may have lost your badge.',
    };
  }
  
  return { canPost: true };
}
```

### 4.3 Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Usage in API routes:
// const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });
// await limiter.check(10, walletAddress); // 10 requests per minute
```

---

## 5. API Design

### 5.1 Community APIs

#### `POST /api/communities/create`

**Purpose**: Create a new community

**Authentication**: Required (wallet address)

**Request Body**:
```typescript
{
  name: string; // 3-100 chars
  description: string; // 10-500 chars
  rules?: string[]; // Optional array of rules
  attestationType: "nationality" | "age" | "company";
  walletAddress: string;
  signature: string; // Wallet signature of request data
}
```

**Response**:
```typescript
{
  success: boolean;
  community?: {
    id: string;
    communityId: string;
    name: string;
    attestationType: string;
    attestationValue: string;
    createdAt: string;
  };
  error?: string;
}
```

**Implementation**:

```typescript
// app/api/communities/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { supabase } from '@/lib/supabase';
import { verifyUserBadge } from '@/lib/verification/badge-verification';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 500 });

export async function POST(req: NextRequest) {
  try {
    const { name, description, rules, attestationType, walletAddress, signature } = 
      await req.json();
    
    // Rate limit: 5 community creations per hour per wallet
    try {
      await limiter.check(5, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    // Validate input
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid name (3-100 characters required)' 
      }, { status: 400 });
    }
    
    if (!description || description.length < 10 || description.length > 500) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid description (10-500 characters required)' 
      }, { status: 400 });
    }
    
    if (!['nationality', 'age', 'company'].includes(attestationType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid attestation type' 
      }, { status: 400 });
    }
    
    // Verify signature
    const message = JSON.stringify({
      name,
      description,
      rules: rules || [],
      attestationType,
      timestamp: Date.now(),
    });
    
    let isValidSignature = false;
    try {
      isValidSignature = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (error) {
      console.error('Signature verification error:', error);
    }
    
    if (!isValidSignature) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid signature' 
      }, { status: 401 });
    }
    
    // Verify user has the required badge
    const verification = await verifyUserBadge(walletAddress, attestationType);
    
    if (!verification.isVerified) {
      return NextResponse.json({ 
        success: false, 
        error: verification.error || 'Badge verification failed' 
      }, { status: 403 });
    }
    
    const attestationValue = verification.actualValue!;
    
    // Check if community already exists for this attestation
    const { data: existing } = await supabase
      .from('communities')
      .select('community_id')
      .eq('attestation_type', attestationType)
      .eq('attestation_value', attestationValue)
      .eq('is_active', true)
      .single();
    
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: `A community for this ${attestationType} already exists` 
      }, { status: 409 });
    }
    
    // Determine contract info based on attestation type
    let contractInfo: {
      address: string;
      network: string;
      chainId: number;
    };
    
    switch (attestationType) {
      case 'nationality':
        contractInfo = {
          address: "0x5aCA8d5C9F44D69Fa48cCeCb6b566475c2A5961a",
          network: "celo",
          chainId: 42220,
        };
        break;
      case 'age':
        contractInfo = {
          address: "0x72f1619824bcD499F4a27E28Bf9F1aa913c2EF2a",
          network: "celo",
          chainId: 42220,
        };
        break;
      case 'company':
        contractInfo = {
          address: process.env.NEXT_PUBLIC_ZKJWT_PROOF_MANAGER_ADDRESS!,
          network: "base",
          chainId: 8453,
        };
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid attestation type' 
        }, { status: 400 });
    }
    
    // Generate community ID
    const communityId = `${attestationType}-${attestationValue}-${Date.now()}`;
    
    // Insert into database
    const { data: community, error: dbError } = await supabase
      .from('communities')
      .insert({
        community_id: communityId,
        name,
        description,
        attestation_type: attestationType,
        attestation_value: attestationValue,
        required_contract_address: contractInfo.address,
        required_contract_network: contractInfo.network,
        required_contract_chain_id: contractInfo.chainId,
        creator_address: walletAddress.toLowerCase(),
        creator_verified_at: Number(verification.verifiedAt),
        rules: rules || [],
      })
      .select()
      .single();
    
    if (dbError || !community) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create community' 
      }, { status: 500 });
    }
    
    // Automatically add creator as first member
    await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        member_address: walletAddress.toLowerCase(),
        attestation_verified_at: Number(verification.verifiedAt),
        attestation_value: attestationValue,
      });
    
    return NextResponse.json({
      success: true,
      community: {
        id: community.id,
        communityId: community.community_id,
        name: community.name,
        attestationType: community.attestation_type,
        attestationValue: community.attestation_value,
        createdAt: community.created_at,
      },
    });
  } catch (error) {
    console.error('Community creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

#### `POST /api/communities/[communityId]/join`

**Purpose**: Join a community

**Implementation**:

```typescript
// app/api/communities/[communityId]/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { canJoinCommunity } from '@/lib/verification/membership';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { walletAddress } = await req.json();
    const { communityId } = params;
    
    // Rate limit
    try {
      await limiter.check(10, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded' 
      }, { status: 429 });
    }
    
    // Check if user can join
    const joinCheck = await canJoinCommunity(walletAddress, communityId);
    
    if (!joinCheck.canJoin) {
      return NextResponse.json({ 
        success: false, 
        error: joinCheck.reason 
      }, { status: 403 });
    }
    
    // Get user's current badge value for snapshot
    const verification = await verifyUserBadge(
      walletAddress,
      joinCheck.community.attestation_type,
      joinCheck.community.attestation_value
    );
    
    // Insert membership
    const { data, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        member_address: walletAddress.toLowerCase(),
        attestation_verified_at: Number(verification.verifiedAt),
        attestation_value: verification.actualValue,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Join error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to join community' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      membership: {
        id: data.id,
        communityId: data.community_id,
        joinedAt: data.joined_at,
      },
    });
  } catch (error) {
    console.error('Join community error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

#### `GET /api/communities`

**Purpose**: List all communities

**Query Parameters**:
- `attestationType`: Filter by type (optional)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort`: Sort by `newest` | `popular` (default: newest)

**Implementation**:

```typescript
// app/api/communities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const attestationType = searchParams.get('attestationType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sort = searchParams.get('sort') || 'newest';
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('community_stats')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    // Filter by attestation type
    if (attestationType) {
      query = query.eq('attestation_type', attestationType);
    }
    
    // Sort
    if (sort === 'popular') {
      query = query.order('member_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch communities' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      communities: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('List communities error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

### 5.2 Post APIs

#### `POST /api/communities/[communityId]/posts`

**Purpose**: Create a post in a community

**Implementation**:

```typescript
// app/api/communities/[communityId]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { canPostInCommunity } from '@/lib/verification/membership';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 });

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { walletAddress, title, content, anonymousId } = await req.json();
    const { communityId } = params;
    
    // Rate limit: 10 posts per hour per user
    try {
      await limiter.check(10, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please slow down.' 
      }, { status: 429 });
    }
    
    // Validate content
    if (!content || content.length < 1 || content.length > 10000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content length (1-10,000 characters)' 
      }, { status: 400 });
    }
    
    if (title && title.length > 255) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title too long (max 255 characters)' 
      }, { status: 400 });
    }
    
    // Check if user can post
    const postCheck = await canPostInCommunity(walletAddress, communityId);
    
    if (!postCheck.canPost) {
      return NextResponse.json({ 
        success: false, 
        error: postCheck.reason 
      }, { status: 403 });
    }
    
    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        community_id: communityId,
        author_address: walletAddress.toLowerCase(),
        author_anonymous_id: anonymousId || `Anon-${walletAddress.slice(2, 8)}`,
        title: title || null,
        content,
      })
      .select()
      .single();
    
    if (error || !post) {
      console.error('Post creation error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create post' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorAnonymousId: post.author_anonymous_id,
        createdAt: post.created_at,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sort = searchParams.get('sort') || 'newest';
    
    const offset = (page - 1) * limit;
    const { communityId } = params;
    
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    // Sort
    if (sort === 'hot') {
      query = query.order('like_count', { ascending: false })
                   .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch posts' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      posts: data,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List posts error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

---

## 6. Frontend Implementation

### 6.1 Community Creation Flow

```typescript
// components/CreateCommunityButton.tsx
'use client';

import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useNationalityBadgeCheck } from '@/hooks/useNationalityBadgeCheck';
import { useBadgeCheck } from '@/hooks/useBadgeCheck';
import { useAgeBadgeCheck } from '@/hooks/useAgeBadgeCheck';

export function CreateCommunityButton() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { badgeData: nationalityBadge } = useNationalityBadgeCheck();
  const { badgeData: companyBadge } = useBadgeCheck();
  const { ageBadge } = useAgeBadgeCheck();
  
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    attestationType: 'nationality' as 'nationality' | 'company' | 'age',
  });
  
  // Determine which badges user has
  const availableBadges = [];
  if (nationalityBadge?.hasVerifiedBadge) {
    availableBadges.push({
      type: 'nationality',
      label: `Nationality (${nationalityBadge.countryName})`,
      value: nationalityBadge.nationality,
    });
  }
  if (companyBadge?.hasVerifiedBadge) {
    availableBadges.push({
      type: 'company',
      label: `Company (${companyBadge.domain})`,
      value: companyBadge.domain,
    });
  }
  if (ageBadge?.hasVerifiedBadge) {
    availableBadges.push({
      type: 'age',
      label: 'Age (18+)',
      value: 'verified',
    });
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || availableBadges.length === 0) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Generate signature
      const message = JSON.stringify({
        name: formData.name,
        description: formData.description,
        rules: formData.rules.split('\n').filter(r => r.trim()),
        attestationType: formData.attestationType,
        timestamp: Date.now(),
      });
      
      const signature = await signMessageAsync({ message });
      
      // Call API
      const response = await fetch('/api/communities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          rules: formData.rules.split('\n').filter(r => r.trim()),
          attestationType: formData.attestationType,
          walletAddress: address,
          signature,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Community creation failed');
      }
      
      // Success!
      alert(`Community created: ${result.community.name}`);
      setShowModal(false);
      window.location.href = `/communities/${result.community.communityId}`;
    } catch (err) {
      console.error('Community creation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (availableBadges.length === 0) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        Verify a badge first
      </button>
    );
  }
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Community
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Community</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Badge Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Community Type *
                </label>
                <select
                  value={formData.attestationType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    attestationType: e.target.value as any 
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {availableBadges.map(badge => (
                    <option key={badge.type} value={badge.type}>
                      {badge.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  You can only create communities for badges you possess
                </p>
              </div>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Germany Discussion"
                  required
                  minLength={3}
                  maxLength={100}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this community about?"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              {/* Rules */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Community Rules (optional)
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="One rule per line"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
```

### 6.2 Join Button Component

```typescript
// components/JoinCommunityButton.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface JoinCommunityButtonProps {
  communityId: string;
  attestationType: string;
  attestationValue: string;
  isJoined: boolean;
  onJoinSuccess: () => void;
}

export function JoinCommunityButton({
  communityId,
  attestationType,
  attestationValue,
  isJoined,
  onJoinSuccess,
}: JoinCommunityButtonProps) {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleJoin = async () => {
    if (!address || isJoined) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to join community');
      }
      
      onJoinSuccess();
    } catch (err) {
      console.error('Join error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsJoining(false);
    }
  };
  
  if (isJoined) {
    return (
      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
        ✓ Joined
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={isJoining}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isJoining ? 'Joining...' : 'Join Community'}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

---

## 7. Security Model

### 7.1 Attack Vectors & Mitigations

#### Attack 1: Creating Community Without Badge

**Scenario**: Attacker tries to create community without owning badge

**Mitigation**:
1. ✅ Frontend hides button if no badge
2. ✅ API verifies signature (proves wallet ownership)
3. ✅ API reads smart contract to verify badge (source of truth)
4. ✅ Rate limiting (5 attempts/hour)
5. ✅ Unique constraint in DB (one community per attestation)

**Severity**: High → Mitigated

#### Attack 2: Joining Community Without Badge

**Scenario**: Attacker tries to join without required badge

**Mitigation**:
1. ✅ Frontend checks badge before showing join button
2. ✅ API verifies badge via smart contract before insert
3. ✅ Rate limiting (10 attempts/minute)
4. ✅ Unique constraint (one membership per user per community)

**Severity**: High → Mitigated

#### Attack 3: Posting Without Membership

**Scenario**: Attacker tries to post without joining

**Mitigation**:
1. ✅ Frontend checks membership from Supabase
2. ✅ API verifies membership + badge before insert
3. ✅ Rate limiting (10 posts/hour)
4. ✅ Content length limits

**Severity**: High → Mitigated

#### Attack 4: Spam / Flooding

**Scenario**: User floods community with posts/comments

**Mitigation**:
1. ✅ Rate limiting by wallet address
2. ✅ Content length limits
3. ✅ Cooldown between actions (configurable)
4. ✅ Manual moderation for beta

**Severity**: Medium → Mitigated

#### Attack 5: Badge Revocation

**Scenario**: User joins, then loses badge, still can post

**Current Behavior**: User can still post (membership persists)

**Mitigation Options**:
1. ⚠️ **Soft approach**: Re-check badge on every post (implemented)
2. ⚠️ **Hard approach**: Cron job to deactivate members who lost badges
3. ⚠️ **Hybrid**: Check on post, soft-deactivate if invalid

**For Beta**: Using soft approach (check on post)

**Severity**: Low → Acceptable for beta

#### Attack 6: SQL Injection

**Scenario**: Attacker injects SQL via input fields

**Mitigation**:
1. ✅ Supabase uses parameterized queries
2. ✅ Input validation on all fields
3. ✅ Length limits enforced

**Severity**: High → Mitigated

### 7.2 Data Privacy

**User Data Stored**:
- Wallet addresses (public on blockchain anyway)
- Anonymous IDs (generated, not PII)
- Post/comment content (user-generated)
- Badge types and values (public on blockchain)

**NOT Stored**:
- Email addresses
- Real names
- IP addresses (except temporarily for rate limiting)
- Personal identifiable information

**Privacy Policy Requirements**:
- Clear statement: "We store wallet addresses and content"
- Right to deletion (mark is_active=false)
- Export functionality (JSON export of user's content)

---

## 8. Testing Strategy

### 8.1 Manual Testing Checklist

**Community Creation**:
- [ ] Can create nationality community with verified badge
- [ ] Cannot create without badge
- [ ] Cannot create duplicate community
- [ ] Form validation works (name, description)
- [ ] Rate limiting triggers after 5 attempts
- [ ] Creator automatically becomes member

**Joining**:
- [ ] Can join with matching badge
- [ ] Cannot join without badge
- [ ] Cannot join twice
- [ ] Join button updates to "Joined"
- [ ] Member count increments

**Posting**:
- [ ] Can post when joined + badge valid
- [ ] Cannot post without membership
- [ ] Cannot post if badge lost (revoked)
- [ ] Rate limiting works (10/hour)
- [ ] Post appears in feed immediately

**Edge Cases**:
- [ ] What if Supabase is slow (>5s)?
- [ ] What if smart contract call fails?
- [ ] What if user disconnects wallet mid-action?
- [ ] What if two users try to create same community simultaneously?

### 8.2 Load Testing (Optional)

**Simulate**:
- 50 concurrent users
- 100 communities created
- 1000 posts created
- 5000 page views

**Metrics to Watch**:
- API response time (should be < 500ms p95)
- Supabase query time (should be < 200ms p95)
- Smart contract call time (should be < 2s p95)
- Error rate (should be < 1%)

---

## 9. Implementation Roadmap

### Week 1: Setup & Core Infrastructure

**Day 1-2: Database Setup**
- [ ] Create Supabase project
- [ ] Run SQL migrations for all tables
- [ ] Set up Row Level Security policies
- [ ] Create indexes
- [ ] Test basic CRUD operations

**Day 3-4: Verification Logic**
- [ ] Implement `verifyNationalityBadge()`
- [ ] Implement `verifyCompanyBadge()`
- [ ] Implement `verifyAgeBadge()` (optional)
- [ ] Test against deployed contracts
- [ ] Add error handling and retries

**Day 5-7: API Development**
- [ ] `POST /api/communities/create`
- [ ] `POST /api/communities/[id]/join`
- [ ] `GET /api/communities` (list)
- [ ] `GET /api/communities/[id]` (single)
- [ ] `POST /api/communities/[id]/posts`
- [ ] `GET /api/communities/[id]/posts` (list)
- [ ] Add rate limiting
- [ ] Add input validation

### Week 2: Frontend & Testing

**Day 8-10: Frontend Components**
- [ ] `CreateCommunityButton` component
- [ ] `JoinCommunityButton` component
- [ ] `CommunityList` component
- [ ] `CommunityPage` component
- [ ] `PostComposer` component
- [ ] `PostFeed` component

**Day 11-12: Integration Testing**
- [ ] Test full user flow (verify → create → join → post)
- [ ] Test error cases
- [ ] Test rate limiting
- [ ] Fix bugs

**Day 13-14: Polish & Deploy**
- [ ] Add loading states
- [ ] Add error messages
- [ ] Improve UX (animations, feedback)
- [ ] Deploy to Vercel
- [ ] Set up monitoring (Sentry, analytics)

---

## 10. Migration Path to Decentralized

### 10.1 Data Export Strategy

**Export Format** (JSON):
```json
{
  "version": "1.0",
  "exported_at": "2025-11-01T00:00:00Z",
  "communities": [
    {
      "community_id": "nationality-DEU-1730332800000",
      "name": "Germany Discussion",
      "description": "...",
      "attestation_type": "nationality",
      "attestation_value": "DEU",
      "creator_address": "0x...",
      "created_at": "2025-10-31T12:00:00Z",
      "members": [
        {
          "address": "0x...",
          "joined_at": "2025-10-31T12:05:00Z"
        }
      ],
      "posts": [
        {
          "id": "...",
          "author_address": "0x...",
          "title": "...",
          "content": "...",
          "created_at": "2025-10-31T13:00:00Z",
          "comments": [...]
        }
      ]
    }
  ]
}
```

### 10.2 Migration Steps

**Phase 1: Export from Supabase**
1. Run export script to generate JSON for all communities
2. Upload JSON files to IPFS via Pinata
3. Record IPFS CIDs in mapping file

**Phase 2: Deploy Contracts**
1. Deploy `CommunityRegistry` contract
2. For each community, call `createCommunity()` with IPFS CID
3. Verify all communities are on-chain

**Phase 3: Migrate Content**
1. For each post, upload to IPFS
2. Update backend to write to IPFS + Supabase (dual write)
3. Gradually phase out Supabase writes

**Phase 4: Update Frontend**
1. Update APIs to read from IPFS first, fallback to Supabase
2. Update community list to read from contract
3. Add event indexer for real-time updates

**Phase 5: Deprecate Supabase (Optional)**
1. Announce deprecation timeline
2. Keep Supabase as cache/index only
3. Monitor performance

---

## 11. Critical Issues & Solutions

### Issue 1: Smart Contract Call Failures

**Problem**: Contract read might fail (network issues, RPC limits)

**Solution**:
- Retry logic with exponential backoff (3 attempts)
- Fallback to different RPC provider
- Cache verification results for 5 minutes
- Show error message to user with retry option

**Implementation**:
```typescript
async function verifyWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Issue 2: Supabase Query Performance

**Problem**: Queries might be slow with many communities/posts

**Solution**:
- Add proper indexes (already in schema)
- Use pagination (limit 20 per page)
- Cache popular queries in Redis/Vercel KV
- Use `community_stats` view for listings

### Issue 3: Rate Limiting Bypass

**Problem**: Attacker uses multiple wallets to bypass rate limits

**Solution**:
- Rate limit by IP address as well as wallet
- Add CAPTCHA for high-frequency users
- Monitor for suspicious patterns
- Temporarily ban abusive IPs

### Issue 4: Duplicate Community Creation

**Problem**: Two users try to create same community simultaneously

**Solution**:
- Unique constraint in database (already added)
- Lock-based approach in API (pessimistic locking)
- Return existing community if duplicate detected

**Implementation**:
```typescript
// In API: check and insert atomically
const { data, error } = await supabase.rpc('create_community_atomic', {
  p_community_id: communityId,
  p_name: name,
  // ... other params
});

if (error?.code === '23505') { // Unique violation
  // Fetch and return existing community
}
```

### Issue 5: Badge Verification Cache

**Problem**: Contract calls are slow (~1-2s each)

**Solution**:
- Cache verification results in Redis/Vercel KV
- TTL: 5 minutes
- Cache key: `badge:${address}:${attestationType}`
- Invalidate on known events (rare)

---

## 12. Success Metrics & KPIs

### 12.1 Beta Launch Metrics

**Week 1**:
- [ ] 50 users onboarded
- [ ] 10 communities created
- [ ] 100 posts created
- [ ] 500 page views
- [ ] < 5% error rate

**Week 2**:
- [ ] 80 users total
- [ ] 15 communities total
- [ ] 300 posts total
- [ ] 2000 page views
- [ ] 70% user retention

**Week 3-4**:
- [ ] 100 users total
- [ ] 20 communities total
- [ ] 500 posts total
- [ ] 5000 page views
- [ ] 5+ active communities (10+ members, 50+ posts)

### 12.2 Technical Metrics

**Performance**:
- API response time: < 500ms (p95)
- Page load time: < 2s (p95)
- Contract verification: < 3s (p95)
- Zero downtime

**Reliability**:
- Uptime: > 99%
- Error rate: < 1%
- Failed verifications: < 5%

**Security**:
- Zero unauthorized access
- Zero data breaches
- Rate limits working (< 10 violations/day)

---

## 13. Conclusion

This Supabase-first approach allows us to:

✅ **Launch quickly** - Skip complex smart contract development  
✅ **Iterate rapidly** - Easy to change schema and logic  
✅ **Gather feedback** - Focus on UX, not infrastructure  
✅ **Maintain security** - Badge verification still on-chain  
✅ **Plan for scale** - Clear migration path to decentralized  

**Key Constraints Maintained**:
1. ✅ Users can ONLY create communities for badges they possess
2. ✅ Users can ONLY join if they have required badge
3. ✅ Users can ONLY post if joined AND badge valid
4. ✅ All verification against real smart contracts

**Next Steps**:
1. Review and approve this plan
2. Set up Supabase project
3. Begin Week 1 implementation
4. Launch closed beta with 50 users
5. Gather feedback and iterate

---

**END OF DOCUMENT**

