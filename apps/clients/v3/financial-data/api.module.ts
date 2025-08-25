import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { financialDataV3Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class financialDataV3ApiModule {
    public static forRoot(configurationFactory: () => financialDataV3Configuration): ModuleWithProviders<financialDataV3ApiModule> {
        return {
            ngModule: financialDataV3ApiModule,
            providers: [ { provide: financialDataV3Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: financialDataV3ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('financialDataV3ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
