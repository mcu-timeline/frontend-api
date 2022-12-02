import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config, Config } from './config';

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
          context: ({ req }) => {
            return {
              headers: req.headers
            };
          },
        },
        gateway: {
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({request, context}) {
                const headers = context.headers;

                if (!headers) {
                  return;
                }

                request.http.headers.set('authorization', headers.authorization);
              }
            });
          },
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: configService.get('CONTENT_API_FEDERATION_NAME'),
                url: configService.get('CONTENT_API_FEDERATION_URL'),
              },
              {
                name: configService.get('PROGRESS_API_FEDERATION_NAME'),
                url: configService.get('PROGRESS_API_FEDERATION_URL'),
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
