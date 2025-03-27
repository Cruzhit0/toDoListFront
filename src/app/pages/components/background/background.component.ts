import { Component, type OnInit, type ElementRef, ViewChild, type AfterViewInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ThemeService } from "../../../core/services/theme.service"
import { backgroundAnimations } from "./backgraund.animations"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

@Component({
  selector: 'app-background',
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrl: './background.component.css',  
  animations: backgroundAnimations,
})
export class BackgroundComponent implements  OnInit, AfterViewInit  {
  @ViewChild("particleCanvas") particleCanvas!: ElementRef<HTMLCanvasElement>
  @ViewChild("celebrationCanvas") celebrationCanvas!: ElementRef<HTMLCanvasElement>

  themeService = inject(ThemeService)
  showCelebration = false

  private particles: Particle[] = []
  private particleCtx!: CanvasRenderingContext2D
  private celebrationCtx!: CanvasRenderingContext2D
  private animationFrameId = 0
  private celebrationAnimationId = 0

  ngOnInit() {
    // Subscribe to task completion events to trigger celebrations
    // This would be implemented with a service
  }

  ngAfterViewInit() {
    this.initParticleCanvas()
    this.animateParticles()
  }

  private initParticleCanvas() {
    const canvas = this.particleCanvas.nativeElement
    this.particleCtx = canvas.getContext("2d")!

    // Set canvas size
    this.resizeCanvas()
    window.addEventListener("resize", () => this.resizeCanvas())

    // Create initial particles
    this.createParticles()
  }

  private resizeCanvas() {
    const canvas = this.particleCanvas.nativeElement
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (this.celebrationCanvas) {
      const celebCanvas = this.celebrationCanvas.nativeElement
      celebCanvas.width = window.innerWidth
      celebCanvas.height = window.innerHeight
    }
  }

  private createParticles() {
    this.particles = []
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000)

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.2 - 0.1,
        speedY: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }
  }

  private animateParticles() {
    this.particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // Update and draw particles
    for (const particle of this.particles) {
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Wrap around edges
      if (particle.x < 0) particle.x = window.innerWidth
      if (particle.x > window.innerWidth) particle.x = 0
      if (particle.y < 0) particle.y = window.innerHeight
      if (particle.y > window.innerHeight) particle.y = 0

      // Draw particle
      this.particleCtx.beginPath()
      this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.particleCtx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      this.particleCtx.fill()
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateParticles())
  }

  triggerCelebration() {
    this.showCelebration = true
    setTimeout(() => {
      if (this.celebrationCanvas) {
        this.initCelebrationCanvas()
        this.animateCelebration()

        // Hide celebration after 3 seconds
        setTimeout(() => {
          this.showCelebration = false
          cancelAnimationFrame(this.celebrationAnimationId)
        }, 3000)
      }
    }, 0)
  }

  private initCelebrationCanvas() {
    const canvas = this.celebrationCanvas.nativeElement
    this.celebrationCtx = canvas.getContext("2d")!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  private animateCelebration() {
    // Create confetti effect
    // Implementation would go here
    this.celebrationAnimationId = requestAnimationFrame(() => this.animateCelebration())
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId)
    cancelAnimationFrame(this.celebrationAnimationId)
    window.removeEventListener("resize", () => this.resizeCanvas())
  }
}
