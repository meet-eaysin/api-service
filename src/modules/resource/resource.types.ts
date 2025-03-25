export type TResource = {
  name: string;
  path: string;
  methods: string[];
  actions: string[];
};

export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type THttpAction = 'read' | 'create' | 'update' | 'delete';

export type TConfigMethodActions = {
  mappings: Record<THttpMethod, THttpAction>;
  allowedMethods: THttpMethod[];
};
