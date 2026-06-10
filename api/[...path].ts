import app from '../src/server';

export default async function handler(req, res) {
  // Wait for the app to be ready (DB connected, etc.)
  await new Promise(resolve => setTimeout(resolve, 100));
  return app(req, res);
}
