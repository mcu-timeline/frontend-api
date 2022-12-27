import {
  GraphQLDataSourceProcessOptions,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { config, Config } from './config';
import { GraphQLDataSourceRequestKind } from '@apollo/gateway/dist/datasources/types';

type Context = {
  headers: Request['headers'];
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Config>) => ({
        driver: ApolloGatewayDriver,
        server: {
          context: ({ req }: { req: Request }) => {
            return {
              headers: req.headers,
            };
          },
        },
        gateway: {
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({
                request,
                context,
                kind,
              }: GraphQLDataSourceProcessOptions<Context>) {
                if (kind == GraphQLDataSourceRequestKind.INCOMING_OPERATION) {
                  const headers = context.headers;

                  if (!headers) {
                    return;
                  }

                  request.http.headers.set(
                    'authorization',
                    headers.authorization,
                  );
                }
              },
            });
          },
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: configService.get('CONTENT_API_FEDERATION_NAME', {
                  infer: true,
                }),
                url: configService.get('CONTENT_API_FEDERATION_URL', {
                  infer: true,
                }),
              },
              {
                name: configService.get('PROGRESS_API_FEDERATION_NAME', {
                  infer: true,
                }),
                url: configService.get('PROGRESS_API_FEDERATION_URL', {
                  infer: true,
                }),
              },
            ],
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule {}
