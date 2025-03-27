import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatMenuModule } from "@angular/material/menu"
import { RouterModule } from "@angular/router"
import { ThemeService } from '../../../core/models/theme.service';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-header',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  themeService = inject(ThemeService)
  private authService = inject(AuthService)

  logout() {
    this.authService.logout()
  }
}