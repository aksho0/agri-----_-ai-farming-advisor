// Fix: Provide the implementation for the AddNewCropModal component.
import React, { useState, useEffect } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { CloseIcon } from './Icons';
import { Crop, SoilType } from '../types';

interface AddNewCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (cropData: Omit<Crop, 'id' | 'tasks'> & { id?: string }) => void;
    seasonTheme: Theme;
    cropToEdit?: Crop | null;
}

const AddNewCropModal: React.FC<AddNewCropModalProps> = ({ isOpen, onClose, onSave, seasonTheme, cropToEdit }) => {
    const { t } = useTranslation();
    const isEditMode = !!cropToEdit;
    
    const [name, setName] = useState('');
    const [plantingDate, setPlantingDate] = useState('');
    const [harvestDate, setHarvestDate] = useState('');
    const [area, setArea] = useState('');
    const [soilType, setSoilType] = useState<SoilType>('Loamy');
    const [errors, setErrors] = useState<{ name?: string; area?: string, plantingDate?: string, harvestDate?: string }>({});

    useEffect(() => {
        if (isEditMode) {
            setName(cropToEdit.name);
            setPlantingDate(cropToEdit.plantingDate);
            setHarvestDate(cropToEdit.harvestDate || '');
            setArea(cropToEdit.area.toString());
            setSoilType(cropToEdit.soilType);
        } else {
            // Reset form for adding new
            setName('');
            setPlantingDate(new Date().toISOString().split('T')[0]);
            setHarvestDate('');
            setArea('');
            setSoilType('Loamy');
        }
        setErrors({});
    }, [cropToEdit, isEditMode, isOpen]);


    const validate = () => {
        const newErrors: { name?: string; area?: string, plantingDate?: string, harvestDate?: string } = {};
        if (!name.trim()) newErrors.name = t('field_required');
        if (!area.trim() || isNaN(parseFloat(area)) || parseFloat(area) <= 0) {
            newErrors.area = t('field_invalid_area');
        }
        if (!plantingDate) {
            newErrors.plantingDate = t('field_required');
        }
        if (harvestDate && plantingDate && new Date(harvestDate) <= new Date(plantingDate)) {
            newErrors.harvestDate = t('field_invalid_date');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave({
                id: isEditMode ? cropToEdit.id : undefined,
                name,
                plantingDate,
                harvestDate,
                area: parseFloat(area),
                soilType,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <CloseIcon />
                </button>
                <h2 className={`text-xl font-bold mb-4 ${seasonTheme.text}`}>
                    {isEditMode ? t('edit_crop_modal_title') : t('add_crop_modal_title')}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="crop-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crop_name')}</label>
                        <input
                            id="crop-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('crop_name_placeholder')}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="soil-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('soil_type')}</label>
                        <select
                            id="soil-type"
                            value={soilType}
                            onChange={(e) => setSoilType(e.target.value as SoilType)}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                        >
                            <option value="Loamy">{t('soil_type_loamy')}</option>
                            <option value="Clay">{t('soil_type_clay')}</option>
                            <option value="Sandy">{t('soil_type_sandy')}</option>
                            <option value="Other">{t('soil_type_other')}</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="planting-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('planting_date')}</label>
                            <input
                                id="planting-date"
                                type="date"
                                value={plantingDate}
                                onChange={(e) => setPlantingDate(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border ${errors.plantingDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                            />
                            {errors.plantingDate && <p className="text-xs text-red-500 mt-1">{errors.plantingDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="harvest-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('harvest_date')}</label>
                            <input
                                id="harvest-date"
                                type="date"
                                value={harvestDate}
                                onChange={(e) => setHarvestDate(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border ${errors.harvestDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                            />
                             {errors.harvestDate && <p className="text-xs text-red-500 mt-1">{errors.harvestDate}</p>}
                        </div>
                    </div>
                   
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('area')} ({t('acres')})</label>
                        <input
                            id="area"
                            type="number"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder={t('area_placeholder')}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border ${errors.area ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                        />
                        {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold hover:opacity-90">{t('cancel')}</button>
                    <button onClick={handleSave} className={`px-4 py-2 rounded-md ${seasonTheme.primaryBg} text-white font-semibold hover:opacity-90`}>
                        {isEditMode ? t('save_changes') : t('save_crop')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewCropModal;