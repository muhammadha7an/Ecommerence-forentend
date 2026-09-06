import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';

export default function CategoryCard({ category }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

  const categoryTarget = category.id || category.legacyId || category.name || category._id;
  const imageSrc = category.image ? getImageUrl(category.image) : defaultImage;

  return (
    <Link to={`/shop?category=${encodeURIComponent(categoryTarget)}`} className="category-card">
      <div className="category-image-wrapper">
        <img src={imageSrc} alt={category.name} loading="lazy" />
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