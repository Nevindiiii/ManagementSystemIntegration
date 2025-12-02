import { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit, Trash2, X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/apis/product';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';


function ManualProductActionsCell({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
}) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(product)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl p-0 bg-white">
          <Button
            onClick={() => setShowDialog(false)}
            className="absolute right-4 top-4 z-50 h-8 w-8 p-0 bg-gray-800 hover:bg-gray-900 text-white rounded-sm"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-2 gap-0">
            <div className="bg-gray-100 p-8 flex items-center justify-center">
              <div className="text-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-64 h-80 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-64 h-80 bg-white rounded-lg shadow-sm flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                  <span className="text-6xl text-gray-300">📦</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-normal text-gray-800 mb-2">{product.title}</h2>
                <p className="text-3xl font-bold text-gray-900">${product.price}</p>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Brand</label>
                  <p className="text-sm text-gray-800">{product.brand}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Category</label>
                  <p className="text-sm text-gray-800">{product.category}</p>
                </div>

                {product.size && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Size</label>
                    <p className="text-sm text-gray-800 font-medium">{product.size}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">1</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-black hover:bg-gray-800 text-white font-medium">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to cart
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-2">
                <p>Rating: {product.rating}/5 ⭐</p>
                <p>Stock: {product.stock} units available</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const createManualProductColumns = (
  onEdit: (product: Product) => void,
  onDelete: (id: number | string) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Product Name',
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `$${row.original.price}`,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => `${row.original.rating}/5`,
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ManualProductActionsCell 
        product={row.original} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
