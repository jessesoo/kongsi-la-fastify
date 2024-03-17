import build from "./app.js";

async function init() {
  const app = await build();

  try {
    app.listen({ host: process.env.HOST, port: process.env.PORT });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
