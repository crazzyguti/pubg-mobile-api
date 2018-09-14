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
        url: process.env.DATABASE_URL ? process.env.DATABASE_URL : 'postgres://eccaqyxglguigu:14ba4b4540f0c518a10cf9d82914ba964a0fe327f2bb3e295b90935b13277bc7@ec2-54-247-123-231.eu-west-1.compute.amazonaws.com:5432/d1a54r924nn2b6?ssl=true'
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
        url: process.env.DATABASE_URL ? process.env.DATABASE_URL : 'postgres://eccaqyxglguigu:14ba4b4540f0c518a10cf9d82914ba964a0fe327f2bb3e295b90935b13277bc7@ec2-54-247-123-231.eu-west-1.compute.amazonaws.com:5432/d1a54r924nn2b6'
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
        url: process.env.DATABASE_URL ? process.env.DATABASE_URL : 'postgres://eccaqyxglguigu:14ba4b4540f0c518a10cf9d82914ba964a0fe327f2bb3e295b90935b13277bc7@ec2-54-247-123-231.eu-west-1.compute.amazonaws.com:5432/d1a54r924nn2b6'
    }
};