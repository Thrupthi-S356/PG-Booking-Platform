# 🏠 PG Finder — Frontend Application

A modern, production-ready PG (Paying Guest) Finder web application built with React.js, Tailwind CSS, and React Router.

## ✨ Features

- **Authentication** — Login & Register with role selection (Tenant / Owner)
- **PG Listings** — Grid view with image galleries, amenities, ratings, and filters
- **Smart Filters** — Filter by city, price range, gender preference, and amenities
- **PG Details** — Full page with gallery, amenities, room options, and reviews
- **Tenant Dashboard** — View and track booking statuses
- **Owner Dashboard** — Manage listings, accept/reject booking requests
- **Chat UI** — Real-time-style messaging with conversation sidebar
- **Map View** — Leaflet.js map with PG markers and "Near Me" geolocation
- **Contact Page** — Professional contact form with FAQ
- **Responsive** — Fully mobile-first design

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Navigation |
| Tailwind CSS | Styling |
| Axios | API calls |
| React Leaflet | Map |
| Lucide React | Icons |
| Context API | State management |

## 📁 Folder Structure

```
src/
├── components/
│   ├── common/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Skeleton.jsx
│   │   ├── PGCard.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── StarRating.jsx
│   │   └── EmptyState.jsx
│   └── layout/
│       └── Layout.jsx  # Navbar + Footer
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PGDetails.jsx
│   ├── MapView.jsx
│   ├── TenantDashboard.jsx
│   ├── OwnerDashboard.jsx
│   ├── Chat.jsx
│   ├── Contact.jsx
│   └── NotFound.jsx
├── context/
│   └── AppContext.jsx  # Global auth + toast state
├── services/
│   └── api.js          # Axios + mock API layer
├── data/
│   └── mockData.js     # Mock PG/booking data
├── App.jsx             # Router setup
├── main.jsx            # Entry point
└── index.css           # Global styles + Tailwind
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

## 🔑 Demo Login

Use the **Demo Tenant** or **Demo Owner** buttons on the login page to explore both dashboards.

Or enter any email/password combination (mock auth accepts all).

## 🔗 Connecting a Real Backend

All API calls are in `src/services/api.js`. To swap in a real backend:

1. Set `VITE_API_URL=https://your-api.com/v1` in `.env`
2. Replace mock implementations in each service method with real `api.get/post/...` calls
3. Update the auth interceptor logic as needed

Example:
```js
// Before (mock)
getAll: async (filters) => {
  await delay();
  return mockPGs.filter(...);
}

// After (real)
getAll: async (filters) => {
  const { data } = await api.get('/pgs', { params: filters });
  return data;
}
```

## 📱 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Tenant | tenant@demo.com | any |
| Owner | owner@demo.com | any |
