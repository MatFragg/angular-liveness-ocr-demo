import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  private cacheKey = 'deviceSerialNumber';

  /**
   * Genera o devuelve un identificador persistente del cliente (pseudo número de serie)
   * almacenado en localStorage. No depende de backend.
   */
  getOrCreateSerial(): string {
    const cached = this.getCachedSerial();
    if (cached) return cached;

    const serial = this.generateClientId();
    this.cacheSerial(serial);
    return serial;
  }

  private generateClientId(): string {
    if (crypto?.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback simple si randomUUID no está disponible
    return 'SER-' + Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
  }

  private cacheSerial(serial: string) {
    try { localStorage.setItem(this.cacheKey, serial); } catch (_) {}
  }

  private getCachedSerial(): string | null {
    try { return localStorage.getItem(this.cacheKey); } catch (_) { return null; }
  }
}
