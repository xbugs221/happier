import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCleanEnv } from './utils';

describe('getCleanEnv', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('should preserve proxy environment variables for spawned agent subprocesses', () => {
        const localBinPath = `${process.cwd()}/node_modules/.bin`;
        process.env.PATH = `${localBinPath}:/usr/bin`;
        process.env.http_proxy = 'http://127.0.0.1:18080';
        process.env.https_proxy = 'http://127.0.0.1:18081';
        process.env.all_proxy = 'socks5://127.0.0.1:19090';
        process.env.HTTP_PROXY = 'http://127.0.0.1:28080';
        process.env.HTTPS_PROXY = 'http://127.0.0.1:28081';
        process.env.ALL_PROXY = 'socks5://127.0.0.1:29090';

        const cleanEnv = getCleanEnv();

        expect(cleanEnv.PATH).toContain('/usr/bin');
        expect(cleanEnv.PATH).not.toContain(localBinPath);
        expect(cleanEnv.http_proxy).toBe('http://127.0.0.1:18080');
        expect(cleanEnv.https_proxy).toBe('http://127.0.0.1:18081');
        expect(cleanEnv.all_proxy).toBe('socks5://127.0.0.1:19090');
        expect(cleanEnv.HTTP_PROXY).toBe('http://127.0.0.1:28080');
        expect(cleanEnv.HTTPS_PROXY).toBe('http://127.0.0.1:28081');
        expect(cleanEnv.ALL_PROXY).toBe('socks5://127.0.0.1:29090');
    });
});
