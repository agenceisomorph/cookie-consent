import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStrapiAdapter } from './strapi.adapter';
import type { ConsentRecord } from '../types/consent.types';

// ─── Helpers ─────────────────────────────────────────────────────

const mockRecord: ConsentRecord = {
  sessionId: 'abc123',
  necessary: true,
  analytics: true,
  advertising: false,
  functional: true,
  gcmVersion: 'v2',
  consentDate: '2026-03-21T10:00:00.000Z',
  expiryDate: '2027-04-21T10:00:00.000Z',
  source: 'monsite.fr',
  action: 'custom',
};

// ─── Setup ───────────────────────────────────────────────────────

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ id: 1, status: 'ok' }), { status: 201 }));
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── createStrapiAdapter ─────────────────────────────────────────

describe('createStrapiAdapter', () => {
  it('crée un adapter avec la méthode save', () => {
    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    expect(typeof adapter.save).toBe('function');
  });
});

// ─── save ────────────────────────────────────────────────────────

describe('save', () => {
  it('envoie un POST vers /cookie-consents', async () => {
    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    await adapter.save(mockRecord);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/cookie-consents');
    expect(options?.method).toBe('POST');
  });

  it('envoie le body au format Strapi v4 { data: record }', async () => {
    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    await adapter.save(mockRecord);

    const body = JSON.parse(fetchMock.mock.calls[0]![1]?.body as string);
    expect(body).toEqual({ data: mockRecord });
  });

  it('envoie le Content-Type application/json', async () => {
    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    await adapter.save(mockRecord);

    const headers = fetchMock.mock.calls[0]![1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it("nettoie le trailing slash de l'URL", async () => {
    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com/api/' });
    await adapter.save(mockRecord);

    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/api/cookie-consents');
  });

  it("ne lève pas d'erreur si le serveur retourne une erreur", async () => {
    fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    await expect(adapter.save(mockRecord)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("ne lève pas d'erreur sur erreur réseau", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com' });
    await expect(adapter.save(mockRecord)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("ne lève pas d'erreur sur timeout (AbortError)", async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    fetchMock.mockRejectedValueOnce(abortError);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = createStrapiAdapter({ apiUrl: 'https://api.example.com', timeout: 100 });
    await expect(adapter.save(mockRecord)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Timeout'));
    warnSpy.mockRestore();
  });

  it('utilise un AbortController avec le timeout configuré', async () => {
    const adapter = createStrapiAdapter({
      apiUrl: 'https://api.example.com',
      timeout: 3000,
    });
    await adapter.save(mockRecord);

    // Vérifier que signal est passé à fetch
    const options = fetchMock.mock.calls[0]![1];
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });
});
