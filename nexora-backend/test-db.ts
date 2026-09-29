import "dotenv/config";
import mariadb from "mariadb";

const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const pool = mariadb.createPool({
  host: getEnv("DATABASE_HOST"),
  port: Number(process.env.DATABASE_PORT || 3306),
  user: getEnv("DATABASE_USER"),
  password: getEnv("DATABASE_PASSWORD"),
  database: getEnv("DATABASE_NAME"),
  connectionLimit: 2,
  connectTimeout: 5000,
  acquireTimeout: 5000,
});

const testDatabase = async (): Promise<void> => {
  let connection;

  try {
    console.log("Testing direct MariaDB connection...");

    connection = await pool.getConnection();

    console.log("✅ Direct MariaDB connection successful");

    const result = await connection.query("SELECT 1 AS test");

    console.log("✅ SELECT 1 successful:", result);
  } catch (error) {
    console.error("❌ Direct MariaDB connection failed:");
    console.error(error);
  } finally {
    if (connection) {
      connection.release();
    }

    await pool.end();
  }
};

testDatabase();