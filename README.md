# Legacy Brain Solutions

React/Vite frontend and Express/Prisma API for the Legacy CPA Tanzania website, admin workspace, and client portal.

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`, set a random `JWT_SECRET`, and use `DATABASE_URL="file:./dev.db"` for the included local SQLite setup.
3. Install dependencies: `npm install`.
4. Create the schema: `npm run db:generate`, then `npx prisma db push`.
5. Seed local content: `npm run db:seed`.
6. Run the frontend with `npm run dev` and the API with `npm run server:dev`.

## Railway deployment

Deploy this repository as a single Node.js service. Railway uses `npm run build` to generate Prisma Client and build the frontend, then `npm start` to synchronize the SQLite schema and start the API/web server. The server listens on Railway's `PORT` and serves the built site and `/api` from the same origin.

Before the first deploy, attach a Railway volume mounted at `/data` and set these service variables:

- `DATABASE_URL=file:/data/legacy.db`
- `UPLOAD_DIR=/data/uploads`
- `JWT_SECRET` to a long, randomly generated secret

Keep one running replica when using SQLite. The database and uploaded files are stored on the volume. After the first deploy, run `npm run db:seed` once from the Railway service shell to create the initial admin and public content. The seeded admin credentials below are for local setup; change the password immediately if using the seed in production. Do not use the seeded password on a public deployment.

Railway's `/api/health` health check is configured in `railway.json`. Set `PUBLIC_URL` to the deployed site origin only if you access the API from another origin.

## Administrator access

For a fresh local database created with `npm run db:seed`:

- Email: `legacybrain.co@gmail.com`
- Password: `ChangeMe123!`

Sign in through `Admin Portal`. The admin sidebar provides these editing workflows:

- `Engagements`: create client engagements and update service lines, due dates, and delivery status.
- `Staff & Permissions`: add staff accounts, assign roles, update account details, and reset a staff password.
- `Leadership Team`: edit the public leadership profiles, photos, and visibility.
- `System Settings`: update firm name, registration number, and office address.

If the seeded administrator password has changed, reset it from `Staff & Permissions` while signed in. Change all seeded credentials before deploying beyond local development.

The API is exposed under `/api`. Authentication uses short-lived JWT bearer tokens. Production deployments should put the API behind TLS, replace local upload storage with private object storage, configure an email provider and payment gateway, and use managed PostgreSQL backups/secrets.

Document uploads accept PDF, JPG, PNG, DOCX, and XLSX files up to 25 MB at `POST /api/portal/documents` using a multipart `file` field and a client bearer token.

## Screen coverage

Public: `/`, `/about`, `/services`, `/services/audit-assurance`, `/news`, `/contact`, `/office/dar-es-salaam`, `/proposal`, `/join`, `/privacy`, `/terms`.

Protected: `/admin`, `/admin/clients`, `/admin/orders`, `/admin/staff`, `/admin/access-roles`, `/admin/department-permissions`, `/admin/settings`, `/portal`, `/portal/documents`, `/portal/engagements`, `/portal/billing`, `/portal/messages`.