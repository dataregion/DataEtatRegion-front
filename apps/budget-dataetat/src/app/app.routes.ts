import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { canActivateAuthRole } from './guards/auth-role.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [canActivateAuthRole],
        runGuardsAndResolvers: 'always',
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
