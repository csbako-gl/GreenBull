import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './app-config.model';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ConfigService {
  static settings: IAppConfig | undefined;

  constructor(private http: HttpClient) {}

  async load() {
    const jsonFile = `assets/config/config.${environment.name}.json`;

    try {
      const response = await lastValueFrom(this.http.get<IAppConfig>(jsonFile));
      if (response) {
        ConfigService.settings = response;
      }
    } catch (error) {
      console.error(`Could not load file '${jsonFile}': ${JSON.stringify(error)}`);
    }
  }
}
