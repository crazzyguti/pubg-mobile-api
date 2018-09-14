module.exports = {
    development: {
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        dialect: 'postgres',
        port: 5432,
        ssl: true,
        dialectOptions: {
          ssl: true
        },
        url: process.env.DATABASE_URL
    },
    test: {
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        dialect: 'postgres',
        port: 5432,
        ssl: true,
        dialectOptions: {
          ssl: true
        },
        url: process.env.DATABASE_URL
    },
    production: {
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        dialect: 'postgres',
        port: 5432,
        ssl: true,
        dialectOptions: {
          ssl: true
        },
        url: process.env.DATABASE_URL
    }
};