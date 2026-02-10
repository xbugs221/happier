import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

/**
 * Happy control-plane REST traffic should not inherit ambient proxy env vars.
 */
export const controlPlaneHttp = axios.create({
    proxy: false
});

export function withControlPlaneHttpConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
    return {
        ...config,
        proxy: false
    };
}
