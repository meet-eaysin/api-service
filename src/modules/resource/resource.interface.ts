export interface Resource {
  name: string;
  path: string;
  methods: string[];
  actions: string[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HttpAction = 'read' | 'create' | 'update' | 'delete';

export interface ConfigMethodActions {
  mappings: Record<HttpMethod, HttpAction>;
  allowedMethods: HttpMethod[];
}
