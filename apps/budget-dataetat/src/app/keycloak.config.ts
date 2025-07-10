import { createInterceptorCondition, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, IncludeBearerTokenCondition, provideKeycloak, UserActivityService } from "keycloak-angular";

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: /\/api\//i, //TODO en conf avec le domaine
    bearerPrefix: 'Bearer',
});

// example ici : https://github.com/mauriciovigolo/keycloak-angular/blob/main/projects/examples/standalone/src/app/keycloak.config.ts
export const provideKeycloakAngular = () =>
    provideKeycloak({ // #TODO EN CONFIG
        config: {
            url: 'http://localhost:8080',
            realm: 'dataEtat',
            clientId: 'bretagne.budget'
        },
        initOptions: {
            checkLoginIframe: false
        },
        features: [
            // withAutoRefreshToken({
            //   onInactivityTimeout: 'logout',
            // })
        ],
        providers: [
            // AutoRefreshTokenService,
            UserActivityService,
            {
                provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
                useValue: [urlCondition]
            },
        ]
    })