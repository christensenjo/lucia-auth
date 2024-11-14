import pg from 'pg';
const { Pool } = pg;

// Create a new pool instance
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_password',
    port: 5432,
});

export const db = {
    /**
     * Execute a query that doesn't return rows
     */
    async execute(query, ...params) {
        const client = await pool.connect();
        try {
            await client.query(query, params);
        } finally {
            client.release();
        }
    },

    /**
     * Execute a query that returns a single row or null
     */
    async queryOne(query, ...params) {
        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    },

    /**
     * Execute a query that returns multiple rows
     */
    async queryMany(query, ...params) {
        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }
};
