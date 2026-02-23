# ManageAmerica — Resident Portal (Angular)

Modern rebuild of the RP Web using **Angular 17** (standalone components), **SCSS**, and **RxJS**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
ng serve

# 3. Open browser
http://localhost:4200
```

Login with **any username + password** (mock auth).

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/
│   │   └── resident.model.ts       ← All TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts         ← Login / logout / session
│   │   └── resident.service.ts     ← Balance, billing, notices (mock data)
│   └── guards/
│       └── auth.guard.ts           ← Route protection
│
├── shared/
│   └── components/
│       ├── logo/                   ← <app-logo> — ManageAmerica brand mark
│       ├── sidebar/                ← <app-sidebar> — nav + user + logout
│       └── topbar/                 ← <app-topbar> — page title + notifications
│
├── layout/
│   └── app-layout.component.ts     ← Shell: sidebar + topbar + <router-outlet>
│
└── pages/
    ├── login/                      ← /login
    ├── dashboard/                  ← /dashboard
    ├── payment/                    ← /payment
    ├── billing/                    ← /billing  (3 tabs)
    └── account/                    ← /account
```

---

## 🔀 Routes

| Path         | Component           | Guard  |
|--------------|---------------------|--------|
| `/login`     | `LoginComponent`    | ✗      |
| `/dashboard` | `DashboardComponent`| ✓ Auth |
| `/payment`   | `PaymentComponent`  | ✓ Auth |
| `/billing`   | `BillingComponent`  | ✓ Auth |
| `/account`   | `AccountComponent`  | ✓ Auth |

---

## 🎨 Design System

All tokens in `src/styles.scss` as CSS variables:

```scss
--navy, --purple, --purple-bg, --teal, --accent, --gold, --success
--gray-50 → --gray-800
--shadow-sm, --shadow-md, --shadow-lg
```

---

## 🔧 Next Steps (Production Readiness)

- [ ] Replace mock services with real HTTP API calls
- [ ] Add `HttpInterceptor` for auth token injection
- [ ] Integrate real payment gateway (Stripe / Forte)
- [ ] Add Angular Material or PrimeNG for form components
- [ ] Write unit tests with Jest / Karma
- [ ] Add lazy loading for page routes
- [ ] Set up CI/CD pipeline

---

## 🛠 Tech Stack

| Layer       | Tech                        |
|-------------|-----------------------------|
| Framework   | Angular 17 (Standalone)     |
| Styling     | SCSS + CSS Custom Properties|
| State       | RxJS BehaviorSubject        |
| Routing     | Angular Router              |
| HTTP        | Angular HttpClient (ready)  |
| Fonts       | DM Sans + Playfair Display  |
