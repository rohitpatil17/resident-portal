# Resident Portal — Angular

Angular frontend for the Resident Portal POC. Connects to the [resident-portal-api-poc](https://github.com/adeshkadu511/resident-portal-api-poc) .NET backend.

---

## Quick Start

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200). The API must be running at `http://localhost:5000`.

Copy `src/environments/environment.template` to `src/environments/environment.ts` and fill in any values needed.

---

## Project Structure

```
src/app/
├── core/
│   ├── models/
│   │   └── resident.model.ts         — all TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts           — login / logout / JWT session
│   │   ├── resident.service.ts       — account API calls
│   │   └── chat.service.ts           — MAI chatbot API calls
│   ├── interceptors/
│   │   └── auth.interceptor.ts       — attaches Bearer token to requests
│   └── guards/
│       └── auth.guard.ts             — redirects unauthenticated users
│
├── shared/
│   └── components/
│       ├── sidebar/                  — nav + user info + logout
│       ├── topbar/                   — page title + notifications
│       ├── chatbot/                  — MAI floating chat bubble
│       └── coming-soon/              — placeholder for unbuilt pages
│
├── layout/
│   └── app-layout.component.ts       — shell: sidebar + topbar + router-outlet
│
└── pages/
    ├── login/                        — /login
    ├── dashboard/                    — /dashboard
    ├── payment/                      — /payment
    ├── billing/                      — /billing
    └── account/                      — /account
```

---

## Routes

| Path         | Component            | Auth |
|--------------|----------------------|------|
| `/login`     | `LoginComponent`     | No   |
| `/dashboard` | `DashboardComponent` | Yes  |
| `/payment`   | `PaymentComponent`   | Yes  |
| `/billing`   | `BillingComponent`   | Yes  |
| `/account`   | `AccountComponent`   | Yes  |
| `/documents` | `ComingSoonComponent`| Yes  |
| `/faq`       | `ComingSoonComponent`| Yes  |

---

## AI Chatbot (MAI)

The floating chat bubble in the bottom-right corner sends messages to the backend, which fetches the resident's live account data and uses it as context for the AI response. No account data is sent from the frontend.

---

## Design System

CSS variables defined in `src/styles.scss`:

```
--navy, --purple, --purple-bg, --teal, --accent, --success
--gray-50 → --gray-800
--shadow-sm, --shadow-md, --shadow-lg
--radius
```

---

## Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Framework  | Angular 17 (standalone)       |
| Styling    | SCSS + CSS custom properties  |
| State      | RxJS BehaviorSubject          |
| HTTP       | Angular HttpClient            |
| Auth       | HttpInterceptor               |
| Fonts      | DM Sans, Playfair Display     |
