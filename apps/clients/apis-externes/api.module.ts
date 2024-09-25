import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { aeConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class aeApiModule {
  constructor(@Optional() @SkipSelf() parentModule: aeApiModule, @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('aeApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575'
      );
    }
  }

  public static forRoot(
    configurationFactory: () => aeConfiguration
  ): ModuleWithProviders<aeApiModule> {
    return {
      ngModule: aeApiModule,
      providers: [{ provide: aeConfiguration, useFactory: configurationFactory }]
    };
  }
}
