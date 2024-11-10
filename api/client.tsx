import type { AxiosInstance, Method, RawAxiosRequestHeaders } from "axios";
import axios from "axios";
import type { SWRConfiguration, SWRResponse } from "swr";
import useSWR from "swr";

function makeURL(
  base: string,
  data: {
    path: string[];
    params?: Record<string, unknown>;
  },
) {
  const url = data.path.reduce(
    (acc, p) => {
      if (p === "/") {
        return acc;
      }

      if (p.startsWith("/")) return `${acc}${p}`;
      return `${acc}/${p}`;
    },
    base.endsWith("/") ? base.slice(0, -1) : base,
  );

  if (data.params) {
    let urlReplaced = url;
    Object.entries(data.params).forEach(([key, value]) => {
      urlReplaced = urlReplaced.replace(`:${key}`, String(value));
    });

    return urlReplaced;
  }

  return url;
}

interface Request {
  url: string;
  method: Method;
  data:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | FormData
    | string
    | undefined;
  params: Record<string, unknown> | FormData | undefined;
  headers: RawAxiosRequestHeaders;
}

function buildQueryString(params: Record<string, unknown>): string {
  const queryString = Object.keys(params)
    .flatMap((key) => {
      if (params[key] === undefined) return [];

      const value = params[key];
      return `${key}=${encodeURI(String(value))}`;
    })
    .join("&");

  return queryString;
}

export class ClientError extends Error {
  constructor(
    message: string,
    public readonly httpCode: number,
  ) {
    super(message);
  }
}

export class Client {
  private readonly client: AxiosInstance;
  private t: string | undefined;
  private route: "admin" | "user" | "auth" | "public" = "admin";

  private readonly requiredHeaders = new Map<string, string>();

  constructor(
    private readonly baseUrl: string,
    t?: string,
    private readonly trimEndingSlash = true,
  ) {
    this.t = t;

    this.client = axios.create({
      headers: {
        Accept: "application/json",
      },
    });
  }

  setToken(token: string) {
    this.t = token;
  }

  addHeader(key: string, value: string) {
    this.requiredHeaders.set(key, value);
  }

  removeHeader(key: string) {
    this.requiredHeaders.delete(key);
  }

  setScope(scope: "admin" | "user" | "auth" | "public") {
    this.route = scope;
  }

  get scope() {
    return this.route;
  }

  get hasToken() {
    return !this.t;
  }

  prepare<T>(
    path: string,
    method: Method,
    body?:
      | Record<string, unknown>
      | Record<string, unknown>[]
      | FormData
      | string,
    params?: Record<string, unknown>,
    config?: {
      removeAuth?: boolean;
      route?: "admin" | "user" | "auth" | "public";
      headers?: Record<string, string>;
    },
  ) {
    const route = makeURL(this.baseUrl, {
      path: ["/", config?.route ?? this.route],
    });

    let url = makeURL(route, {
      path: [path],
    });

    if (params) {
      url = makeURL(url, {
        path: [],
        params,
      });
    }

    if (this.trimEndingSlash && url.endsWith("/")) url = url.slice(0, -1);

    if (method === "GET" && body) {
      if (typeof body === "string") {
        url = `${url}?${body}`;
      } else {
        const params = buildQueryString(body as Record<string, unknown>);
        if (params.length > 0) url = `${url}?${params} `;
      }
    }

    let headers = {
      ...(Object.fromEntries(this.requiredHeaders.entries()) as Record<
        string,
        string
      >),
    } as RawAxiosRequestHeaders;

    if (!config?.removeAuth) {
      headers = {
        ...headers,
        Authorization: `Bearer ${this.t} `,
        ...(config?.headers ?? {}),
      };
    }

    const request = {
      url,
      method,
      data: method !== "GET" ? body : undefined,
      params: undefined,
      headers,
    };

    return {
      request,
      operation: {
        submit: async () => this.submit<T>(request),
        route: request.url,
      },
    };
  }

  async submit<T>(request: Request): Promise<T> {
    try {
      const result = await this.client({
        ...request,
      });

      return result.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as
          | {
              error?: string;
            }
          | undefined;

        if (payload?.error) {
          throw new ClientError(payload.error, err.response?.status ?? 500);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
}

export interface Route<T> {
  submit: () => Promise<T>;
  route: string;
}

export abstract class BaseAction {
  constructor(
    public readonly client: Client,
    public readonly endpoint: string,
    public readonly routeType: "admin" | "user" | "auth" | "public" = "admin",
  ) {}

  useSwr<B>(
    func: (action: this) => Route<B>,
    condition = true,
  ): (conf?: SWRConfiguration<B, unknown>) => SWRResponse<B> {
    return (conf?: SWRConfiguration<B, unknown>) => {
      if (!condition)
        return useSWR(
          () => undefined,
          () => Promise.reject(),
        );

      const { submit, route } = func(this);

      return useSWR(route, submit, conf);
    };
  }
}
