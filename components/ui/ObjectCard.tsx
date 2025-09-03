"use client";

import React from 'react';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
}

interface ObjectCardProps {
  product: Product;
  isSelected: boolean;
  onClick?: () => void;
}

const ObjectCard: React.FC<ObjectCardProps> = ({ product, isSelected, onClick }) => {
  const cardClasses = `
    bg-[var(--md-sys-color-surface-container)] rounded-xl border-2 transition-all duration-300 overflow-hidden
    ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''}
    ${isSelected ? 'border-[var(--md-sys-color-primary)] shadow-lg scale-[1.02]' : 'border-[var(--md-sys-color-outline-variant)]'}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="aspect-square w-full bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-center">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="p-3 text-center">
        <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">{product.name}</h4>
      </div>
    </div>
  );
};

export default ObjectCard;