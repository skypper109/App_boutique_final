import { Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LoginService } from '../login/Guard/login.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private onlineStatus$ = new BehaviorSubject<boolean>(window.navigator.onLine);
  private blockingToastId: number | null = null;

  constructor(
    @Inject(ToastrService) private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService,
    private ngZone: NgZone,
  ) {
    this.initNetworkMonitoring();
  }

  private initNetworkMonitoring() {
    merge(
      of(window.navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
    ).subscribe((isOnline) => {
      this.ngZone.run(() => {
        this.onlineStatus$.next(isOnline);
        if (isOnline) {
          this.handleOnline();
        } else {
          this.handleOffline();
        }
      });
    });
  }

  get isOnline$(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  get isOnline(): boolean {
    return this.onlineStatus$.value;
  }

  private handleOnline() {
    if (this.blockingToastId !== null) {
      this.toastr.clear(this.blockingToastId);
      this.blockingToastId = null;
    }
  }

  private handleOffline() {
    // Afficher un Toastr bloquant
    const toast = this.toastr.error(
      'Connexion Internet perdue. Veuillez vous reconnecter.',
      'Hors Ligne',
      {
        disableTimeOut: true,
        closeButton: false,
        tapToDismiss: false,
      },
    );
    this.blockingToastId = toast.toastId;
  }

  public checkInitialStatus() {
    if (!window.navigator.onLine) {
      this.handleOffline();
    }
  }
}
