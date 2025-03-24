import config from '@/config/config';

export const getErrorData = (data: any) => (config.env === 'development' ? data : undefined);
