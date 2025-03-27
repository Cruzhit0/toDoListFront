import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { animate, style, transition, trigger } from "@angular/animations"

export interface RadialMenuItem {
  icon: string
  label: string
  action: string
  color?: string
}

@Component({
  selector: "app-radial-menu",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './radial-menu.component.html',
  styleUrl: './radial-menu.component.css',
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" }),
        animate(
          "200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          style({ opacity: 1, transform: "translate(-50%, -50%) scale(1)" }),
        ),
      ]),
      transition(":leave", [
        animate("150ms ease-out", style({ opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" })),
      ]),
    ]),
    trigger("itemAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0)" }),
        animate("200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)", style({ opacity: 1, transform: "*" })),
      ]),
    ]),
  ],
})
export class RadialMenuComponent {
  @Input() items: RadialMenuItem[] = []
  @Output() itemSelected = new EventEmitter<string>()

  visible = false
  position = { x: 0, y: 0 }

  private el = inject(ElementRef)

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    // Close menu if clicking outside
    if (this.visible && !this.el.nativeElement.contains(event.target)) {
      this.hide()
    }
  }

  show(x: number, y: number) {
    this.position = { x, y }
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  getItemPosition(index: number) {
    const totalItems = this.items.length
    const angle = (index / totalItems) * 2 * Math.PI
    const radius = 60 // Distance from center

    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    return `translate(${x}px, ${y}px)`
  }

  getItemTextColor(item: RadialMenuItem) {
    // Determine if background is light or dark
    const color = item.color || "#ffffff"
    const r = Number.parseInt(color.slice(1, 3), 16)
    const g = Number.parseInt(color.slice(3, 5), 16)
    const b = Number.parseInt(color.slice(5, 7), 16)

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    return brightness > 128 ? "#000000" : "#ffffff"
  }

  onItemClick(item: RadialMenuItem) {
    this.itemSelected.emit(item.action)
    this.hide()
  }
}


