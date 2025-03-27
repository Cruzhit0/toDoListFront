import { Component, Input, Output, EventEmitter, type ElementRef, type AfterViewInit, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { animate, style, transition, trigger } from "@angular/animations"

@Component({
  selector: "app-premium-checkbox",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premium-checkbox.component.html',
  styleUrl: './premium-checkbox.component.css',
  animations: [
    trigger("checkAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0)" }),
        animate("300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)", style({ opacity: 1, transform: "scale(1)" })),
      ]),
      transition(":leave", [
        animate("200ms cubic-bezier(0.6, -0.28, 0.735, 0.045)", style({ opacity: 0, transform: "scale(0)" })),
      ]),
    ]),
  ],
})
export class PremiumCheckboxComponent implements AfterViewInit {
  @Input() checked = false
  @Output() checkedChange = new EventEmitter<boolean>()

  @ViewChild("checkboxCanvas") canvasRef!: ElementRef<HTMLCanvasElement>

  private ctx!: CanvasRenderingContext2D
  private particles: any[] = []
  private animationFrameId = 0

  ngAfterViewInit() {
    this.initCanvas()
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement
    this.ctx = canvas.getContext("2d")!

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  toggle() {
    this.checked = !this.checked
    this.checkedChange.emit(this.checked)

    if (this.checked) {
      this.startLiquidAnimation()
    } else {
      this.clearCanvas()
    }
  }

  private startLiquidAnimation() {
    // Clear existing animation
    cancelAnimationFrame(this.animationFrameId)
    this.clearCanvas()

    // Create liquid fill effect
    this.createParticles()
    this.animateParticles()

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height)
    this.particles = []
  }

  private createParticles() {
    const canvas = this.canvasRef.nativeElement
    const particleCount = 20

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: canvas.width / 2,
        y: canvas.height + 20,
        radius: Math.random() * 3 + 2,
        speedY: -Math.random() * 2 - 1,
        speedX: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.5,
      })
    }
  }

  private animateParticles() {
    const canvas = this.canvasRef.nativeElement
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fill background
    this.ctx.fillStyle = "#2563EB"
    this.ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (const particle of this.particles) {
      particle.y += particle.speedY
      particle.x += particle.speedX

      // Draw particle
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      this.ctx.fill()
    }

    // Continue animation if particles are still visible
    if (this.particles.some((p) => p.y > -10)) {
      this.animationFrameId = requestAnimationFrame(() => this.animateParticles())
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId)
  }
}

