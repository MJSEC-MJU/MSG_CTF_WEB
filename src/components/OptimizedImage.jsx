import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import './OptimizedImage.css';

const webpManifest = import.meta.glob('../assets/**/*.{webp,WebP}', {
  eager: true,
  import: 'default',
});

const rasterManifest = import.meta.glob('../assets/**/*.{png,jpg,jpeg,gif,svg,PNG,JPG,JPEG,GIF,SVG}', {
  eager: true,
  import: 'default',
});

const rasterLookup = new Map(
  Object.entries(rasterManifest).map(([key, value]) => [value, key]),
);

const OptimizedImage = ({
  src,
  alt,
  webpSrc: webpOverride,
  className = '',
  width,
  height,
  style,
  onLoad,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  const { fallbackSrc, webpSrc } = useMemo(() => {
    if (!src) return { fallbackSrc: '', webpSrc: '' };

    if (webpOverride) {
      return { fallbackSrc: src, webpSrc: webpOverride };
    }

    const hasExtension = src.lastIndexOf('.') > src.lastIndexOf('/');
    const extension = hasExtension ? src.substring(src.lastIndexOf('.')) : '';
    const fallback = src;

    if (extension.toLowerCase() === '.svg') {
      return { fallbackSrc: fallback, webpSrc: '' };
    }

    let normalizedKey = '';

    const manifestMatchKey =
      rasterLookup.get(fallback) ||
      (fallback.startsWith('/') ? rasterLookup.get(fallback.slice(1)) : undefined);

    if (manifestMatchKey) {
      normalizedKey = manifestMatchKey;
    } else if (fallback.startsWith('/src/')) {
      normalizedKey = fallback.replace('/src/', '../');
    } else if (fallback.startsWith('src/')) {
      normalizedKey = fallback.replace('src/', '../');
    } else if (fallback.startsWith('../assets/')) {
      normalizedKey = fallback;
    } else if (fallback.startsWith('/assets/')) {
      normalizedKey = `..${fallback}`;
    } else if (fallback.startsWith('assets/')) {
      normalizedKey = `../${fallback}`;
    }

    const manifestKey =
      normalizedKey && hasExtension
        ? normalizedKey.substring(0, normalizedKey.lastIndexOf('.')) + '.webp'
        : '';

    const manifestEntry =
      manifestKey && Object.prototype.hasOwnProperty.call(webpManifest, manifestKey)
        ? webpManifest[manifestKey]
        : '';

    return {
      fallbackSrc: fallback,
      webpSrc: typeof manifestEntry === 'string' ? manifestEntry : '',
    };
  }, [src, webpOverride]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [fallbackSrc, webpSrc]);

  const numericWidthFromString =
    typeof width === 'string' && /^\d+(\.\d+)?$/.test(width.trim())
      ? Number(width)
      : undefined;
  const numericHeightFromString =
    typeof height === 'string' && /^\d+(\.\d+)?$/.test(height.trim())
      ? Number(height)
      : undefined;

  const sanitizedWidth =
    typeof width === 'number' ? width : numericWidthFromString;
  const sanitizedHeight =
    typeof height === 'number' ? height : numericHeightFromString;

  const inlineStyle = {
    ...style,
  };

  if (typeof width === 'string' && numericWidthFromString === undefined) {
    inlineStyle.width = width;
  }

  if (typeof height === 'string' && numericHeightFromString === undefined) {
    inlineStyle.height = height;
  }

  const combinedClassName = [className, isLoaded ? 'loaded' : 'loading']
    .filter(Boolean)
    .join(' ');

  const handleLoad = useCallback(
    (event) => {
      setIsLoaded(true);
      if (typeof onLoad === 'function') {
        onLoad(event);
      }
    },
    [onLoad],
  );

  return (
    <picture>
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img
        ref={imgRef}
        src={fallbackSrc}
        alt={alt}
        className={combinedClassName}
        loading="lazy"
        width={sanitizedWidth}
        height={sanitizedHeight}
        style={inlineStyle}
        onLoad={handleLoad}
        {...restProps}
      />
    </picture>
  );
};

export default OptimizedImage;
