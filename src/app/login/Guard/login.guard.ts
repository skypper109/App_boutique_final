import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';
import { ToastrService } from 'ngx-toastr';

export const loginGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  // Pour le toastr :
  const toast = inject(ToastrService);

  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  if (!loginService.isActiveCompte()) {
    toast.error('Accès refusé : Session expirée ou compte invalide.', 'Erreur', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      positionClass: 'toast-top-center'
    });
    router.navigateByUrl('/login');
    return false;
  }
  let tok = loginService.getToken();
  if (tok !== null) {

    // Role check
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      if (!loginService.hasRole(requiredRoles)) {
        toast.error('Accès refusé : Rôle insuffisant.', 'Erreur', {
          timeOut: 3000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-center'
        });
        // Redirect to a default page or previous page
        return false;
      }
    }

    /* 
       Relaxed for unified dashboard: 
       We allow admins to reach '/' and selection will happen inside DashboardComponent
    */
    if (loginService.hasRole(['admin'])) {
      const boutiqueId = typeof localStorage !== 'undefined' ? localStorage.getItem('boutique_id') : null;
      // Accept both null/undefined/'' as "not selected"
      if (!boutiqueId || boutiqueId === 'null' || boutiqueId === '') {
        // Only redirect if NOT already on a selection path
        if (!state.url.includes('/admin/select-boutique') && !state.url.includes('/home')) {
          router.navigateByUrl('/admin/select-boutique');
          return false;
        }
      }
    }

    return true;
  } else {
    // console.warn('Accès refusé : Veuillez vous connecter.');
        toast.error('Accès refusé : Veuillez vous connecter.', 'Erreur', {
          timeOut: 3000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-center'
        });
    router.navigateByUrl('/login');
    return false;
  }
};
