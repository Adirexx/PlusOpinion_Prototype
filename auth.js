// Use the Supabase client initialized from the UMD bundle
// The supabase.js module script initializes window.supabase
const supabase = window.supabase;

/* ============================
   SIGN UP (Email + Pasword)
============================ */
export async function signUpUser(email, password, name) {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/HOMEPAGE_FINAL.HTML',
      data: {
        full_name: name
      }
    }
  });

  if (error) throw error;

  const user = data.user;

  // 2. Store extra data in profiles table (optional - won't fail if table doesn't exist)
  if (user) {
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: name
        });

      // Log profile error but don't throw - signup should still succeed
      if (profileError) {
        console.warn('Profile creation skipped:', profileError.message);
      }
    } catch (profileError) {
      // Silently handle profile creation errors
      console.warn('Profile table not available:', profileError);
    }
  }

  return user;
}

/* ============================
   SIGN IN (Email + Password)
============================ */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data.user;
}

/* ============================
   LOGOUT
============================ */
export async function signOutUser() {
  // Sign out from Supabase (clears auth tokens from localStorage)
  await supabase.auth.signOut();

  // Clear any custom storage for complete cleanup
  sessionStorage.clear();

  // Remove any legacy access flags if they exist
  localStorage.removeItem('plusopinion_access');
}

/* ============================
   GET CURRENT USER
============================ */
export async function getCurrentUser() {
  // 1. First try session (this is instant if already logged in)
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user) {
    return sessionData.session.user;
  }

  // 2. Fallback to getUser (network)
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

/* ============================
   PASSWORD RESET (Magic Link)
============================ */
export async function resetPassword(email) {
  // Use production URL in production, localhost in development
  // This ensures password reset links always redirect to the correct environment
  const redirectUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/reset-password.html'
    : 'https://plusopinion.com/reset-password.html';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  if (error) throw error;
}

/* ============================
   GET USER PROFILE
============================ */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/* ============================
   UPDATE USER PROFILE
============================ */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ============================
   UPLOAD AVATAR
============================ */
export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update profile with avatar URL
  await updateUserProfile(userId, { avatar_url: data.publicUrl });

  return data.publicUrl;
}

/* ============================
   CHECK USERNAME AVAILABILITY
============================ */
export async function checkUsernameAvailable(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return !data; // Returns true if available
}

/* ============================
   EXPOSE TO BROWSER
============================ */
window.signUpUser = signUpUser;
window.signInUser = signInUser;
window.signOutUser = signOutUser;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.uploadAvatar = uploadAvatar;
window.checkUsernameAvailable = checkUsernameAvailable;

// Mark auth module as ready (prevents timeout errors on mobile)
window.authReady = true;
if (window._resolveAuthReady) {
  window._resolveAuthReady();
}
console.log('✅ Auth module loaded successfully - all functions exposed globally');
