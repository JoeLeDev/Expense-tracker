import { createToaster, Toaster as ArkToaster } from '@ark-ui/react';

export type NotifyStatus = 'success' | 'error' | 'info' | 'warning';

export const toaster = createToaster({ placement: 'top-end' });

export function notify({ status = 'info', title, description, duration = 4000 }: {
  status?: NotifyStatus;
  title: string;
  description?: string;
  duration?: number;
}) {
  toaster.create({
    type: status,
    title,
    description,
    duration,
  });
}

export { ArkToaster as Toaster }; 