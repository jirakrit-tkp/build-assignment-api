// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:20594535Tantann!@localhost:5432/assignments_db",
});

export default connectionPool;