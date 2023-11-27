import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { budgetConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class budgetApiModule {
    public static forRoot(configurationFactory: () => budgetConfiguration): ModuleWithProviders<budgetApiModule> {
        return {
            ngModule: budgetApiModule,
            providers: [ { provide: budgetConfiguration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: budgetApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('budgetApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
