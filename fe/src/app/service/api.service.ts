import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, Subscriber } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';

//import { FileResponse } from '../models/apiresponse.model';

/** The type of `HttpClient.request()`'s `options` parameter plus custom modifications like `apiUrl` */
type HttpRequestOptions = HttpClient['request'] extends (method: string, url: string, params: infer P) => any
  ? P & { apiUrl?: string }
  : never;

/** A more liberal `options.params` (see `ApiService.buildHttpParams()`) */
type RawHttpParams = HttpParams | Record<string, any>;

@Injectable()
export class ApiService {
  //protected apiServer = ConfigService.settings.api.url;

  constructor(private http: HttpClient) { }

  public request(
    method: string,
    url: string,
    {
      apiUrl = '/api',
      withCredentials = true,
      ...options
    }: HttpRequestOptions & { params?: RawHttpParams }
  ) {
    return this.http
      .request(method, `${apiUrl}${url}`, {
        ...options,
        withCredentials,
        headers: this.buildHttpHeaders(options),
        params: this.buildHttpParams(options)
      })
      .pipe(catchError(({ error }: any) => throwError(error)));
  }

  get = (url: string, params?: RawHttpParams, options?: HttpRequestOptions) =>
    this.request('get', url, { params, ...options });

  post = (url: string, body: any | null = null, params?: RawHttpParams, options?: HttpRequestOptions) =>
    this.request('post', url, { body, params, ...options });

  put = (url: string, body: any | null = null, params?: RawHttpParams, options?: HttpRequestOptions) =>
    this.request('put', url, { body, params, ...options });

  delete = (url: string, params?: RawHttpParams, options?: HttpRequestOptions) =>
    this.request('delete', url, { params, ...options });

  /**
   * Serializes non-string parameters using `toString()` to be acceptable by HttpClient.request's `params`.
   * Also checks parameter values for `null` and `undefined` and drops them if so.
   * These save us some code on the call-sites by not having to write code like:
   *
   * ```
   *   let httpParams = new HttpParams();
   *
   *   if (boolParam) {
   *     httpParams = httpParams.append('boolParam', boolParam.toString())
   *   }
   *
   *   apiService.get('url', httpParams);
   * ```
   *
   * Instead you can simply write:
   *
   * ```
   *   apiService.get('url', { boolParam });
   * ```
   */
  private buildHttpParams = ({ params }: { params?: RawHttpParams }): HttpRequestOptions['params'] => {
    if (!params || params instanceof HttpParams) {
      return params;
    }

    return Object.entries(params).reduce(
      (agg, [key, value]) =>
        value !== null && value !== undefined
          ? { ...agg, [key]: value.toString() }
          : agg
      , {}
    );
  };

  private buildHttpHeaders = ({ headers, body }: HttpRequestOptions) => {
    let headerObject = headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);

    // FIXME: there are a number of controller methods on the backend that expect
    // any of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`
    // even though these methods never do anything with the body itself.
    //
    // Angular's content type auto-detection would send an empty body with `null`
    // `Content-Type` which would fail as per the above.
    //
    // Let's override this decision here by setting the arbitrary type of
    // `text/plain` for these requests.
    if (!body) {
      headerObject = headerObject.set('Content-Type', 'text/plain');
    }

    headerObject = headerObject.set('Access-Control-Allow-Origin', '/api' /*this.apiServer*/);
    headerObject = headerObject.set('withCredentials', 'true');


    return headerObject;
  };

/*
  public getFile(url: string, params?: RawHttpParams): Observable<FileResponse> {
    return this.get(url, params, {
      observe: 'response',
      responseType: 'blob'
    })
      .pipe(map(res => this.parseFileResponse(res)))
      .pipe(catchError(this.parseErrorBlob));
  }

  public getFileByPost(path: string, body: any, params?: RawHttpParams, options?: HttpRequestOptions): Observable<FileResponse> {
    return this.http
      .post(`${options && options.apiUrl ? options.apiUrl : environment.api_url}${path}`, body, {
        observe: 'response',
        responseType: 'blob',
        params: this.buildHttpParams({ params })
      })
      .pipe(map(res => this.parseFileResponse(res)));
  }

  public getImageAsDataUrl(url: string, params?: RawHttpParams): Observable<string> {
    return this.get(url, params, { responseType: 'blob' }).pipe(map(e => URL.createObjectURL(e)));
  }

  public getPictureUrl(url: string): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;
      this.http
        .get(environment.api_url + url, {
          responseType: 'blob'
        })
        .subscribe(resp => {
          objectUrl = URL.createObjectURL(resp);
          observer.next(objectUrl);
        });
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }

  parseErrorBlob(err: HttpErrorResponse): Observable<any> {
    const reader: FileReader = new FileReader();
    const obs = new Observable((observer: any) => {
      reader.onloadend = e => {
        observer.error(JSON.parse(reader.result as string));
        observer.complete();
      };
    });
    if (err.error) {
      reader.readAsText(err.error);
    }
    return obs;
  }


  parseFileResponse(resp: HttpResponse<any>): FileResponse {
    const contentDispositionHeader = resp.headers.get('content-disposition')?.replace(/"/g, '');
    let fileName = 'downloaded_file';
    if (contentDispositionHeader) {
      fileName = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    }
    return { blob: new Blob([resp.body], { type: resp.headers.get('Content-Type') }), filename: fileName } as FileResponse;
  }
*/
}
