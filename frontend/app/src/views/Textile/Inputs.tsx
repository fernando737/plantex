import React, { useState } from 'react';
import { useInputs, useInputProviders } from '@/hooks/textile/useTextileApi';
import { Input, InputFormData, InputProvider, InputProviderFormData } from '@/types/textile';
import InputsView from './InputsView';
import InputDialog from '@/components/Textile/InputDialog';
import InputPricingDialog from '@/components/Textile/InputPricingDialog';
import InputProviderDialog from '@/components/Textile/InputProviderDialog';
import toast from 'react-hot-toast';

const Inputs: React.FC = () => {
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  
  const [selectedInput, setSelectedInput] = useState<Input | undefined>();
  const [selectedInputProvider, setSelectedInputProvider] = useState<InputProvider | undefined>();
  const [pricingInput, setPricingInput] = useState<Input | undefined>();

  const inputHooks = useInputs();
  const inputProviderHooks = useInputProviders();
  
  const createInput = inputHooks.useCreate();
  const updateInput = inputHooks.useUpdate(selectedInput?.id || 0);
  const createInputProvider = inputProviderHooks.useCreate();
  const updateInputProvider = inputProviderHooks.useUpdate(selectedInputProvider?.id || 0);

  const isInputLoading = createInput.isPending || updateInput.isPending;
  const isProviderLoading = createInputProvider.isPending || updateInputProvider.isPending;

  // Input CRUD handlers
  const handleCreateInput = () => {
    setSelectedInput(undefined);
    setInputDialogOpen(true);
  };

  const handleEditInput = (input: Input) => {
    setSelectedInput(input);
    setInputDialogOpen(true);
  };

  const handleCloseInputDialog = () => {
    if (!isInputLoading) {
      setInputDialogOpen(false);
      setSelectedInput(undefined);
    }
  };

  const handleSubmitInput = async (data: InputFormData) => {
    try {
      if (selectedInput) {
        await updateInput.mutateAsync(data);
        toast.success('Insumo actualizado exitosamente');
      } else {
        await createInput.mutateAsync(data);
        toast.success('Insumo creado exitosamente');
      }
      handleCloseInputDialog();
    } catch (error) {
      const action = selectedInput ? 'actualizar' : 'crear';
      toast.error(`Error al ${action} el insumo`);
      console.error(`${action} input error:`, error);
    }
  };

  // Pricing management handlers
  const handleManagePricing = (input: Input) => {
    setPricingInput(input);
    setPricingDialogOpen(true);
  };

  const handleClosePricingDialog = () => {
    setPricingDialogOpen(false);
    setPricingInput(undefined);
  };

  const handleAddPrice = (input: Input) => {
    setPricingInput(input);
    setSelectedInputProvider(undefined);
    setPricingDialogOpen(false); // Close pricing dialog first
    setProviderDialogOpen(true);
  };

  const handleEditPrice = (inputProvider: InputProvider) => {
    setSelectedInputProvider(inputProvider);
    setPricingDialogOpen(false); // Close pricing dialog first
    setProviderDialogOpen(true);
  };

  const handleCloseProviderDialog = () => {
    if (!isProviderLoading) {
      setProviderDialogOpen(false);
      setSelectedInputProvider(undefined);
      // Reopen pricing dialog if we were managing pricing
      if (pricingInput) {
        setPricingDialogOpen(true);
      }
    }
  };

  const handleSubmitInputProvider = async (data: InputProviderFormData) => {
    try {
      if (selectedInputProvider) {
        await updateInputProvider.mutateAsync(data);
        toast.success('Precio actualizado exitosamente');
      } else {
        await createInputProvider.mutateAsync(data);
        toast.success('Precio agregado exitosamente');
      }
      handleCloseProviderDialog();
    } catch (error) {
      const action = selectedInputProvider ? 'actualizar' : 'agregar';
      toast.error(`Error al ${action} el precio`);
      console.error(`${action} input provider error:`, error);
    }
  };

  return (
    <>
      <InputsView
        onCreateInput={handleCreateInput}
        onEditInput={handleEditInput}
        onManagePricing={handleManagePricing}
      />
      
      <InputDialog
        open={inputDialogOpen}
        input={selectedInput}
        onClose={handleCloseInputDialog}
        onSubmit={handleSubmitInput}
        loading={isInputLoading}
      />

      <InputPricingDialog
        open={pricingDialogOpen}
        input={pricingInput}
        onClose={handleClosePricingDialog}
        onAddPrice={handleAddPrice}
        onEditPrice={handleEditPrice}
      />

      <InputProviderDialog
        open={providerDialogOpen}
        inputProvider={selectedInputProvider}
        input={pricingInput}
        onClose={handleCloseProviderDialog}
        onSubmit={handleSubmitInputProvider}
        loading={isProviderLoading}
      />
    </>
  );
};

export default Inputs;