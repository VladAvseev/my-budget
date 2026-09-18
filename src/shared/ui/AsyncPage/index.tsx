import { lazy, Suspense, type ComponentType } from 'react';
import commonStyles from '@/shared/styles/common.module.css';
import { VBrandLoader } from '@/shared/ui/VLoader';

const PageFallback = () => (
  <div className={commonStyles.loaderContainer}>
    <VBrandLoader size={64} />
  </div>
);

export const AsyncPage = (loader: () => Promise<{ Page: ComponentType }>) => {
  const Page = lazy(() => loader().then((module) => ({ default: module.Page })));

  const AsyncPageComponent = () => (
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
  );
  AsyncPageComponent.displayName = 'AsyncPage';

  return AsyncPageComponent;
};
