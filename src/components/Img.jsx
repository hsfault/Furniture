import { useState } from 'react';

// Plain <img> with the plaster placeholder if the file was never generated.
export default function Img({ src, alt, className = '', imgClassName = '', style, eager = false, children, ...rest }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden ${missing ? 'img-missing' : ''} ${className}`} style={style} {...rest}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setMissing(true)}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
      />
      {missing && <span className="img-missing__label">{alt}</span>}
      {children}
    </div>
  );
}
