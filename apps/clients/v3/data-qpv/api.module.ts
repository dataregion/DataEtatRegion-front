import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { dataQpvV3Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class dataQpvV3ApiModule {
    public static forRoot(configurationFactory: () => dataQpvV3Configuration): ModuleWithProviders<dataQpvV3ApiModule> {
        return {
            ngModule: dataQpvV3ApiModule,
            providers: [ { provide: dataQpvV3Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: dataQpvV3ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('dataQpvV3ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
