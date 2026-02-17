import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { administrationV3Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class administrationV3ApiModule {
    public static forRoot(configurationFactory: () => administrationV3Configuration): ModuleWithProviders<administrationV3ApiModule> {
        return {
            ngModule: administrationV3ApiModule,
            providers: [ { provide: administrationV3Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: administrationV3ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('administrationV3ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
