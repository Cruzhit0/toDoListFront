import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from "@angular/material/icon"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { AuthService } from "../../core/services/auth.service"

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  hidePassword = true
  isLoading = false
  errorMessage = ""

  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return

    this.isLoading = true
    this.errorMessage = ""

    const { email, password } = this.loginForm.value

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(["/dashboard"])
      },
      error: (error) => {
        this.errorMessage = error.message || "Login failed. Please try again."
        this.isLoading = false
      },
    })
  }
}

