import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Use global ThrottlerGuard for rate limiting
  app.useGlobalGuards(new ThrottlerGuard());

  // ✅ Enable global validation (automatically validates DTOs)
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Start the app on port 3000 (change if needed)
  await app.listen(3000);
  console.log("🚀 Server running on http://localhost:3000");
}

bootstrap();
