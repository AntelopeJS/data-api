import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "playground",
  modules: {
    playground: {
      source: {
        type: "local",
        path: ".",
        installCommand: ["npx tsc"],
      },
    },
    "@antelopejs/data-api": {
      source: {
        type: "local",
        path: "..",
        installCommand: ["npx tsc"],
      },
    },
    "@antelopejs/api": {
      source: {
        type: "local",
        path: "../../api",
        installCommand: ["pnpm install", "npx tsc"],
      },
      config: {
        servers: [
          {
            protocol: "http",
            port: "5010",
          },
        ],
      },
    },
    "@antelopejs/mongodb": {
      source: {
        type: "local",
        path: "../../mongodb",
        installCommand: ["pnpm install", "npx tsc"],
      },
      config: {
        url: "mongodb://localhost:27017",
      },
    },
    "@antelopejs/database-decorators": {
      source: {
        type: "local",
        path: "../../database-decorators",
        installCommand: ["pnpm install", "npx tsc"],
      },
    },
  },
});
