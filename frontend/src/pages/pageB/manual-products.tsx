import { DataTablePagination } from '@/components/customUi/pagination';
import RowsPerPageSelect from '@/components/customUi/rows-per-page-select';
import React, { useState } from 'react';
import { createManualProductColumns } from '@/pages/pageB/tables/table-columns/manual-product-columns';
import { Input } from '@/components/ui/input';
import TableColumnsDropdown from '@/components/data-table/table-columns-dropdown';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { Product, createProduct, updateProduct, deleteProduct, fetchManualProducts } from '@/apis/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ManualProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [table, setTable] = useState<any | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchManualProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    brand: '',
    category: '',
    price: 0,
    rating: 0,
    stock: 0,
    description: '',
    image: '',
    size: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const { uploadToCloudinary } = await import('@/utils/cloudinary');
      const imageUrl = await uploadToCloudinary(file);
      setNewProduct({ ...newProduct, image: imageUrl });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  const getColumn = React.useCallback(
    (id: string) => {
      if (!table || !products.length) return undefined;
      if (typeof table.getColumn === 'function') return table.getColumn(id);
      if (table.table && typeof table.table.getColumn === 'function')
        return table.table.getColumn(id);
      return undefined;
    },
    [table, products.length]
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteProduct(id.toString());
      setProducts(products.filter(p => p.id.toString() !== id.toString()));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const columns = React.useMemo(
    () => createManualProductColumns(handleEdit, handleDelete),
    [products]
  );

  const dropdownColumns = React.useMemo(() => {
    if (!table || !products.length) return [];
    return columns.map((col: any) => {
      const id = col.id ?? col.accessorKey;
      const label = typeof col.header === 'string' ? col.header : id;
      return { id, label, isVisible: true };
    });
  }, [table, products.length, columns]);

  const handleToggleColumn = React.useCallback(
    (id: string, visible: boolean) => {
      const col = getColumn(id);
      if (col?.toggleVisibility) {
        col.toggleVisibility(visible);
        return;
      }
      if (table?.setColumnVisibility) {
        table.setColumnVisibility(id, visible);
        return;
      }
      if (table?.table?.setColumnVisibility) {
        table.table.setColumnVisibility(id, visible);
        return;
      }
    },
    [table, getColumn]
  );

  const handleAddProduct = async () => {
    console.log('Add Product button clicked');
    setLoading(true);
    try {
      const productData = {
        title: newProduct.title || '',
        brand: newProduct.brand || '',
        category: newProduct.category || '',
        price: newProduct.price || 0,
        rating: newProduct.rating || 0,
        stock: newProduct.stock || 0,
        description: newProduct.description || '',
        image: newProduct.image || '',
        size: newProduct.size || '',
      };
      console.log('Sending product data:', productData);
      const savedProduct = await createProduct(productData);
      console.log('Product saved:', savedProduct);
      setProducts([savedProduct, ...products]);
      setIsAddDialogOpen(false);
      setNewProduct({
        title: '',
        brand: '',
        category: '',
        price: 0,
        rating: 0,
        stock: 0,
        description: '',
        image: '',
        size: '',
      });
      setImagePreview('');
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      setLoading(true);
      try {
        const updatedProduct = await updateProduct(editingProduct.id.toString(), newProduct);
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ));
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        setNewProduct({
          title: '',
          brand: '',
          category: '',
          price: 0,
          rating: 0,
          stock: 0,
          description: '',
          image: '',
          size: '',
        });
        setImagePreview('');
      } catch (error) {
        console.error('Failed to update product:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="ms-container">
      <div className="ms-header">
        <h2>Manually Added Products</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          {table && (
            <Input
              placeholder="Filter products..."
              value={(getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                getColumn('title')?.setFilterValue?.(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex gap-2">
          {table && dropdownColumns.length > 0 && (
            <TableColumnsDropdown
              columns={dropdownColumns}
              onToggleColumn={handleToggleColumn}
            />
          )}
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedProducts}
        onTableChange={setTable}
        columnHeaders={{
          title: "Product Title",
          brand: "Brand",
          category: "Category",
          price: "Price",
          rating: "Rating",
          stock: "Stock"
        }}
        hiddenColumns={["id"]}
        size="lg"
      />

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <RowsPerPageSelect
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
            className="h-8 w-[70px]"
          />
        </div>
        <DataTablePagination
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => setCurrentPage(page + 1)}
          showPageJump={true}
        />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Product Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="text-sm">{uploading ? 'Uploading...' : 'Browse Image'}</span>
                  </div>
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                )}
              </div>
            </div>
            <div>
              <Label>Size (Optional)</Label>
              <Input
                placeholder="e.g., S, M, L, XL or leave empty"
                value={newProduct.size}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  max="5"
                  value={newProduct.rating}
                  onChange={(e) => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <Button onClick={handleAddProduct} disabled={uploading || loading} className="w-full bg-black hover:bg-gray-800 text-white">
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Product Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label htmlFor="image-upload-edit">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="text-sm">{uploading ? 'Uploading...' : 'Browse Image'}</span>
                  </div>
                </label>
                {(imagePreview || newProduct.image) && (
                  <img src={imagePreview || newProduct.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                )}
              </div>
            </div>
            <div>
              <Label>Size (Optional)</Label>
              <Input
                placeholder="e.g., S, M, L, XL or leave empty"
                value={newProduct.size}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  max="5"
                  value={newProduct.rating}
                  onChange={(e) => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdateProduct} disabled={uploading || loading} className="w-full bg-black hover:bg-gray-800 text-white">
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
