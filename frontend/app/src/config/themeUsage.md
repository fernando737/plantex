# 🎨 Centralized Theme System

## Overview

This application uses a centralized theme system with design tokens for consistent styling across all components. The system is built on Material-UI and provides a single source of truth for colors, typography, spacing, and other design values.

## Architecture

```
config/
├── designTokens.ts    # All design values (colors, spacing, typography, etc.)
├── themeBuilder.ts    # Builds Material-UI theme from design tokens
├── theme.ts          # Re-exports theme for backward compatibility
└── index.ts          # Centralized exports
```

## Key Benefits

### 🎯 **Single Source of Truth**
- All design values are defined in `designTokens.ts`
- Change colors, spacing, or typography in one place
- Automatic propagation across the entire application

### 🔧 **Easy Customization**
- Modify `designTokens.ts` to change the entire app appearance
- Use `createAppTheme()` for dynamic theme creation
- Support for multiple themes (light/dark mode, etc.)

### 📱 **Consistent Design**
- Standardized spacing scale
- Consistent color palette
- Unified typography system
- Reusable component styles

## Usage Examples

### 1. Using Design Tokens in Components

```tsx
import { designTokens } from '@/config';

const MyComponent = () => (
  <Box
    sx={{
      backgroundColor: designTokens.colors.primary[500],
      padding: designTokens.spacing.md,
      borderRadius: designTokens.borderRadius.sm,
      boxShadow: designTokens.shadows.sm,
    }}
  >
    <Typography
      sx={{
        fontSize: designTokens.typography.fontSize.lg,
        fontWeight: designTokens.typography.fontWeight.medium,
        color: designTokens.colors.text.primary,
      }}
    >
      Hello World
    </Typography>
  </Box>
);
```

### 2. Using Theme in Components

```tsx
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      Content
    </Box>
  );
};
```

### 3. Creating Custom Themes

```tsx
import { createAppTheme } from '@/config';

const darkTheme = createAppTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

## Design Token Categories

### 🎨 **Colors**
- **Primary**: Brand colors (50-900 scale)
- **Secondary**: Supporting colors
- **Semantic**: Success, warning, error, info
- **Text**: Primary, secondary, disabled, inverse
- **Background**: Default, paper, dark, overlay
- **Border**: Light, medium, dark
- **Shadow**: Light, medium, dark

### 📏 **Spacing**
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px
- **xxxl**: 64px

### 🔤 **Typography**
- **Font Families**: Primary, mono
- **Font Sizes**: xs to display
- **Font Weights**: Light to bold
- **Line Heights**: Tight to loose

### 🎯 **Border Radius**
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **round**: 50%

### 🌟 **Shadows**
- **xs**: Subtle elevation
- **sm**: Light elevation
- **md**: Medium elevation
- **lg**: High elevation
- **xl**: Maximum elevation

## Best Practices

### ✅ **Do's**
- Use design tokens for all styling values
- Import from `@/config` for consistency
- Use semantic color names (success, error, etc.)
- Follow the spacing scale for margins/padding
- Use theme.spacing() for dynamic spacing

### ❌ **Don'ts**
- Don't hardcode colors or spacing values
- Don't create custom color values outside design tokens
- Don't use arbitrary font sizes or weights
- Don't mix different spacing systems

## Migration Guide

### From Hardcoded Values
```tsx
// ❌ Before
<Box sx={{ padding: '16px', backgroundColor: '#007AFF' }}>

// ✅ After
<Box sx={{
  padding: designTokens.spacing.md,
  backgroundColor: designTokens.colors.primary[500]
}}>
```

### From Theme Only
```tsx
// ❌ Before
<Box sx={{ padding: theme.spacing(2), color: theme.palette.primary.main }}>

// ✅ After (if you need design tokens)
<Box sx={{
  padding: designTokens.spacing.md,
  color: designTokens.colors.primary[500]
}}>
```

## Customization

To change the app's appearance:

1. **Modify `designTokens.ts`** - Update colors, spacing, typography
2. **Update component styles** - Use new token values
3. **Test across components** - Ensure consistency

Example: Change primary color
```ts
// In designTokens.ts
primary: {
  500: '#FF6B35', // New primary color
  // ... other shades
}
```

This will automatically update all components using the primary color!
