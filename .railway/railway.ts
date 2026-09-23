import { defineRailway, github, image, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "asia-southeast1-eqsg3a" });
  Postgres.networking = { privateNetworkEndpoint: "postgres", tcpProxies: { "5432": {} } };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "asia-southeast1-eqsg3a", sizeMB: 5000 });
  const divineClarityCopy = service("divine-clarity Copy", {
    source: image("sloone01/zinat-backend:latest"),
    replicas: { "asia-southeast1-eqsg3a": 1 },
    networking: { privateNetworkEndpoint: "divine-clarity-copy" },
    env: { DATABASE_URL: preserve(), DB_DATABASE: preserve(), DB_HOST: preserve(), DB_PASSWORD: preserve(), DB_PORT: preserve(), DB_USERNAME: preserve(), TYPEORM_SYNCHRONIZE: preserve() },
  });
  const divineClarity = service("divine-clarity", {
    source: github("sloone01/zainat-alhayat-2", { branch: "mobile-build", checkSuites: false, rootDirectory: "/school-management-backend" }),
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "Dockerfile", watchPatterns: ["/school-management-backend/**"] },
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    replicas: { "asia-southeast1-eqsg3a": 1 },
    env: { CORS_ORIGIN: preserve(), DATABASE_URL: preserve(), DB_DATABASE: preserve(), DB_HOST: preserve(), DB_PASSWORD: preserve(), DB_PORT: preserve(), DB_USERNAME: preserve(), EMAIL_FROM: preserve(), ERROR_ALERT_EMAIL: preserve(), ERROR_ALERT_ENABLED: preserve(), FIREBASE_SERVICE_ACCOUNT_JSON: preserve(), GCS_BUCKET: preserve(), INFOBIP_API_KEY: preserve(), INFOBIP_BASE_URL: preserve(), JWT_REFRESH_SECRET: preserve(), JWT_SECRET: preserve(), NODE_ENV: preserve(), PLATFORM_INQUIRY_EMAIL: preserve(), PUBLIC_APP_URL: preserve(), SMTP_HOST: preserve(), SMTP_PASS: preserve(), SMTP_PORT: preserve(), SMTP_SECURE: preserve(), SMTP_USER: preserve(), STORAGE_DRIVER: preserve(), SUPPORT_NOTIFY_EMAIL: preserve(), THAWANI_BASE_URL: preserve(), THAWANI_PUBLISHABLE_KEY: preserve(), THAWANI_SECRET_KEY: preserve(), TYPEORM_SYNCHRONIZE: preserve() },
  });
  const zinatFrontend = service("zinat-frontend", {
    source: image("sloone01/zinat-frontend:latest"),
    replicas: { "asia-southeast1-eqsg3a": 1 },
    domains: ["www.fikr.om"],
    env: { VITE_API_BASE_URL: preserve() },
  });

  return project("school-managment", {
    resources: [divineClarityCopy, divineClarity, zinatFrontend, Postgres, postgresVolume],
  });
});
