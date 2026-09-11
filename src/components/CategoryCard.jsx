import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import Icon from './Icon.jsx';
import '../style/components/category-card.css';

export default function CategoryCard({ category }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

  const categoryTarget = category.id || category.legacyId || category.name || category._id;
  const imageSrc = category.image ? getImageUrl(category.image) : defaultImage;
  const count = Number(category.productCount);

  return (
    <Link to={`/shop?category=${encodeURIComponent(categoryTarget)}`} className="category-card">
      <div className="category-card__media">
        <img src={imageSrc} alt="" loading="lazy" />
      </div>
      <div className="category-card__body">
        <div>
          <h3 className="category-card__name">{category.name}</h3>
          {Number.isFinite(count) && count > 0 && (
            <span className="category-card__count">
              {count} {count === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>
        <span className="category-card__arrow" aria-hidden="true">
          <Icon name="arrowRight" />
        </span>
      </div>
    </Link>
  );
}
