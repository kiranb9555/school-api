const mysql = require("mysql2");

function resolveDbConfig() {
  const rawHost = process.env.DB_HOST || process.env.MYSQLHOST || "";
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const urlCandidate =
    rawHost.startsWith("mysql://") || rawHost.startsWith("mysql2://")
      ? rawHost
      : connectionUrl;

  if (urlCandidate) {
    const parsed = new URL(urlCandidate);
    const parsedPort = Number(parsed.port || 3306);

    return {
      host: parsed.hostname,
      port: Number.isFinite(parsedPort) ? parsedPort : 3306,
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: (parsed.pathname || "").replace(/^\//, ""),
    };
  }

  const host = rawHost;
  const portRaw = process.env.DB_PORT || process.env.MYSQLPORT || 3306;
  const port = Number(portRaw);

  return {
    host,
    port: Number.isFinite(port) ? port : 3306,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  };
}

const connection = mysql.createConnection({
  ...resolveDbConfig(),
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    if (
      (process.env.DB_HOST || "").includes(".railway.internal") ||
      (process.env.MYSQLHOST || "").includes(".railway.internal")
    ) {
      console.log(
        "Hint: '*.railway.internal' hosts only resolve inside Railway. For local dev, set DB_HOST (or MYSQLHOST) to Railway's public host / TCP proxy host, or point it to your local MySQL (e.g. 127.0.0.1)."
      );
    }
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = connection;