// // src/config/database.config.ts
// import { Sequelize } from 'sequelize-typescript';
// import { Injectable } from '@nestjs/common';
// import * as dotenv from 'dotenv';

// dotenv.config();

// @Injectable()
// export class DatabaseConfig {
//   public sequelize: Sequelize;

//   constructor() {
//     this.sequelize = new Sequelize({
//       database: process.env.DB_NAME,
//       username: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       host: process.env.DB_HOST,
//       port: Number(process.env.DB_PORT) || 5432,
//       dialect: 'postgres',
//       logging: false,
//       pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000,
//       },
//     });
//   }

//   async connect() {
//     try {
//       await this.sequelize.authenticate();
//       console.log('Database connection established successfully.');
//     } catch (error) {
//       console.error('Unable to connect to the database:', error);
//     }
//   }

//   async sync() {
//     try {
//       await this.sequelize.sync({ alter: true });
//       console.log('Database synced successfully');
//     } catch (error) {
//       console.error('Unable to sync database:', error);
//     }
//   }
// }
