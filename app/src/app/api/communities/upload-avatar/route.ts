/**
 * OpenBands v2 - Upload Community Avatar API
 * POST /api/communities/upload-avatar
 * 
 * Uploads a community avatar image to Supabase Storage and returns the public URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_COMMUNITIES_SUPABASE_URL;
  const supabaseServiceKey = process.env.COMMUNITIES_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Communities Supabase credentials not configured. Please set NEXT_PUBLIC_COMMUNITIES_SUPABASE_URL and COMMUNITIES_SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'File must be an image' 
      }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size must be less than 5MB' 
      }, { status: 400 });
    }
    
    const supabase = getServerSupabase();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('community-avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      });
    
    if (uploadError) {
      console.error('[Avatar Upload] Storage error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to upload image: ${uploadError.message}` 
      }, { status: 500 });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('community-avatars')
      .getPublicUrl(fileName);
    
    if (!urlData?.publicUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to get public URL' 
      }, { status: 500 });
    }
    
    console.log(`[Avatar Upload] Successfully uploaded: ${urlData.publicUrl}`);
    
    return NextResponse.json({
      success: true,
      avatarUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error('[Avatar Upload] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

