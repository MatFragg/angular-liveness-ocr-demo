import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Servicio de logging centralizado para estandarizar los logs de la aplicación.
 * 
 * Categorías:
 * - AUTH: Autenticación e interceptor
 * - API: Llamadas a APIs externas
 * - STATE: Cambios de estado de la aplicación
 * - CAMERA: Operaciones de cámara
 * - SCANNER: Scanner de DNI
 * - VALIDATION: Validación facial y RENIEC
 * - NAV: Navegación
 */

type LogCategory = 'AUTH' | 'API' | 'STATE' | 'CAMERA' | 'SCANNER' | 'VALIDATION' | 'NAV' | 'ERROR';

interface LogConfig {
  enabled: boolean;
  categories: Record<LogCategory, boolean>;
}

// Configuración por defecto - en producción se puede desactivar todo
const DEFAULT_CONFIG: LogConfig = {
  enabled: !environment.production,
  categories: {
    AUTH: true,       // Reduce verbosity for auth
    API: true,        // API calls
    STATE: true,      // State changes
    CAMERA: true,     // Camera operations
    SCANNER: true,    // DNI scanner
    VALIDATION: true, // Validation results
    NAV: true,        // Navigation
    ERROR: true       // Always show errors
  }
};

const CATEGORY_EMOJIS: Record<LogCategory, string> = {
  AUTH: '🔐',
  API: '🌐',
  STATE: '📦',
  CAMERA: '📷',
  SCANNER: '🔍',
  VALIDATION: '✓',
  NAV: '🧭',
  ERROR: '❌'
};

const CATEGORY_COLORS: Record<LogCategory, string> = {
  AUTH: '#9b59b6',
  API: '#3498db',
  STATE: '#27ae60',
  CAMERA: '#e67e22',
  SCANNER: '#1abc9c',
  VALIDATION: '#2ecc71',
  NAV: '#f39c12',
  ERROR: '#e74c3c'
};

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private config: LogConfig = { ...DEFAULT_CONFIG };
  
  // Cache para evitar logs duplicados en getters
  private lastLogCache = new Map<string, { message: string; timestamp: number }>();
  private readonly CACHE_TTL_MS = 1000; // 1 segundo de debounce

  /**
   * Log genérico con categoría
   */
  log(category: LogCategory, message: string, data?: any): void {
    if (!this.shouldLog(category)) return;
    
    const emoji = CATEGORY_EMOJIS[category];
    const color = CATEGORY_COLORS[category];
    
    const logMessage = `${emoji} [${category}] ${message}`;
    
    if (data !== undefined) {
      console.log(`%c${logMessage}`, `color: ${color}; font-weight: bold;`, data);
    } else {
      console.log(`%c${logMessage}`, `color: ${color}; font-weight: bold;`);
    }
  }

  /**
   * Log success con emoji verde
   */
  success(category: LogCategory, message: string, data?: any): void {
    if (!this.shouldLog(category)) return;
    
    const logMessage = `✅ [${category}] ${message}`;
    
    if (data !== undefined) {
      console.log(`%c${logMessage}`, 'color: #2ecc71; font-weight: bold;', data);
    } else {
      console.log(`%c${logMessage}`, 'color: #2ecc71; font-weight: bold;');
    }
  }

  /**
   * Log de error
   */
  error(message: string, error?: any): void {
    const logMessage = `❌ [ERROR] ${message}`;
    console.error(`%c${logMessage}`, 'color: #e74c3c; font-weight: bold;', error || '');
  }

  /**
   * Log de warning
   */
  warn(category: LogCategory, message: string, data?: any): void {
    if (!this.shouldLog(category)) return;
    
    const logMessage = `⚠️ [${category}] ${message}`;
    
    if (data !== undefined) {
      console.warn(`%c${logMessage}`, 'color: #f39c12; font-weight: bold;', data);
    } else {
      console.warn(`%c${logMessage}`, 'color: #f39c12; font-weight: bold;');
    }
  }

  /**
   * Log con debounce - útil para getters que se llaman repetidamente
   * Solo logea si el mensaje cambió o pasó el TTL
   */
  logOnce(cacheKey: string, category: LogCategory, message: string, data?: any): void {
    if (!this.shouldLog(category)) return;
    
    const now = Date.now();
    const cached = this.lastLogCache.get(cacheKey);
    const dataStr = data ? JSON.stringify(data) : '';
    const fullMessage = message + dataStr;
    
    // Si existe en cache, el mensaje es igual y no pasó el TTL, no logear
    if (cached && cached.message === fullMessage && now - cached.timestamp < this.CACHE_TTL_MS) {
      return;
    }
    
    // Actualizar cache
    this.lastLogCache.set(cacheKey, { message: fullMessage, timestamp: now });
    
    // Limpiar cache viejo cada 100 entradas
    if (this.lastLogCache.size > 100) {
      this.cleanCache();
    }
    
    this.log(category, message, data);
  }

  /**
   * Log agrupado para API calls
   */
  logApiCall(method: string, url: string, extras?: { body?: any; headers?: string[] }): void {
    if (!this.shouldLog('API')) return;
    
    console.groupCollapsed(`%c🌐 [API] ${method} ${this.shortenUrl(url)}`, 'color: #3498db; font-weight: bold;');
    console.log('URL:', url);
    if (extras?.headers) console.log('Headers:', extras.headers);
    if (extras?.body) console.log('Body:', extras.body);
    console.groupEnd();
  }

  /**
   * Log de respuesta API
   */
  logApiResponse(url: string, status: 'success' | 'error', data?: any): void {
    if (!this.shouldLog('API')) return;
    
    const emoji = status === 'success' ? '✅' : '❌';
    const color = status === 'success' ? '#2ecc71' : '#e74c3c';
    
    console.log(`%c${emoji} [API] Response from ${this.shortenUrl(url)}`, `color: ${color}; font-weight: bold;`, data || '');
  }

  /**
   * Activar/desactivar categoría
   */
  setCategory(category: LogCategory, enabled: boolean): void {
    this.config.categories[category] = enabled;
  }

  /**
   * Activar/desactivar todos los logs
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  private shouldLog(category: LogCategory): boolean {
    return this.config.enabled && this.config.categories[category];
  }

  private shortenUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url.substring(url.lastIndexOf('/'));
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.lastLogCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL_MS * 10) {
        this.lastLogCache.delete(key);
      }
    }
  }
}

// Singleton para uso sin inyección (interceptors, etc.)
let loggerInstance: LoggerService | null = null;

export function getLogger(): LoggerService {
  if (!loggerInstance) {
    loggerInstance = new LoggerService();
  }
  return loggerInstance;
}
