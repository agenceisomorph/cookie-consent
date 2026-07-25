import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStrapiAdapter } from './strapi.adapter';
import type { ConsentRecord } from '../types/consent.types';

// ─── Integration test: cycle complet StrapiAdapter ──────────────

const mockRecord: ConsentRecord = {
  sessionId: 'integration-test-001',
  necessary: true,
  analytics: true,
  advertising: false,
  functional: true,
  gcmVersion: 'v2',
  consentDate: '2026-03-21T10:00:00.000Z',
  expiryDate: '2027-04-21T10:00:00.000Z',
  source: 'monsite.fr',
  action: 'accept_all',
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ data: { id: 1 } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('StrapiAdapter — intégration', () => {
  it('cycle complet : création adapter + envoi consentement', async () => {
    const adapter = createStrapiAdapter({
      apiUrl: 'https://admin.monsite.fr/api',
    });

    await adapter.save(mockRecord);

    expect(fetchMock).toHaveBeenCalledOnce();

    const call = fetchMock.mock.calls[0]!;
    const url = call[0] as string;
    const options = call[1] as RequestInit;
    expect(url).toBe('https://admin.monsite.fr/api/cookie-consents');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string);
    expect(body.data.necessary).toBe(true);
    expect(body.data.analytics).toBe(true);
    expect(body.data.advertising).toBe(false);
    expect(body.data.functional).toBe(true);
    expect(body.data.action).toBe('accept_all');
    expect(body.data.gcmVersion).toBe('v2');
    expect(body.data.sessionId).toBe('integration-test-001');
    expect(body.data.source).toBe('monsite.fr');
  });

  it('gère les erreurs serveur sans bloquer', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = createStrapiAdapter({
      apiUrl: 'https://admin.monsite.fr/api',
    });

    await expect(adapter.save(mockRecord)).resolves.not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('gère les erreurs réseau sans bloquer', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = createStrapiAdapter({
      apiUrl: 'https://admin.monsite.fr/api',
    });

    await expect(adapter.save(mockRecord)).resolves.not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
