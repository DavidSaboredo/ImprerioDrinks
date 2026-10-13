// Verifica las credenciales del panel admin en el servidor.
// Configurar en Vercel → Settings → Environment Variables: ADMIN_USER y ADMIN_PASSWORD.
const { timingSafeEqual } = require("crypto");

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end();
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "Credenciales no configuradas en el servidor." }));
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { username = "", password = "" } = body || {};

  // Pequeña demora para frenar intentos de fuerza bruta
  await new Promise((r) => setTimeout(r, 400));

  const ok = safeEqual(username, expectedUser) && safeEqual(password, expectedPassword);
  res.statusCode = ok ? 200 : 401;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok }));
};
