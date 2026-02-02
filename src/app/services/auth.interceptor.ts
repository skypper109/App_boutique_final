import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        // Prevent API calls during SSR as they lack authentication/localStorage
        return EMPTY;
    }

    // Try to get the token, checking both keys used in the app
    const token = localStorage.getItem('access_token') || localStorage.getItem('user_token');
    const boutiqueId = localStorage.getItem('boutique_id');

    if (token) {
        let headers: any = {
            Authorization: `Bearer ${token}`
        };

        if (boutiqueId) {
            headers['X-Boutique-Id'] = boutiqueId;
        }

        const cloned = req.clone({
            setHeaders: headers
        });
        return next(cloned);
    }

    return next(req);
};
