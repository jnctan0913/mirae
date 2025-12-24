# Environment Variables Setup Guide

## Step 1: Create `.env.local` file

Create a file named `.env.local` in the root directory of the project.

## Step 2: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Create a new project (or use an existing one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (you won't be able to see it again!)

## Step 4: Fill in `.env.local`

Copy this template and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
```

## Step 5: Set Up Database Schema

After creating your Supabase project:

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file `supabase/schema.sql` from this project
3. Copy and paste the entire SQL into the SQL Editor
4. Click **Run** to create all tables and policies

## Step 6: Verify Setup

Run the development server:

```bash
npm run dev
```

If everything is set up correctly, you should be able to:
- Visit http://localhost:3000
- See the login page
- Create an account and log in

## Troubleshooting

### "Invalid API key" errors
- Make sure your `.env.local` file is in the root directory
- Check that there are no extra spaces or quotes around the values
- Restart the dev server after changing `.env.local`

### Supabase connection errors
- Verify your Supabase project is active
- Check that you copied the correct URL and keys
- Make sure you've run the database schema SQL

### OpenAI errors
- Verify your API key is correct
- Check your OpenAI account has credits/billing set up
- Make sure the key starts with `sk-`

## Security Notes

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`

⚠️ **Never share your service_role key publicly** - it has admin access to your database

⚠️ **Keep your OpenAI API key secret** - it's tied to your billing

