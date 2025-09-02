import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { resolveInfosSupplementaires } from '../../resolvers/informations-supplementaires-resolver';
import { InfosLigneComponent } from '../../components/infos-ligne/infos-ligne.component';

const routes: Routes = [
  {
    path: '',
    component: InfosLigneComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      infos_supplementaires: resolveInfosSupplementaires
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationsSupplementairesRoutingModule {}
