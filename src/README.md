# RideToGo source structure

The PDF describes three product areas: passenger, driver, and admin. The
source folders below keep those areas separate while shared logic remains
available to all of them.

```text
src/
├── components/       Shared and role-specific UI components
│   ├── common/
│   ├── passenger/
│   ├── driver/
│   └── admin/
├── constants/        App-wide labels, colors, and fixed values
├── hooks/            Reusable React hooks
├── navigation/       Passenger, driver, and admin navigation flows
├── screens/
│   ├── passenger/    Splash, login, home, booking, and trip screens
│   ├── driver/       Login, profile, dashboard, and request screens
│   └── admin/        Dashboard, driver verification, and route screens
├── services/         External integrations and backend access
│   └── firebase/     Firebase setup and feature clients
├── store/            Shared client state
├── types/            Shared TypeScript types
└── utils/            Small pure helper functions
```

Only the passenger splash screen is implemented currently:
`screens/passenger/SplashScreen.tsx`.
