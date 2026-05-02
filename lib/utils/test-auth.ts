import { createAdminClient } from "@/lib/supabase/server";

export async function testUserCreation() {
  const supabase = createAdminClient();

  try {
    // Test avec un email simple
    const { data, error } = await supabase.auth.admin.createUser({
      email: "test@example.com",
      email_confirm: true,
      password: "testpassword123",
      user_metadata: { full_name: "Test User" },
    });

    if (error) {
      console.error("Test user creation failed:", error);
      return { success: false, error: error.message };
    }

    console.log("Test user created successfully:", data.user?.id);

    // Supprimer l'utilisateur de test
    if (data.user) {
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log("Test user deleted");
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: String(err) };
  }
}