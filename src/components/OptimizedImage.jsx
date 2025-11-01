import { useState, useCallback, useEffect, useRef } from 'react';
import './OptimizedImage.css';

// 지연 로딩으로 변경 - 실제 사용될 때만 로드
const webpManifest = import.meta.glob('../assets/**/*.{webp,WebP}', {
  eager: false, // 지연 로딩
  import: 'default',
});

const rasterManifest = import.meta.glob('../assets/**/*.{png,jpg,jpeg,gif,svg,PNG,JPG,JPEG,GIF,SVG}', {
  eager: false, // 지연 로딩
  import: 'default',
});

// 이미 로드된 이미지 캐시
const loadedImages = new Map();
const pendingLoads = new Map();

// 동적 이미지 로드 헬퍼
const loadImage = async (key, manifest) => {
  // 이미 로드된 경우 캐시에서 반환
  if (loadedImages.has(key)) {
    return loadedImages.get(key);
  }

  // 로딩 중인 경우 동일한 Promise 반환 (중복 요청 방지)
  if (pendingLoads.has(key)) {
    return pendingLoads.get(key);
  }

  // manifest에 없는 경우 빈 문자열 반환
  if (!manifest[key]) {
    return '';
  }

  // 새로운 로드 시작
  const loadPromise = manifest[key]().then((module) => {
    const url = module || '';
    loadedImages.set(key, url);
    pendingLoads.delete(key);
    return url;
  }).catch((err) => {
    console.warn(`Failed to load image: ${key}`, err);
    pendingLoads.delete(key);
    return '';
  });

  pendingLoads.set(key, loadPromise);
  return loadPromise;
};

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
  const [resolvedSrcs, setResolvedSrcs] = useState({ fallbackSrc: '', webpSrc: '' });
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setResolvedSrcs({ fallbackSrc: '', webpSrc: '' });
      return;
    }

    let isMounted = true;

    (async () => {
      if (webpOverride) {
        if (isMounted) {
          setResolvedSrcs({ fallbackSrc: src, webpSrc: webpOverride });
        }
        return;
      }

      const hasExtension = src.lastIndexOf('.') > src.lastIndexOf('/');
      const extension = hasExtension ? src.substring(src.lastIndexOf('.')) : '';
      const fallback = src;

      // SVG는 WebP 변환 없이 그대로 사용
      if (extension.toLowerCase() === '.svg') {
        if (isMounted) {
          setResolvedSrcs({ fallbackSrc: fallback, webpSrc: '' });
        }
        return;
      }

      // 경로 정규화
      let normalizedKey = '';
      if (fallback.startsWith('/src/')) {
        normalizedKey = fallback.replace('/src/', '../');
      } else if (fallback.startsWith('src/')) {
        normalizedKey = fallback.replace('src/', '../');
      } else if (fallback.startsWith('../assets/')) {
        normalizedKey = fallback;
      } else if (fallback.startsWith('/assets/')) {
        normalizedKey = `..${fallback}`;
      } else if (fallback.startsWith('assets/')) {
        normalizedKey = `../${fallback}`;
      } else {
        // 매니페스트 키 직접 탐색
        normalizedKey = fallback;
      }

      // WebP 경로 생성
      const webpKey = normalizedKey && hasExtension
        ? normalizedKey.substring(0, normalizedKey.lastIndexOf('.')) + '.webp'
        : '';

      // WebP 이미지 동적 로드
      let webpUrl = '';
      if (webpKey && webpManifest[webpKey]) {
        webpUrl = await loadImage(webpKey, webpManifest);
      }

      if (isMounted) {
        setResolvedSrcs({
          fallbackSrc: fallback,
          webpSrc: webpUrl,
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [src, webpOverride]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [resolvedSrcs.fallbackSrc, resolvedSrcs.webpSrc]);

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
      {resolvedSrcs.webpSrc ? <source srcSet={resolvedSrcs.webpSrc} type="image/webp" /> : null}
      <img
        ref={imgRef}
        src={resolvedSrcs.fallbackSrc}
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
