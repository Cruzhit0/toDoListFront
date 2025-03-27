import { Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/components/header/header.component';
import { BackgroundComponent } from './pages/components/background/background.component';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, BackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  title = 'toDoListFront';

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
