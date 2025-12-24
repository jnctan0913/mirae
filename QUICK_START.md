# Quick Start Guide

## ✅ Step 1: Dependencies Installed

Dependencies have been installed successfully. Next.js has been updated to a secure version.

## 📝 Step 2: Set Up Environment Variables

### Create `.env.local` file

Create a new file named `.env.local` in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
```

### How to Get Your Keys:

#### Supabase Keys:
1. Go to [supabase.com](https://supabase.com) and create/login to your account
2. Create a new project (or select existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI Key:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in and go to **API Keys**
3. Click **"Create new secret key"**
4. Copy the key → `OPENAI_API_KEY`

## 🗄️ Step 3: Set Up Database

After creating your Supabase project:

1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy all the SQL code
4. Paste into SQL Editor and click **Run**

This will create all necessary tables and security policies.

## 🚀 Step 4: Start Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## ✅ Verification Checklist

- [ ] `.env.local` file created with all 4 variables filled in
- [ ] Supabase project created
- [ ] Database schema run in Supabase SQL Editor
- [ ] OpenAI API key obtained
- [ ] Development server starts without errors
- [ ] Can access login page at http://localhost:3000

## 🆘 Troubleshooting

**"Invalid API key" errors:**
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- No quotes around values in `.env.local`
- Restart dev server after changing `.env.local`

**Supabase connection errors:**
- Verify project is active in Supabase dashboard
- Check URL format: `https://xxxxx.supabase.co`
- Ensure database schema was run

**Port already in use:**
- Change port: `npm run dev -- -p 3001`

## 📚 Next Steps

Once the server is running:
1. Test authentication (signup/login)
2. Complete Stage 0 questionnaire
3. Explore the dashboard

See `ENV_SETUP.md` for more detailed instructions.

