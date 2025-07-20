// ATTENTION : import interne Ark UI, lié à la version Chakra UI utilisée
// Si tu mets à jour Chakra UI, vérifie la doc officielle pour l'import standard !
// import { createToaster } from '@ark-ui/react/dist/components/toast/create-toaster.js';

export type NotifyStatus = 'success' | 'error' | 'info' | 'warning';

// const toaster = createToaster({ placement: 'top-end' });

export function notify({
  status,
  title,
  description,
  duration
}: {
  status: NotifyStatus;
  title: string;
  description?: string;
  duration?: number;
}) {
  // Pas d'action en test (toaster désactivé)
} 