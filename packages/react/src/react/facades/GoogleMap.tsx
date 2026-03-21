/**
 * GoogleMap — Façade Google Maps avec consentement cookies fonctionnels.
 *
 * Si cookies fonctionnels acceptés → affiche les children (composant Maps du projet).
 * Sinon → BlockedContent avec message + bouton d'action directe.
 *
 * Note : ce composant ne charge PAS Google Maps lui-même — il wrape
 * le composant Maps existant du projet (ex: @react-google-maps/api).
 */

'use client';

import { BlockedContent } from './BlockedContent';
import type { ReactNode } from 'react';

export interface GoogleMapProps {
  /** Composant Google Maps du projet (children) */
  children: ReactNode;
  /** Hauteur du placeholder (défaut: 400px) */
  height?: string;
  /** className additionnel */
  className?: string;
  /** Titre descriptif de la carte */
  title?: string;
}

export function GoogleMap({
  children,
  height = '400px',
  className = '',
  title = 'Carte Google Maps',
}: GoogleMapProps) {
  return (
    <BlockedContent
      category="functional"
      contentName={title}
      minHeight={height}
      className={className}
    >
      {children}
    </BlockedContent>
  );
}
