import React, { useState } from 'react';
import { useProductionBudgets, useProductionBudgetItems } from '@/hooks/textile/useTextileApi';
import { ProductionBudget, ProductionBudgetFormData, ProductionBudgetItem, ProductionBudgetItemFormData } from '@/types/textile';
import ProductionBudgetsView from '@/components/Textile/ProductionBudgetsView';
import ProductionBudgetDialog from '@/components/Textile/ProductionBudgetDialog';
import ProductionBudgetItemDialog from '@/components/Textile/ProductionBudgetItemDialog';
import toast from 'react-hot-toast';

const ProductionBudgets: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedProductionBudget, setSelectedProductionBudget] = useState<ProductionBudget | null>(null);
  const [selectedProductionBudgetItem, setSelectedProductionBudgetItem] = useState<ProductionBudgetItem | null>(null);
  const [budgetForItem, setBudgetForItem] = useState<ProductionBudget | null>(null);

  const productionBudgetHooks = useProductionBudgets();
  const productionBudgetItemHooks = useProductionBudgetItems();

  const createProductionBudget = productionBudgetHooks.useCreate();
  const updateProductionBudget = productionBudgetHooks.useUpdate(selectedProductionBudget?.id || 0);
  const createProductionBudgetItem = productionBudgetItemHooks.useCreate();
  const updateProductionBudgetItem = productionBudgetItemHooks.useUpdate(selectedProductionBudgetItem?.id || 0);

  const handleCreateProductionBudget = () => {
    setSelectedProductionBudget(null);
    setDialogOpen(true);
  };

  const handleEditProductionBudget = (productionBudget: ProductionBudget) => {
    setSelectedProductionBudget(productionBudget);
    setDialogOpen(true);
  };

  const handleAddBudgetItem = (productionBudget: ProductionBudget) => {
    setSelectedProductionBudgetItem(null);
    setBudgetForItem(productionBudget);
    setItemDialogOpen(true);
  };

  const handleEditBudgetItem = (budgetItem: ProductionBudgetItem) => {
    setSelectedProductionBudgetItem(budgetItem);
    setBudgetForItem(null);
    setItemDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProductionBudget(null);
  };

  const handleCloseItemDialog = () => {
    setItemDialogOpen(false);
    setSelectedProductionBudgetItem(null);
    setBudgetForItem(null);
  };

  const handleSubmitProductionBudget = async (data: ProductionBudgetFormData) => {
    try {
      if (selectedProductionBudget) {
        await updateProductionBudget.mutateAsync(data);
        toast.success('Presupuesto de producción actualizado exitosamente');
      } else {
        await createProductionBudget.mutateAsync(data);
        toast.success('Presupuesto de producción creado exitosamente');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(
        selectedProductionBudget 
          ? 'Error al actualizar el presupuesto de producción'
          : 'Error al crear el presupuesto de producción'
      );
      console.error('Production budget submit error:', error);
    }
  };

  const handleSubmitProductionBudgetItem = async (data: ProductionBudgetItemFormData) => {
    try {
      if (selectedProductionBudgetItem) {
        await updateProductionBudgetItem.mutateAsync(data);
        toast.success('Item del presupuesto actualizado exitosamente');
      } else {
        await createProductionBudgetItem.mutateAsync(data);
        toast.success('Item del presupuesto agregado exitosamente');
      }
      handleCloseItemDialog();
    } catch (error) {
      toast.error(
        selectedProductionBudgetItem 
          ? 'Error al actualizar el item del presupuesto'
          : 'Error al agregar el item del presupuesto'
      );
      console.error('Production budget item submit error:', error);
    }
  };

  return (
    <>
      <ProductionBudgetsView
        onCreateProductionBudget={handleCreateProductionBudget}
        onEditProductionBudget={handleEditProductionBudget}
        onAddBudgetItem={handleAddBudgetItem}
        onEditBudgetItem={handleEditBudgetItem}
      />

      <ProductionBudgetDialog
        open={dialogOpen}
        productionBudget={selectedProductionBudget || undefined}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitProductionBudget}
        loading={createProductionBudget.isPending || updateProductionBudget.isPending}
      />

      <ProductionBudgetItemDialog
        open={itemDialogOpen}
        productionBudgetItem={selectedProductionBudgetItem || undefined}
        productionBudget={budgetForItem || undefined}
        onClose={handleCloseItemDialog}
        onSubmit={handleSubmitProductionBudgetItem}
        loading={createProductionBudgetItem.isPending || updateProductionBudgetItem.isPending}
      />
    </>
  );
};

export default ProductionBudgets;