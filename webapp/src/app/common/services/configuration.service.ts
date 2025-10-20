import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }

  static getApiUrl(): string {
    return environment.apiUrl;
  }

  static getHostUrl(): string {
    return environment.host;
  }

  static isProduction(): boolean {
    return environment.production;
  }
}
