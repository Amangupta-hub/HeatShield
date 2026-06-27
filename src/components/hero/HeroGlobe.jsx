import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroGlobe() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="w-full h-full" />}>
        <Spline
          scene="https://prod.spline.design/NCVeoBTMVw2NbIUF/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}