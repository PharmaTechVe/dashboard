import { useState } from 'react';
import Input from './Input';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Colors } from '@/styles/styles';

export default function InventoryStock({
  stock,
  inventoryId,
}: {
  stock: number;
  inventoryId: string;
}) {
  const { token } = useAuth();
  const [value, setValue] = useState<number>(stock);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.inventory.update(inventoryId, { stockQuantity: value }, token!);
      toast.success('Stock actualizado correctamente');
    } catch (error) {
      // Optionally handle error
      console.error('Error updating stock:', error);
      toast.error('Error al actualizar el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    setUpdated(newValue !== stock);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Input
          value={value.toString()}
          onChange={handleChange}
          disabled={loading}
        />
        <CheckCircleIcon
          className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer"
          width={24}
          height={24}
          color={updated ? Colors.semanticSuccess : Colors.disabled}
          onClick={handleSubmit}
        />
      </div>
    </form>
  );
}
