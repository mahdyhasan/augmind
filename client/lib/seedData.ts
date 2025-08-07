import { supabase } from './supabase';

export const createDemoAdmin = async () => {
  try {
    // Create admin user through signup
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@augmind.com',
      password: 'admin123',
      options: {
        data: {
          username: 'admin',
          full_name: 'Administrator',
        },
      },
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Create admin profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username: 'admin',
          full_name: 'Administrator',
          role: 'Admin',
          token_limit: 10000,
          word_limit: 2000,
        });

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
      }

      console.log('Demo admin user created successfully');
      return { success: true };
    }

    return { success: false, error: 'No user returned' };
  } catch (error: any) {
    console.error('Error in createDemoAdmin:', error);
    return { success: false, error: error.message };
  }
};

export const createDemoBusinessUser = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@augmind.com',
      password: 'user123',
      options: {
        data: {
          username: 'johnsmith',
          full_name: 'John Smith',
        },
      },
    });

    if (error) {
      console.error('Error creating business user:', error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username: 'johnsmith',
          full_name: 'John Smith',
          role: 'Business Dev User',
        });

      if (profileError) {
        console.error('Error creating business user profile:', profileError);
      }

      console.log('Demo business user created successfully');
      return { success: true };
    }

    return { success: false, error: 'No user returned' };
  } catch (error: any) {
    console.error('Error in createDemoBusinessUser:', error);
    return { success: false, error: error.message };
  }
};

// Function to seed initial data
export const seedInitialData = async () => {
  console.log('Seeding initial data...');
  
  // Check if we already have data
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (profiles && profiles.length > 0) {
    console.log('Data already exists, skipping seed');
    return;
  }

  // Create demo users
  await createDemoAdmin();
  await createDemoBusinessUser();
  
  console.log('Initial data seeding completed');
};
