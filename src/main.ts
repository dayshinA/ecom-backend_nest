// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import * as session from 'express-session';
import * as cron from 'node-cron';
import * as cors from 'cors';
import scheduledJobs from './services/scheduledJobs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.use(cors());

  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 1 }));

  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'defaultSecret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Schedule cron jobs
  cron.schedule('0 1 * * *', () => {
    scheduledJobs.updateDailyAnalytics();
  });

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
  });
}

bootstrap();
