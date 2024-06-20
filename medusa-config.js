const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      // only enable `serve` in development
      // you may need to add the NODE_ENV variable
      // manually
      serve: process.env.NODE_ENV === "development",
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
  // {
  //   resolve: "@medusajs/admin",
  //   /** @type {import('@medusajs/admin').PluginOptions} */
  //   options: {
  //     autoRebuild: true,
  //     develop: {
  //       open: process.env.OPEN_BROWSER !== "false",
  //     },
  //   },
  // },
  {
    resolve: `medusa-storage-supabase`,
    options: {
      referenceID: process.env.STORAGE_BUCKET_REF,
      serviceKey: process.env.STORAGE_SERVICE_KEY,
      bucketName: process.env.BUCKET_NAME,
    },
  },
  {
    resolve: `medusa-payment-stripe`,
    options: {
      api_key: process.env.STRIPE_API_KEY,
      payment_description: "test Sold Product on e-store",
      capture:true,
      automatic_payment_methods:true,
    //  webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
  {
    resolve: `medusa-plugin-sendgrid-typescript`,
    /** @type {import('medusa-plugin-sendgrid-typescript').PluginOptions} */
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      templates: {
        order_placed_template: {
          id: process.env.SENDGRID_ORDER_PLACED_ID,
          // You can add dynamic data to the template by using {variable_name}
          subject: "Thank you for your order !",
        },
      },
    },
  },
  // {
  //   resolve: `@rsc-labs/medusa-documents`,
  //   options: {
  //     enableUI: true
  //   }
  // }
];

const modules = {
  /*eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },*/
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
