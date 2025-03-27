import { Component, OnInit, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/components/header/header.component';
import { BackgroundComponent } from './pages/components/background/background.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, BackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  constructor() { }
  ngOnInit() { }
  themeService = inject(ThemeService);
  title = 'toDoListFront';
}
