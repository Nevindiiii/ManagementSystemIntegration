import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from 'sonner';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/settings`;

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { setSettings } = useSettingsStore();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await axios.get(API_BASE_URL, { withCredentials: true });
      setSettings(data);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { data } = await axios.put(API_BASE_URL, newSettings, { withCredentials: true });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSettings(data);
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
