# financial-data@1.0.0

 Api de d\'accès aux données financières de l\'état <b>C\'est une API dediée à l\'outil interne de consultation budget. N\'utilisez pas cette API pour intégrer nos données à votre système.</b>     

The version of the OpenAPI document: 3.0

## Building

To install the required dependencies and to build the typescript sources run:

```console
npm install
npm run build
```

## Publishing

First build the package then run `npm publish dist` (don't forget to specify the `dist` folder!)

## Consuming

Navigate to the folder of your consuming project and run one of next commands.

_published:_

```console
npm install financial-data@1.0.0 --save
```

_without publishing (not recommended):_

```console
npm install PATH_TO_GENERATED_PACKAGE/dist.tgz --save
```

_It's important to take the tgz file, otherwise you'll get trouble with links on windows_

_using `npm link`:_

In PATH_TO_GENERATED_PACKAGE/dist:

```console
npm link
```

In your project:

```console
npm link financial-data
```

__Note for Windows users:__ The Angular CLI has troubles to use linked npm packages.
Please refer to this issue <https://github.com/angular/angular-cli/issues/8284> for a solution / workaround.
Published packages are not effected by this issue.

### General usage

In your Angular project:

```typescript
// without configuring providers
import { financialDataV3ApiModule } from 'financial-data';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        financialDataV3ApiModule,
        // make sure to import the HttpClientModule in the AppModule only,
        // see https://github.com/angular/angular/issues/20575
        HttpClientModule
    ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
// configuring providers
import { financialDataV3ApiModule, financialDataV3Configuration, financialDataV3ConfigurationParameters } from 'financial-data';

export function apiConfigFactory (): financialDataV3Configuration {
  const params: financialDataV3ConfigurationParameters = {
    // set configuration parameters here.
  }
  return new financialDataV3Configuration(params);
}

@NgModule({
    imports: [ financialDataV3ApiModule.forRoot(apiConfigFactory) ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
// configuring providers with an authentication service that manages your access tokens
import { financialDataV3ApiModule, financialDataV3Configuration } from 'financial-data';

@NgModule({
    imports: [ financialDataV3ApiModule ],
    declarations: [ AppComponent ],
    providers: [
      {
        provide: financialDataV3Configuration,
        useFactory: (authService: AuthService) => new financialDataV3Configuration(
          {
            basePath: environment.apiUrl,
            accessToken: authService.getAccessToken.bind(authService)
          }
        ),
        deps: [AuthService],
        multi: false
      }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
import { DefaultApi } from 'financial-data';

export class AppComponent {
    constructor(private apiGateway: DefaultApi) { }
}
```

Note: The financialDataV3ApiModule is restricted to being instantiated once app wide.
This is to ensure that all services are treated as singletons.

### Using multiple OpenAPI files / APIs / financialDataV3ApiModules

In order to use multiple `financialDataV3ApiModules` generated from different OpenAPI files,
you can create an alias name when importing the modules
in order to avoid naming conflicts:

```typescript
import { financialDataV3ApiModule } from 'my-api-path';
import { financialDataV3ApiModule as OtherApiModule } from 'my-other-api-path';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    financialDataV3ApiModule,
    OtherApiModule,
    // make sure to import the HttpClientModule in the AppModule only,
    // see https://github.com/angular/angular/issues/20575
    HttpClientModule
  ]
})
export class AppModule {

}
```

### Set service base path

If different than the generated base path, during app bootstrap, you can provide the base path to your service.

```typescript
import { BASE_PATH } from 'financial-data';

bootstrap(AppComponent, [
    { provide: BASE_PATH, useValue: 'https://your-web-service.com' },
]);
```

or

```typescript
import { BASE_PATH } from 'financial-data';

@NgModule({
    imports: [],
    declarations: [ AppComponent ],
    providers: [ provide: BASE_PATH, useValue: 'https://your-web-service.com' ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

### Using @angular/cli

First extend your `src/environments/*.ts` files by adding the corresponding base path:

```typescript
export const environment = {
  production: false,
  API_BASE_PATH: 'http://127.0.0.1:8080'
};
```

In the src/app/app.module.ts:

```typescript
import { BASE_PATH } from 'financial-data';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [ ],
  providers: [{ provide: BASE_PATH, useValue: environment.API_BASE_PATH }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

### Customizing path parameter encoding

Without further customization, only [path-parameters][parameter-locations-url] of [style][style-values-url] 'simple'
and Dates for format 'date-time' are encoded correctly.

Other styles (e.g. "matrix") are not that easy to encode
and thus are best delegated to other libraries (e.g.: [@honoluluhenk/http-param-expander]).

To implement your own parameter encoding (or call another library),
pass an arrow-function or method-reference to the `encodeParam` property of the Configuration-object
(see [General Usage](#general-usage) above).

Example value for use in your Configuration-Provider:

```typescript
new Configuration({
    encodeParam: (param: Param) => myFancyParamEncoder(param),
})
```

[parameter-locations-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-locations
[style-values-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values
[@honoluluhenk/http-param-expander]: https://www.npmjs.com/package/@honoluluhenk/http-param-expander
