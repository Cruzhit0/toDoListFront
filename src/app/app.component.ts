import { Component, OnInit, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/models/theme.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/components/header/header.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor() { }
  ngOnInit() { }
  themeService = inject(ThemeService);
  title = 'toDoListFront';
}
