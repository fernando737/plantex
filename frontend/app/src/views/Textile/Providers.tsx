import React, { useState } from 'react';
import { useProviders } from '@/hooks/textile/useTextileApi';
import { Provider, ProviderFormData } from '@/types/textile';
import ProvidersView from './ProvidersView';
import ProviderDialog from '@/components/Textile/ProviderDialog';
import toast from 'react-hot-toast';

const Providers: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();

  const providerHooks = useProviders();
  const createProvider = providerHooks.useCreate();
  const updateProvider = providerHooks.useUpdate(selectedProvider?.id || 0);

  const isLoading = createProvider.isPending || updateProvider.isPending;

  const handleCreateProvider = () => {
    setSelectedProvider(undefined);
    setDialogOpen(true);
  };

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setDialogOpen(false);
      setSelectedProvider(undefined);
    }
  };

  const handleSubmitProvider = async (data: ProviderFormData) => {
    try {
      if (selectedProvider) {
        // Update existing provider
        await updateProvider.mutateAsync(data);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        // Create new provider
        await createProvider.mutateAsync(data);
        toast.success('Proveedor creado exitosamente');
      }
      handleCloseDialog();
    } catch (error) {
      const action = selectedProvider ? 'actualizar' : 'crear';
      toast.error(`Error al ${action} el proveedor`);
      console.error(`${action} provider error:`, error);
    }
  };

  return (
    <>
      <ProvidersView
        onCreateProvider={handleCreateProvider}
        onEditProvider={handleEditProvider}
      />
      
      <ProviderDialog
        open={dialogOpen}
        provider={selectedProvider}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitProvider}
        loading={isLoading}
      />
    </>
  );
};

export default Providers;