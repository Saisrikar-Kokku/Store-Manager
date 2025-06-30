# LUVORA - Inventory Management System

A modern, full-stack inventory management application built with Next.js, featuring real-time data synchronization, user authentication, and comprehensive business analytics.

## 🚀 Features

- **User Authentication**: Secure login/signup with Clerk
- **Inventory Management**: Add, edit, and track inventory items
- **Sales Tracking**: Record sales with payment status tracking
- **Low Stock Alerts**: Automatic notifications for items running low
- **Photo Management**: Upload and manage inventory photos
- **Batch Import/Export**: CSV import/export functionality
- **Supplier Management**: Track and manage supplier information
- **Analytics Dashboard**: Real-time business metrics and charts
- **Responsive Design**: Modern UI with dark theme and animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **File Upload**: Supabase Storage
- **CSV Processing**: PapaParse

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd excelrfirst-pTrial
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### 4. Database Setup

#### Supabase Tables Required:

**inventory table:**
```sql
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  vendor TEXT,
  date_added DATE,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**sales table:**
```sql
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  customer_name TEXT,
  notes TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**suppliers table:**
```sql
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  rating INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Supabase Storage Bucket:
Create a storage bucket named `inventory-photos` with public access.

#### Row Level Security (RLS) Policies:
Enable RLS on all tables and add the following policies:

**For inventory table:**
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory
  FOR DELETE USING (auth.uid()::text = user_id);
```

**For sales table:**
```sql
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own sales" ON sales
  FOR DELETE USING (auth.uid()::text = user_id);
```

**For suppliers table:**
```sql
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suppliers" ON suppliers
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own suppliers" ON suppliers
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own suppliers" ON suppliers
  FOR DELETE USING (auth.uid()::text = user_id);
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Make sure to set all environment variables in your production environment.

## 🔍 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` file exists with correct Supabase credentials
   - Check that environment variables are properly set in production

2. **Authentication errors**
   - Verify Clerk configuration
   - Check that Clerk keys are correct in environment variables

3. **Database connection issues**
   - Verify Supabase URL and anon key
   - Check that database tables are created correctly
   - Ensure RLS (Row Level Security) policies are configured

4. **Image upload failures**
   - Verify Supabase storage bucket exists
   - Check storage bucket permissions
   - Ensure bucket is named `inventory-photos`

### Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── context/            # React context providers
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console for error messages
3. Verify all environment variables are set correctly
4. Ensure database tables are created properly
