# Resume Tracker App

A cross-platform Resume & Job Application Tracker built with React Native, Expo, and Supabase.

## Features

- **Job Application Management**: Track applications with company, role, status, and deadlines
- **Resume Management**: Upload and manage multiple resume versions
- **Dashboard**: View statistics and recent applications
- **Authentication**: Secure user authentication with Supabase
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (Auth + Database + Storage)
- **UI Library**: React Native Paper
- **Navigation**: Expo Router
- **Language**: TypeScript

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `lib/supabase.ts` with your credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

4. Run the SQL schema in your Supabase SQL editor (see `database-schema.sql`)

### 4. Run the App

```bash
# Start the development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## Project Structure

```
resume-tracker-app/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities & config
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── hooks/                 # Custom React hooks
├── services/              # API services
├── constants/             # App constants
└── database-schema.sql    # Database schema
```

## Development

### Adding New Features

1. Create new screens in the appropriate directory
2. Add new services in `services/` for API calls
3. Update types in `lib/types.ts` if needed
4. Add new constants in `constants/`

### Database Changes

1. Update the schema in `database-schema.sql`
2. Run the changes in your Supabase SQL editor
3. Update TypeScript types in `lib/types.ts`

## Deployment

### Mobile Apps

1. Build for production:
   ```bash
   npx expo build:android
   npx expo build:ios
   ```

2. Submit to app stores

### Web App

1. Build for web:
   ```bash
   npx expo export:web
   ```

2. Deploy to your preferred hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
