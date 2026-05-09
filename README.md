# Threat Intelligence Platform

## Run the Frontend (easiest path on Windows)

1. Install [Node.js LTS](https://nodejs.org/) if needed.
2. Double‑click `Frontend/run-dev.bat` **or** in a terminal: `cd Frontend` then `npm install` then `npm run dev`.
3. Open **`http://localhost:5173`** in your browser. Log in with any username/password (demo auth).
4. On your phone (same Wi‑Fi), use the **Network** URL Vite prints (not `localhost`).
5. Charts and indicators need the Java **Backend** on **port 8080** plus **MySQL** with schema from Flyway. If those are stopped, you will still see the app but see an error banner on the home page instead of live data.

Backend: install **JDK 17+** and **MySQL**, configure `application.yml`/env (see `Backend/src/main/resources/application.yml`), then run `Backend/run-dev.bat` **or** `mvn spring-boot:run` from `Backend/` (Maven is bundled under `tools/apache-maven-3.9.9` on this repo snapshot).