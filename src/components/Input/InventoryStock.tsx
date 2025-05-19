import { useState } from 'react';
import Input from './Input';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function InventoryStock({
  stock,
  inventoryId,
}: {
  stock: number;
  inventoryId: string;
}) {
  const { token } = useAuth();
  const [value, setValue] = useState<number>(stock);
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
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={value.toString()}
        onChange={(e) => setValue(Number(e.target.value))}
        disabled={loading}
      />
    </form>
  );
}
