import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { referentielsV3Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class referentielsV3ApiModule {
    public static forRoot(configurationFactory: () => referentielsV3Configuration): ModuleWithProviders<referentielsV3ApiModule> {
        return {
            ngModule: referentielsV3ApiModule,
            providers: [ { provide: referentielsV3Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: referentielsV3ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('referentielsV3ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
