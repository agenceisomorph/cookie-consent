/**
 * YoutubeEmbed — Façade YouTube avec consentement cookies fonctionnels.
 *
 * Si cookies fonctionnels acceptés → iframe YouTube.
 * Sinon → BlockedContent avec message + bouton d'action directe.
 */

'use client';

import { BlockedContent } from './BlockedContent';

export interface YoutubeEmbedProps {
  /** ID de la vidéo YouTube */
  videoId: string;
  /** Titre de la vidéo (accessibilité, titre de la façade) */
  title: string;
  /** Largeur (défaut: 100%) */
  width?: string;
  /** Hauteur (défaut: 400px) */
  height?: string;
  /** className additionnel */
  className?: string;
  /** Autoplay (défaut: false) */
  autoplay?: boolean;
}

export function YoutubeEmbed({
  videoId,
  title,
  width = '100%',
  height = '400px',
  className = '',
  autoplay = false,
}: YoutubeEmbedProps) {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');

  const src = `https://www.youtube-nocookie.com/embed/${videoId}${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <BlockedContent
      category="functional"
      contentName={`Vidéo YouTube : ${title}`}
      minHeight={height}
      className={className}
    >
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        className={`rounded-lg ${className}`}
        style={{ border: 'none', aspectRatio: '16/9' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </BlockedContent>
  );
}
