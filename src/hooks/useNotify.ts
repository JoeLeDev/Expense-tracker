import { useToast } from '@chakra-ui/react';

export type NotifyStatus = 'success' | 'error' | 'info' | 'warning';

export const useNotify = () => {
  const toast = useToast();

  const notify = (
    title: string,
    description?: string,
    status: NotifyStatus = 'info',
    options?: any
  ) => {
    toast({
      title,
      description,
      status,
      duration: 4000,
      isClosable: true,
      position: 'top-right',
      ...options,
    });
  };

  return notify;
}; 