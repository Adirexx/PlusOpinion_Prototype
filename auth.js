import { supabase } from "./supabase.js";

// SIGN UP
async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  // ✅ HANDLE "already registered" safely
  if (error) {
    if (error.message.includes("already registered")) {
      return { status: "EXISTS" };
    }
    console.error(error);
    return { status: "ERROR", error };
  }

  const user = data.user;

  // Create profile only once
  if (user) {
    await supabase.from("profiles").upsert({
      id: user.id,
      username: email.split("@")[0],
      created_at: new Date()
    });
  }

  return { status: "OK", user };
}

// SIGN IN
async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data.user;
}

// EXPOSE TO BROWSER (CRITICAL)
window.signUpUser = signUpUser;
window.signInUser = signInUser;