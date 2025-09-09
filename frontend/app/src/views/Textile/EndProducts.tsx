import React, { useState } from 'react';
import { useEndProducts, useAdditionalCosts } from '@/hooks/textile/useTextileApi';
import { EndProduct, EndProductFormData, AdditionalCost, AdditionalCostFormData } from '@/types/textile';
import EndProductsView from './EndProductsView';
import EndProductDialog from '@/components/Textile/EndProductDialog';
import AdditionalCostDialog from '@/components/Textile/AdditionalCostDialog';
import toast from 'react-hot-toast';

const EndProducts: React.FC = () => {
  const [endProductDialogOpen, setEndProductDialogOpen] = useState(false);
  const [additionalCostDialogOpen, setAdditionalCostDialogOpen] = useState(false);
  
  const [selectedEndProduct, setSelectedEndProduct] = useState<EndProduct | undefined>();
  const [selectedAdditionalCost, setSelectedAdditionalCost] = useState<AdditionalCost | undefined>();
  const [currentEndProduct, setCurrentEndProduct] = useState<EndProduct | undefined>();

  const endProductHooks = useEndProducts();
  const additionalCostHooks = useAdditionalCosts();
  
  const createEndProduct = endProductHooks.useCreate();
  const updateEndProduct = endProductHooks.useUpdate(selectedEndProduct?.id || 0);
  const createAdditionalCost = additionalCostHooks.useCreate();
  const updateAdditionalCost = additionalCostHooks.useUpdate(selectedAdditionalCost?.id || 0);

  const isEndProductLoading = createEndProduct.isPending || updateEndProduct.isPending;
  const isAdditionalCostLoading = createAdditionalCost.isPending || updateAdditionalCost.isPending;

  // End Product CRUD handlers
  const handleCreateEndProduct = () => {
    setSelectedEndProduct(undefined);
    setEndProductDialogOpen(true);
  };

  const handleEditEndProduct = (endProduct: EndProduct) => {
    setSelectedEndProduct(endProduct);
    setEndProductDialogOpen(true);
  };

  const handleCloseEndProductDialog = () => {
    if (!isEndProductLoading) {
      setEndProductDialogOpen(false);
      setSelectedEndProduct(undefined);
    }
  };

  const handleSubmitEndProduct = async (data: EndProductFormData) => {
    try {
      if (selectedEndProduct) {
        await updateEndProduct.mutateAsync(data);
        toast.success('Producto final actualizado exitosamente');
      } else {
        await createEndProduct.mutateAsync(data);
        toast.success('Producto final creado exitosamente');
      }
      handleCloseEndProductDialog();
    } catch (error) {
      const action = selectedEndProduct ? 'actualizar' : 'crear';
      toast.error(`Error al ${action} el producto final`);
      console.error(`${action} end product error:`, error);
    }
  };

  // Additional Cost CRUD handlers
  const handleAddAdditionalCost = (endProduct: EndProduct) => {
    setCurrentEndProduct(endProduct);
    setSelectedAdditionalCost(undefined);
    setAdditionalCostDialogOpen(true);
  };

  const handleEditAdditionalCost = (additionalCost: AdditionalCost) => {
    setSelectedAdditionalCost(additionalCost);
    setCurrentEndProduct(undefined); // Will be inferred from additionalCost
    setAdditionalCostDialogOpen(true);
  };

  const handleCloseAdditionalCostDialog = () => {
    if (!isAdditionalCostLoading) {
      setAdditionalCostDialogOpen(false);
      setSelectedAdditionalCost(undefined);
      setCurrentEndProduct(undefined);
    }
  };

  const handleSubmitAdditionalCost = async (data: AdditionalCostFormData) => {
    try {
      if (selectedAdditionalCost) {
        await updateAdditionalCost.mutateAsync(data);
        toast.success('Costo adicional actualizado exitosamente');
      } else {
        await createAdditionalCost.mutateAsync(data);
        toast.success('Costo adicional agregado exitosamente');
      }
      handleCloseAdditionalCostDialog();
    } catch (error) {
      const action = selectedAdditionalCost ? 'actualizar' : 'agregar';
      toast.error(`Error al ${action} el costo adicional`);
      console.error(`${action} additional cost error:`, error);
    }
  };

  return (
    <>
      <EndProductsView
        onCreateEndProduct={handleCreateEndProduct}
        onEditEndProduct={handleEditEndProduct}
        onAddAdditionalCost={handleAddAdditionalCost}
        onEditAdditionalCost={handleEditAdditionalCost}
      />
      
      <EndProductDialog
        open={endProductDialogOpen}
        endProduct={selectedEndProduct}
        onClose={handleCloseEndProductDialog}
        onSubmit={handleSubmitEndProduct}
        loading={isEndProductLoading}
      />

      <AdditionalCostDialog
        open={additionalCostDialogOpen}
        additionalCost={selectedAdditionalCost}
        endProduct={currentEndProduct}
        onClose={handleCloseAdditionalCostDialog}
        onSubmit={handleSubmitAdditionalCost}
        loading={isAdditionalCostLoading}
      />
    </>
  );
};

export default EndProducts;