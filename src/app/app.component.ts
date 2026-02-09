import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoginService } from './login/Guard/login.service';
import { ToastrService } from 'ngx-toastr';
import { NetworkService } from './services/network.service';
import { check } from '@tauri-apps/plugin-updater';
// import { relaunch } from '@tauri-apps/plugin-process'; // Requires @tauri-apps/plugin-process

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'Front_Boutique';
  constructor( 
    private router: Router,
    private data: LoginService,
    private toast: ToastrService,
    private networkService: NetworkService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async checkAppUpdate() {
    try {
      const update = await check();
      if (update) {
        console.log(`Update found: ${update.version}`);
        this.toast.info(`Mise à jour disponible: ${update.version}`, 'Mise à jour');
        
        await update.downloadAndInstall();
        
        this.toast.success('Mise à jour installée. Redémarrage requis.', 'Succès');
        // await relaunch(); // Requires @tauri-apps/plugin-process
      }
    } catch (error) {
      this.toast.error('Failed to check for updates: ' + error);
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check internet connectivity at startup
    this.checkAppUpdate();
    this.networkService.checkInitialStatus();
  }

}
