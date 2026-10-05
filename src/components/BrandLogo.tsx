import React from 'react';

import brandLogo from '@/assets/Logo.png';
import AppLogo from './AppLogo';

export default function BrandLogo({ size = 48 }: { size?: number }) {
  return <AppLogo name="OTAStore" src={brandLogo} size={size} />;
}