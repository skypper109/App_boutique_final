import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    // Only run in browser environment (or desktop wrapper)
    if (!isPlatformBrowser(platformId)) {
        return next(req);
    }

    // Get token from localStorage
    const token = localStorage.getItem('access_token');

    // Prepend API URL if the request is relative and doesn't start with assets
    let url = req.url;
    if (!url.startsWith('http') && !url.startsWith('assets/')) {
        url = `${environment.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Clone the request and add Authorization header if token exists
    const headers: any = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const clonedReq = req.clone({
        url,
        setHeaders: headers
    });

    return next(clonedReq);
};
