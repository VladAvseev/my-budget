import { ColorPalette } from '@/shared/ui/ColorPalette';

interface CategoryColorPaletteProps {
  value?: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
}

// Обёртка над общей палитрой, чтобы правки палитры делались в одном месте.
export const CategoryColorPalette = (props: CategoryColorPaletteProps) => {
  return <ColorPalette {...props} />;
};
