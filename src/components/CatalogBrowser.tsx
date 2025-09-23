import React, { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { Check, Filter } from 'lucide-react';

// Mock product data
const mockProducts: Product[] = [
  {
    id: 'roller-1',
    name: 'Classic Roller Blind',
    category: 'roller',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGRkZGRkIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0cHgiPlJvbGxlcjwvdGV4dD48L3N2Zz4=',
    texture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icm9sbGVyIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNSIgaGVpZ2h0PSI1Ij48cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZjBmMGYwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNyb2xsZXIpIi8+PC9zdmc+',
    price: 89,
    description: 'Clean, modern roller blind perfect for any room',
  },
  {
    id: 'venetian-1',
    name: 'Wooden Venetian Blind',
    category: 'venetian',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjxnIGZpbGw9IiNkMmI0OGMiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIiIHk9IjIwIi8+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMiIgeT0iMzYiLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyIiB5PSI1MiIvPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIiIHk9IjY4Ii8+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMiIgeT0iODQiLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyIiB5PSIxMDAiLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyIiB5PSIxMTYiLz48L2c+PC9zdmc+',
    texture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0idmVuZXRpYW4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI1MDAiIGhlaWdodD0iMTYiPjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMTIiIGZpbGw9IiNkMmI0OGMiLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQiIHk9IjEyIiBmaWxsPSIjYjE5NzZiIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCN2ZW5ldGlhbikiLz48L3N2Zz4=',
    price: 149,
    description: 'Elegant wooden slats with adjustable light control',
  },
  {
    id: 'curtain-1',
    name: 'Luxury Fabric Curtain',
    category: 'curtain',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjxwYXRoIGQ9Ik0wIDAgQzMwIDIwIDQwIDMwIDYwIDQwIEMxMDAgNjAgMTIwIDgwIDE2MCA5MCBDMTU4IDEwNSAxNTUgMTIwIDE1MiAxNTAgTDAgMTUwIFoiIGZpbGw9IiM2YjcyODAiLz48cGF0aCBkPSJNMjAwIDAgQzE3MCAyMCAxNjAgMzAgMTQwIDQwIEMxMDAgNjAgODAgODAgNDAgOTAgQzQyIDEwNSA0NSAxMjAgNDggMTUwIEwyMDAgMTUwIFoiIGZpbGw9IiM2YjcyODAiLz48L3N2Zz4=',
    texture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybieBpZD0iY3VydGFpbiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM2YjcyODAiLz48cGF0aCBkPSJNMCAwIDUgNSAxMCAwIiBzdHJva2U9IiM1NTYwNmYiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2N1cnRhaW4pIi8+PC9zdmc+',
    price: 199,
    description: 'Premium fabric curtains with elegant draping',
  },
  {
    id: 'roller-2',
    name: 'Blackout Roller Blind',
    category: 'roller',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTJweCc+QmxhY2tvdXQ8L3RleHQ+PC9zdmc+',
    texture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==',
    price: 119,
    description: 'Complete light blocking for bedroom privacy',
  },
  {
    id: 'shutter-1',
    name: 'Plantation Shutters',
    category: 'shutter',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjIiLz48ZyBmaWxsPSIjZjlmOWY5IiBzdHJva2U9IiNkZGRkZGQiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAiIHk9IjIwIiByeD0iMTAiLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwIiB5PSI0NSIgcng9IjEwIi8+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMCIgeT0iNzAiIHJ4PSIxMCIvPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAiIHk9Ijk1IiByeD0iMTAiLz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwIiB5PSIxMjAiIHJ4PSIxMCIvPjwvZz48L3N2Zz4=',
    texture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic2h1dHRlciIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyNSI+PGVsbGlwc2UgY3g9IjI1MCIgY3k9IjEyLjUiIHJ4PSIyNDAiIHJ5PSIxMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZGRkZGRkIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNzaHV0dGVyKSIvPjwvc3ZnPg==',
    price: 349,
    description: 'Classic plantation shutters with adjustable louvers',
  },
];

export function CatalogBrowser() {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'roller', name: 'Roller Blinds' },
    { id: 'venetian', name: 'Venetian Blinds' },
    { id: 'curtain', name: 'Curtains' },
    { id: 'shutter', name: 'Shutters' },
  ];

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(mockProducts);
    } else {
      setFilteredProducts(mockProducts.filter(p => p.category === category));
    }
  };

  const handleSelectProduct = (product: Product) => {
    dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
    dispatch({ type: 'SET_STEP', payload: 'preview' });
  };

  return (
    <div className="flex-1 bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Design
          </h2>
          <p className="text-muted-foreground">
            Browse and apply different blind styles to see how they look in your window
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => handleCategoryFilter(category.id)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="card-premium p-4 interactive"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-foreground">
                    {product.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize"
                  >
                    {product.category}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-lg font-bold text-accent">
                      ${product.price}
                    </span>
                  )}
                  
                  <Button
                    size="sm"
                    className="btn-accent gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProduct(product);
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
            <Button
              variant="outline"
              onClick={() => handleCategoryFilter('all')}
              className="mt-4"
            >
              View All Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}