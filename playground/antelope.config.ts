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
        type: "package",
        package: "@antelopejs/api",
        version: "1.0.0",
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
        type: "package",
        package: "@antelopejs/mongodb",
        version: "1.0.0",
      },
      config: {
        url: "mongodb://localhost:27017",
      },
    },
    "@antelopejs/database-decorators": {
      source: {
        type: "package",
        package: "@antelopejs/database-decorators",
        version: "1.0.0",
      },
    },
  },
});
