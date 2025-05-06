import { useEffect, useState } from 'react';

type FetchFunction<T, P> = (params: P, token: string) => Promise<T>;

export function useFetchReport<T, P>(
  fetchFunction: FetchFunction<T, P>,
  params: P,
  token: string,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFunction(params, token);
        setData(response);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error generando el reporte');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, params, token]);

  return { data, loading, error };
}
