import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * Hook to fetch all categories, subcategories, and their product counts.
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categories');
      return data;
    },
  });
}

/**
 * Hook to fetch products based on category, subcategory, partNumber search, and page limit parameters.
 */
export function useProducts(filters) {
  const { category, subcategory, partNumber, page, limit } = filters;
  return useQuery({
    queryKey: ['products', { category, subcategory, partNumber, page, limit }],
    queryFn: async () => {
      const params = {};
      if (category) params.category = category;
      if (subcategory) params.subcategory = subcategory;
      if (partNumber) params.partNumber = partNumber;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const { data } = await apiClient.get('/products', { params });
      return data;
    },
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch a single product details by its unique part number.
 */
export function useProductDetail(partNumber) {
  return useQuery({
    queryKey: ['product', partNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${encodeURIComponent(partNumber)}`);
      return data;
    },
    enabled: !!partNumber, // Only run query if partNumber is truthy
  });
}

/**
 * Hook to trigger a custom CSV file upload and import.
 */
export function useUploadCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh categories/products lists
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook to trigger server-side local sample CSV file import.
 */
export function useImportSampleCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/import-sample');
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
