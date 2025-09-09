import React, { useState } from 'react';
import { useBOMTemplates, useBOMItems } from '@/hooks/textile/useTextileApi';
import { BOMTemplate, BOMTemplateFormData, BOMItem, BOMItemFormData } from '@/types/textile';
import BOMsView from './BOMsView';
import BOMTemplateDialog from '@/components/Textile/BOMTemplateDialog';
import BOMItemDialog from '@/components/Textile/BOMItemDialog';
import toast from 'react-hot-toast';

const BOMs: React.FC = () => {
  const [bomTemplateDialogOpen, setBOMTemplateDialogOpen] = useState(false);
  const [bomItemDialogOpen, setBOMItemDialogOpen] = useState(false);
  
  const [selectedBOMTemplate, setSelectedBOMTemplate] = useState<BOMTemplate | undefined>();
  const [selectedBOMItem, setSelectedBOMItem] = useState<BOMItem | undefined>();
  const [currentBOMTemplate, setCurrentBOMTemplate] = useState<BOMTemplate | undefined>();

  const bomTemplateHooks = useBOMTemplates();
  const bomItemHooks = useBOMItems();
  
  const createBOMTemplate = bomTemplateHooks.useCreate();
  const updateBOMTemplate = bomTemplateHooks.useUpdate(selectedBOMTemplate?.id || 0);
  const createBOMItem = bomItemHooks.useCreate();
  const updateBOMItem = bomItemHooks.useUpdate(selectedBOMItem?.id || 0);

  const isBOMTemplateLoading = createBOMTemplate.isPending || updateBOMTemplate.isPending;
  const isBOMItemLoading = createBOMItem.isPending || updateBOMItem.isPending;

  // BOM Template CRUD handlers
  const handleCreateBOM = () => {
    setSelectedBOMTemplate(undefined);
    setBOMTemplateDialogOpen(true);
  };

  const handleEditBOM = (bomTemplate: BOMTemplate) => {
    setSelectedBOMTemplate(bomTemplate);
    setBOMTemplateDialogOpen(true);
  };

  const handleCloseBOMTemplateDialog = () => {
    if (!isBOMTemplateLoading) {
      setBOMTemplateDialogOpen(false);
      setSelectedBOMTemplate(undefined);
    }
  };

  const handleSubmitBOMTemplate = async (data: BOMTemplateFormData) => {
    try {
      if (selectedBOMTemplate) {
        await updateBOMTemplate.mutateAsync(data);
        toast.success('BOM actualizada exitosamente');
      } else {
        await createBOMTemplate.mutateAsync(data);
        toast.success('BOM creada exitosamente');
      }
      handleCloseBOMTemplateDialog();
    } catch (error) {
      const action = selectedBOMTemplate ? 'actualizar' : 'crear';
      toast.error(`Error al ${action} la BOM`);
      console.error(`${action} BOM template error:`, error);
    }
  };

  // BOM Item CRUD handlers
  const handleAddBOMItem = (bomTemplate: BOMTemplate) => {
    setCurrentBOMTemplate(bomTemplate);
    setSelectedBOMItem(undefined);
    setBOMItemDialogOpen(true);
  };

  const handleEditBOMItem = (bomItem: BOMItem) => {
    setSelectedBOMItem(bomItem);
    setCurrentBOMTemplate(undefined); // Will be inferred from bomItem
    setBOMItemDialogOpen(true);
  };

  const handleCloseBOMItemDialog = () => {
    if (!isBOMItemLoading) {
      setBOMItemDialogOpen(false);
      setSelectedBOMItem(undefined);
      setCurrentBOMTemplate(undefined);
    }
  };

  const handleSubmitBOMItem = async (data: BOMItemFormData) => {
    try {
      if (selectedBOMItem) {
        await updateBOMItem.mutateAsync(data);
        toast.success('Item de BOM actualizado exitosamente');
      } else {
        await createBOMItem.mutateAsync(data);
        toast.success('Item agregado exitosamente a la BOM');
      }
      handleCloseBOMItemDialog();
    } catch (error) {
      const action = selectedBOMItem ? 'actualizar' : 'agregar';
      toast.error(`Error al ${action} el item de BOM`);
      console.error(`${action} BOM item error:`, error);
    }
  };

  return (
    <>
      <BOMsView
        onCreateBOM={handleCreateBOM}
        onEditBOM={handleEditBOM}
        onAddBOMItem={handleAddBOMItem}
        onEditBOMItem={handleEditBOMItem}
      />
      
      <BOMTemplateDialog
        open={bomTemplateDialogOpen}
        bomTemplate={selectedBOMTemplate}
        onClose={handleCloseBOMTemplateDialog}
        onSubmit={handleSubmitBOMTemplate}
        loading={isBOMTemplateLoading}
      />

      <BOMItemDialog
        open={bomItemDialogOpen}
        bomItem={selectedBOMItem}
        bomTemplate={currentBOMTemplate}
        onClose={handleCloseBOMItemDialog}
        onSubmit={handleSubmitBOMItem}
        loading={isBOMItemLoading}
      />
    </>
  );
};

export default BOMs;