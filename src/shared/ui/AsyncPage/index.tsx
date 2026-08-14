import { lazy, Suspense, type ComponentType } from 'react';
import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';

const PageFallback = () => (
  <div className={commonStyles.loaderContainer}>
    <VLoader size={28} />
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
