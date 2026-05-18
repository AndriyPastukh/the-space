import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { S3Module } from './s3/s3.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatsModule } from './chats/chats.module';
import { TagsModule } from './tags/tags.module';
import { CommunitiesModule } from './communities/communities.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    S3Module,
    KnowledgeModule,
    TasksModule,
    CategoriesModule,
    ChatsModule,
    TagsModule,
    CommunitiesModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
