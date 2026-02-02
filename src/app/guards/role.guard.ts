import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../login/Guard/login.service';
import { ToastrService } from 'ngx-toastr';
import { map, catchError, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
    const loginService = inject(LoginService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const toast = inject(ToastrService);

    if (!isPlatformBrowser(platformId)) {
        return true; // Allow SSR to continue, client will re-verify
    }

    // Check if user is authenticated first
    const token = loginService.getToken();
    if (!token) {
        toast.error('Accès refusé : Veuillez vous connecter.', 'Erreur', {
            timeOut: 3000,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-center'
        });
        router.navigateByUrl('/login');
        return false;
    }

    // Check required roles
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
        if (!loginService.hasRole(requiredRoles)) {
            toast.error('Accès refusé : Vous n\'avez pas les permissions nécessaires.', 'Erreur', {
                timeOut: 3000,
                progressBar: true,
                progressAnimation: 'increasing',
                positionClass: 'toast-top-center'
            });
            // Redirect to dashboard or previous page
            router.navigateByUrl('/accueil');
            return false;
        }
    }

    // Check user active status and boutique status
    return loginService.checkUserActiveStatus().pipe(
        map((response: any) => {
            // Explicitly check for boolean false, don't trigger on undefined
            if (response.is_active === false) {
                toast.error('Votre compte a été désactivé. Veuillez contacter l\'administrateur.', 'Compte Désactivé', {
                    timeOut: 5000,
                    progressBar: true,
                    progressAnimation: 'increasing',
                    positionClass: 'toast-top-center'
                });
                loginService.logout();
                return false;
            }

            if (response.boutique_active === false) {
                toast.error('Votre boutique a été bloquée. Veuillez contacter l\'administrateur.', 'Boutique Bloquée', {
                    timeOut: 5000,
                    progressBar: true,
                    progressAnimation: 'increasing',
                    positionClass: 'toast-top-center'
                });
                loginService.logout();
                return false;
            }

            return true;
        }),
        catchError((error) => {
            console.error('Error checking user status:', error);
            // If the server is unreachable or returns error, we only block if it's 401
            // But logout() already handled 401. 
            // For other errors, we allow the app to load (e.g. offline mode)
            return of(true);
        })
    );
};
