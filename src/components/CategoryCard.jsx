import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  // Default image if category.image is not provided in redux state
  const defaultImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

  return (
    <Link to={`/shop?category=${category.id}`} className="category-card">
      <div className="category-image-wrapper">
        <img src={category.image || defaultImage} alt={category.name} />
        <div className="category-overlay" />
      </div>
      <div className="category-content">
        <h3>{category.name}</h3>
        <span className="category-link">
          Explore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    </Link>
  );
}