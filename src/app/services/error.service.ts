import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
import { LoginService } from '../login/Guard/login.service';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const toastr = inject(ToastrService);
  const loginService = inject(LoginService);
 
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && (event.status === 201 || event.status === 200) && event.body) {
        const body = event.body as { message?: string };
        if (body.message) {
          toastr.success(body.message, 'Succès', {
            closeButton: true,
            timeOut: 10000,
            progressBar: true,
            progressAnimation: 'increasing'
          });
        }
      }
    }),
    catchError((error) => {
      let errorMsg = '';
      if (error.erreur instanceof ErrorEvent) {
        // Erreur côté client
        errorMsg = `Erreur: ${error.erreur.message}`;
      } else {
        // Erreur côté serveur
        if (error.status === 0) {
          errorMsg = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion Internet.';
          // On ne force plus la déconnexion automatique ici pour éviter les boucles au démarrage
          // loginService.logout();
        } else {
          errorMsg = error.error?.error || error.error?.message || 'Erreur inconnue. Veuillez réessayer plus tard.';

          // Gestion des erreurs HTTP spécifiques
          switch (error.status) {
            case 400:
              errorMsg = error.error?.error || 'Requête incorrecte. Veuillez vérifier les données soumises.';
              break;
            case 401:
              errorMsg = error.error?.error || 'Session expirée ou non autorisée. Veuillez vous reconnecter.';
              loginService.logout();
              break;
            case 403:
              errorMsg = error.error?.error || "Interdit. Vous n'avez pas la permission d'accéder à cette ressource.";
              break;
            case 404:
              errorMsg = error.error?.error || 'Ressource non trouvée. Veuillez vérifier l\'URL.';
              break;
            case 422:
              errorMsg = error.error?.message || 'Erreur de validation. Veuillez vérifier les données soumises.';
              if (error.error.errors) {
                const validationErrors = Object.values(error.error.errors).flat().join(', ');
                errorMsg += `: ${validationErrors}`;
              }
              break;
            case 500:
              errorMsg = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
              break;
            default:
              errorMsg = error.error?.message || 'Une erreur inattendue est survenue.';
              break;
          }
        }
      }

      toastr.error(errorMsg, 'Erreur', {
        closeButton: true,
        timeOut: 5000,
        progressBar: true,
        progressAnimation: 'increasing'
      });

      return throwError(() => new Error(errorMsg));
    })
  );
};
