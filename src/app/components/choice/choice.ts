import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choice',
  standalone: true,
  template: `
    <div style="text-align:center; padding:20px;">
      <h3>¿Qué deseas hacer ahora?</h3>
      <p>Opciones: comparar rostro con DNI procesado o enviar a RENIEC</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:12px;">
        <button (click)="goCompare()">Comparación Facial</button>
        <button (click)="goReniec()">Validacipon facial</button>
      </div>
    </div>
  `,
})
export class Choice {
  constructor(private router: Router) {}

  goCompare() {
    this.router.navigate(['/compare']);
  }

  goReniec() {
    this.router.navigate(['/reniec']);
  }
}
