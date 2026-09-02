# KAVACH Delhi — Disaster Command Centre

KAVACH is a Next.js dashboard for Delhi disaster-intelligence nodes, alerts, zones, device administration, seasonal simulation, and Firebase Realtime Database telemetry.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The current Firebase database URL is included as a safe public client configuration, so the app works without an environment file. To point a deployment at another database, copy `.env.example` to `.env.local` and change the value.

## Deploy to Vercel from GitHub

1. Push this project to a GitHub repository. Keep `edge-code/` ignored; it is Raspberry Pi runtime code and must not be included in the web deployment.
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and leave the project root at the repository root.
3. Vercel should detect **Next.js**. Use `npm install` as the install command and `npm run build` as the build command. Leave the output directory empty/default.
4. Select Node.js 22.x in Project Settings if Vercel asks for a runtime version.
5. No secret or Google Maps key is required. Optionally add `NEXT_PUBLIC_FIREBASE_DATABASE_URL` if you want to override the included Firebase RTDB URL, and `NEXT_PUBLIC_SITE_URL` after adding a custom domain.
6. Select **Deploy**. Future pushes to the selected production branch will deploy automatically.

If Vercel reports that `.next/routes-manifest.json` is missing, confirm that the Vercel deployment is using the commit containing this Next.js conversion. The repository-level `vercel.json` forces the Next.js preset and clears any custom Output Directory override. Redeploy that latest commit without the existing Build Cache.

## Deploy with the Vercel CLI

```powershell
npm install
npm run build
npx vercel
npx vercel --prod
```

Do not add Firebase service-account credentials to Vercel. This frontend uses Firebase's public REST endpoint; access is controlled by Firebase Realtime Database Rules.
