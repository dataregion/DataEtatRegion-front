import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { aev3Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class aev3ApiModule {
    public static forRoot(configurationFactory: () => aev3Configuration): ModuleWithProviders<aev3ApiModule> {
        return {
            ngModule: aev3ApiModule,
            providers: [ { provide: aev3Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: aev3ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('aev3ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
