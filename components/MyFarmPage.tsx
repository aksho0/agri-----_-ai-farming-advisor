import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import AddNewCropModal from './AddNewCropModal';
import { Crop, FarmTask } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { CheckboxIcon, CheckboxUncheckedIcon } from './Icons';


const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const generateTasksForCrop = (crop: Omit<Crop, 'tasks'>, t: (key: string) => string): FarmTask[] => {
    const tasks: FarmTask[] = [];
    const cropNameForSchedule = crop.nameKey ? t(crop.nameKey) : crop.name;

    const schedules: { [key: string]: { [key: string]: number[] } } = {
        [t('crop_name_wheat')]: { soil_preparation: [-7], sowing: [0], irrigation: [20, 40, 60, 80, 100], fertilizer: [0, 40, 80], weeding: [30, 50], harvesting: [120] },
        [t('crop_name_sugarcane')]: { soil_preparation: [-15], sowing: [0], irrigation: [30, 60, 90, 120, 150, 180, 210, 240, 270], fertilizer: [45, 90, 120], weeding: [45, 75, 105], harvesting: [365] },
        [t('crop_name_tomato')]: { soil_preparation: [-5], sowing: [0], irrigation: [15, 22, 29, 36, 43, 50, 57], fertilizer: [20, 45, 65], weeding: [25, 40], harvesting: [90] },
    };
    
    const taskNameMap: { [key: string]: string } = {
        soil_preparation: t('task_name_soil_preparation'),
        sowing: t('task_name_sowing'),
        weeding: t('task_name_weeding'),
        harvesting: t('task_name_harvesting'),
    }

    const schedule = schedules[cropNameForSchedule];
    if (schedule) {
        Object.entries(schedule).forEach(([type, daysList]) => {
            daysList.forEach(days => {
                let name = '';
                if(type === 'irrigation') name = t('task_name_irrigation_at_days').replace('{days}', days.toString());
                else if (type === 'fertilizer') name = t('task_name_fertilizer_at_days').replace('{days}', days.toString());
                else name = taskNameMap[type as keyof typeof taskNameMap] || type;

                tasks.push({
                    id: `${crop.id}-${type}-${days}`,
                    type: type as FarmTask['type'],
                    name,
                    dueDate: addDays(crop.plantingDate, days),
                    isCompleted: false,
                });
            });
        });
    }
    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

interface MyFarmPageProps {
    seasonTheme: Theme;
}

const MyFarmPage: React.FC<MyFarmPageProps> = ({ seasonTheme }) => {
    const { t, language } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [myCrops, setMyCrops] = useState<Crop[]>([]);
    const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
    const [deletingCropId, setDeletingCropId] = useState<string | null>(null);
    const initRef = useRef(false);

    const initialCrops = useMemo(() => {
        const initialCropsData: (Omit<Crop, 'id' | 'tasks' | 'name'> & { nameKey: string })[] = [
            { nameKey: 'crop_name_wheat', plantingDate: '2023-11-15', harvestDate: '2024-04-15', area: 5, soilType: 'Loamy' },
            { nameKey: 'crop_name_sugarcane', plantingDate: '2023-10-01', harvestDate: '2024-12-01', area: 10, soilType: 'Clay' },
            { nameKey: 'crop_name_tomato', plantingDate: '2024-01-20', harvestDate: '2024-05-20', area: 1.5, soilType: 'Sandy' },
        ];
        return initialCropsData.map((cropData, index) => {
            const name = t(cropData.nameKey);
            const cropWithIdAndName = { ...cropData, id: (index + 1).toString(), name };
            return {
                ...cropWithIdAndName,
                tasks: generateTasksForCrop(cropWithIdAndName, t)
            };
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!initRef.current) {
            setMyCrops(initialCrops);
            initRef.current = true;
        } else {
             setMyCrops(prevCrops => prevCrops.map(crop => {
                if (crop.nameKey) { // This is a predefined crop, update its name and task names
                    const newName = t(crop.nameKey);
                    const tempCropForTaskGen = { ...crop, name: newName };
                    const newTasks = generateTasksForCrop(tempCropForTaskGen, t).map(newTask => {
                        const oldTask = crop.tasks.find(t => t.id === newTask.id);
                        return oldTask ? { ...newTask, isCompleted: oldTask.isCompleted } : newTask;
                    });
                    return { ...crop, name: newName, tasks: newTasks };
                }
                return crop; // This is a user-added crop, no change needed
            }));
        }
    }, [t, language, initialCrops]);

    const handleSaveCrop = (cropData: Omit<Crop, 'id' | 'tasks'> & { id?: string }) => {
        if (cropData.id) { // Editing existing crop
            setMyCrops(prev => prev.map(c => {
                 if (c.id === cropData.id) {
                    const nameKey = c.nameKey; 
                    const updatedCrop = { ...c, ...cropData, nameKey };
                    const existingTasks = c.tasks; // Preserve completion status
                    const newTasks = generateTasksForCrop(updatedCrop, t).map(newTask => {
                        const oldTask = existingTasks.find(t => t.id === newTask.id);
                        return oldTask ? { ...newTask, isCompleted: oldTask.isCompleted } : newTask;
                    });
                    return { ...updatedCrop, tasks: newTasks };
                }
                return c;
            }));
        } else { // Adding new crop
            const newId = new Date().getTime().toString();
            const cropWithId = { ...cropData, id: newId };
            const newCrop: Crop = {
                ...cropWithId,
                tasks: generateTasksForCrop(cropWithId, t)
            };
            setMyCrops(prev => [...prev, newCrop]);
        }
        setEditingCrop(null);
        setIsModalOpen(false);
    };
    
    const handleOpenEditModal = (crop: Crop) => {
        setEditingCrop(crop);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingCrop(null);
        setIsModalOpen(false);
    };

    const handleTaskToggle = (cropId: string, taskId: string) => {
        setMyCrops(prev => prev.map(crop => {
            if (crop.id === cropId) {
                return {
                    ...crop,
                    tasks: crop.tasks.map(task => 
                        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
                    )
                };
            }
            return crop;
        }));
    };
    
    const handleDeleteConfirm = () => {
        if(deletingCropId) {
            setMyCrops(prev => prev.filter(c => c.id !== deletingCropId));
            setDeletingCropId(null);
        }
    };

    const phases: { key: FarmTask['type'], name: string }[] = useMemo(() => [
        { key: 'soil_preparation', name: t('phase_soil_preparation')},
        { key: 'sowing', name: t('phase_sowing')},
        { key: 'irrigation', name: t('phase_irrigation')},
        { key: 'weeding', name: t('phase_weeding')},
        { key: 'harvesting', name: t('phase_harvesting')},
    ], [t]);
    
    const handlePhaseClick = (cropId: string, clickedPhaseIndex: number) => {
        setMyCrops(prevCrops => prevCrops.map(crop => {
            if (crop.id === cropId) {
                const updatedTasks = crop.tasks.map(task => {
                    const taskPhaseIndex = phases.findIndex(p => p.key === task.type);
                    if (taskPhaseIndex !== -1) {
                        return { ...task, isCompleted: taskPhaseIndex <= clickedPhaseIndex };
                    }
                    return task;
                });
                return { ...crop, tasks: updatedTasks };
            }
            return crop;
        }));
    };

    const handlePhaseDoubleClick = (cropId: string, doubleClickedPhaseIndex: number) => {
        setMyCrops(prevCrops => prevCrops.map(crop => {
            if (crop.id === cropId) {
                const updatedTasks = crop.tasks.map(task => {
                    const taskPhaseIndex = phases.findIndex(p => p.key === task.type);
                    if (taskPhaseIndex !== -1 && taskPhaseIndex >= doubleClickedPhaseIndex) {
                        return { ...task, isCompleted: false };
                    }
                    return task;
                });
                return { ...crop, tasks: updatedTasks };
            }
            return crop;
        }));
    };

    const FarmProgressBar = ({ tasks, cropId }: { tasks: FarmTask[]; cropId: string }) => {
        let highestCompletedIndex = -1;
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            const tasksForPhase = tasks.filter(t => t.type === phase.key);

            // A phase is considered complete if it has no tasks defined for it, OR if all of its tasks are completed.
            const isPhaseComplete = tasksForPhase.length === 0 || tasksForPhase.every(t => t.isCompleted);

            if (isPhaseComplete) {
                highestCompletedIndex = i;
            } else {
                // Stop checking as soon as an incomplete phase is found.
                break;
            }
        }
        const currentPhaseIndex = highestCompletedIndex + 1;


        return (
            <div className="flex justify-between items-center my-3">
                {phases.map((phase, index) => {
                    const isCompleted = index < currentPhaseIndex;
                    const isCurrent = index === currentPhaseIndex;
                    return (
                        <React.Fragment key={phase.key}>
                            <button
                                onClick={() => handlePhaseClick(cropId, index)}
                                onDoubleClick={() => handlePhaseDoubleClick(cropId, index)}
                                className="flex flex-col items-center text-center focus:outline-none group"
                                aria-label={`Mark ${phase.name} as done`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110
                                    ${isCompleted ? `${seasonTheme.primaryBg} text-white border-transparent` : 
                                      isCurrent ? `${seasonTheme.primaryBg} text-white border-transparent ring-2 ring-offset-2 ${seasonTheme.ring}` : 
                                      'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`
                                }>
                                   {isCompleted ? '✓' : index + 1}
                                </div>
                                <p className={`text-xs mt-1 transition-colors ${isCurrent ? `font-bold ${seasonTheme.text}` : 'text-gray-500 dark:text-gray-400'}`}>
                                    {phase.name}
                                </p>
                            </button>
                            {index < phases.length - 1 && <div className={`flex-1 h-1 mx-1 ${index < currentPhaseIndex ? seasonTheme.primaryBg : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const TaskItem = ({ task, onToggle }: { task: FarmTask; onToggle: () => void; }) => {
        const isOverdue = new Date(task.dueDate) < new Date() && !task.isCompleted;

        return (
             <div className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <div className="flex items-center space-x-3">
                    <button onClick={onToggle} aria-label={task.name}>
                       {task.isCompleted ? <CheckboxIcon /> : <CheckboxUncheckedIcon />}
                    </button>
                    <div>
                        <p className={`text-sm font-semibold ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{task.name}</p>
                        <p className={`text-xs ${task.isCompleted ? 'text-gray-400 dark:text-gray-500' : isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                           {new Date(task.dueDate).toLocaleDateString()} {isOverdue ? `(${t('overdue')})` : ''}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-20 md:pb-4 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('my_farm_title')}</h2>
                    <p className={`${seasonTheme.textMuted}`}>{t('my_farm_subtitle')}</p>
                </div>
                <button
                    onClick={() => { setEditingCrop(null); setIsModalOpen(true); }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white ${seasonTheme.primaryBg} hover:opacity-90 shadow-lg transform transition-transform hover:scale-105`}
                >
                    <PlusIcon />
                    <span className="hidden md:inline">{t('add_new_crop')}</span>
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {myCrops.length > 0 ? myCrops.map(crop => {
                    const irrigationTasks = crop.tasks.filter(t => t.type === 'irrigation');
                    const fertilizerTasks = crop.tasks.filter(t => t.type === 'fertilizer');
                    return (
                        <div key={crop.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-md flex flex-col">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{crop.name}</h3>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => handleOpenEditModal(crop)} className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={() => setDeletingCropId(crop.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 text-sm mt-1">
                                <p className="text-gray-600 dark:text-gray-300"><strong>{t('planting_date')}:</strong> {new Date(crop.plantingDate).toLocaleDateString()}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>{t('area')}:</strong> {crop.area} {t('acres')}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>{t('harvest_date')}:</strong> {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                                <p className="text-gray-600 dark:text-gray-300"><strong>{t('soil_type')}:</strong> {t(`soil_type_${crop.soilType.toLowerCase()}`)}</p>
                            </div>

                            <FarmProgressBar tasks={crop.tasks} cropId={crop.id} />
                            
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t('irrigation_tasks')}</h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2 mt-2">
                                        {irrigationTasks.filter(t => !t.isCompleted).length > 0 ? irrigationTasks.filter(t => !t.isCompleted).map(task => (
                                            <TaskItem key={task.id} task={task} onToggle={() => handleTaskToggle(crop.id, task.id)} />
                                        )) : <p className="text-xs text-center p-2 text-gray-400 dark:text-gray-500">{t('all_tasks_complete')}</p>}
                                        
                                        {irrigationTasks.filter(t => t.isCompleted).length > 0 && (
                                            <details className="pt-2">
                                                <summary className="text-sm font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">{t('completed_tasks')} ({irrigationTasks.filter(t => t.isCompleted).length})</summary>
                                                {irrigationTasks.filter(t => t.isCompleted).map(task => (
                                                    <TaskItem key={task.id} task={task} onToggle={() => handleTaskToggle(crop.id, task.id)} />
                                                ))}
                                            </details>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t('fertilizer_tasks')}</h4>
                                     <div className="space-y-1 max-h-40 overflow-y-auto pr-2 mt-2">
                                        {fertilizerTasks.filter(t => !t.isCompleted).length > 0 ? fertilizerTasks.filter(t => !t.isCompleted).map(task => (
                                            <TaskItem key={task.id} task={task} onToggle={() => handleTaskToggle(crop.id, task.id)} />
                                        )) : <p className="text-xs text-center p-2 text-gray-400 dark:text-gray-500">{t('all_tasks_complete')}</p>}
                                        
                                        {fertilizerTasks.filter(t => t.isCompleted).length > 0 && (
                                            <details className="pt-2">
                                                <summary className="text-sm font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">{t('completed_tasks')} ({fertilizerTasks.filter(t => t.isCompleted).length})</summary>
                                                {fertilizerTasks.filter(t => t.isCompleted).map(task => (
                                                    <TaskItem key={task.id} task={task} onToggle={() => handleTaskToggle(crop.id, task.id)} />
                                                ))}
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="lg:col-span-2 text-center p-8 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                        <p className="text-gray-500 dark:text-gray-400">{t('no_crops_prompt')}</p>
                    </div>
                )}
            </div>

            {(isModalOpen) && (
                <AddNewCropModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveCrop}
                    seasonTheme={seasonTheme}
                    cropToEdit={editingCrop}
                />
            )}
            
            <DeleteConfirmationModal
                isOpen={!!deletingCropId}
                onClose={() => setDeletingCropId(null)}
                onConfirm={handleDeleteConfirm}
                seasonTheme={seasonTheme}
            />
        </div>
    );
};

export default MyFarmPage;