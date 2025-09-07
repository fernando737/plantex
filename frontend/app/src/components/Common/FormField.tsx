import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormLabel,
  Chip,
  Box,
  useTheme,
} from '@mui/material';
import { designTokens } from '@/config';

interface FormFieldProps {
  // Basic props
  name: string;
  label?: string;
  value?: string | number | boolean | string[];
  onChange?: (value: any) => void;
  onBlur?: () => void;

  // Field type and configuration
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'date'
    | 'datetime-local'
    | 'time'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'switch'
    | 'radio'
    | 'file';

  // Validation and error handling
  error?: boolean;
  helperText?: string;
  required?: boolean;

  // Field options
  options?: { value: string | number; label: string; disabled?: boolean }[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;

  // Layout and styling
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  minRows?: number;

  // Input props
  inputProps?: Record<string, any>;
  InputProps?: Record<string, any>;
  InputLabelProps?: Record<string, any>;

  // Custom styling
  sx?: any;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  error = false,
  helperText,
  required = false,
  options = [],
  placeholder,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  size = 'medium',
  multiline = false,
  rows = 3,
  maxRows,
  minRows,
  inputProps = {},
  InputProps = {},
  InputLabelProps = {},
  sx = {},
  className,
}) => {
  const theme = useTheme();

  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string | number>) => {
    handleChange(event.target.value);
  };

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.checked);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.checked);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  };

  const commonTextFieldProps = {
    name,
    label,
    value: value || '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(event.target.value),
    onBlur,
    error,
    helperText,
    required,
    disabled,
    fullWidth,
    size,
    placeholder,
    inputProps: {
      readOnly,
      ...inputProps,
    },
    InputProps,
    InputLabelProps: {
      shrink:
        type === 'date' ||
        type === 'datetime-local' ||
        type === 'time' ||
        !!value,
      ...InputLabelProps,
    },
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: designTokens.borderRadius.sm,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: designTokens.colors.border.medium,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: designTokens.colors.primary[500],
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: designTokens.colors.error.main,
        },
      },
      '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
        '&.Mui-focused': {
          color: designTokens.colors.primary[500],
        },
        '&.Mui-error': {
          color: designTokens.colors.error.main,
        },
      },
      ...sx,
    },
    className,
  };

  // Text-based fields
  if (
    [
      'text',
      'email',
      'password',
      'number',
      'tel',
      'url',
      'date',
      'datetime-local',
      'time',
    ].includes(type)
  ) {
    return (
      <TextField
        {...commonTextFieldProps}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        maxRows={maxRows}
        minRows={minRows}
        inputProps={{
          ...commonTextFieldProps.inputProps,
          ...(type === 'number' && {
            'aria-invalid': error,
            'data-lpignore': 'true',
          }),
        }}
        InputProps={{
          ...commonTextFieldProps.InputProps,
          ...(type === 'number' && {
            inputProps: {
              ...commonTextFieldProps.inputProps,
              'aria-invalid': error,
              'data-lpignore': 'true',
            },
          }),
        }}
      />
    );
  }

  // Textarea
  if (type === 'textarea') {
    return (
      <TextField
        {...commonTextFieldProps}
        multiline
        rows={rows}
        maxRows={maxRows}
        minRows={minRows}
      />
    );
  }

  // Select (single)
  if (type === 'select') {
    return (
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        size={size}
        sx={sx}
        className={className}
      >
        <InputLabel>{required ? `${label} *` : label}</InputLabel>
        <Select
          name={name}
          value={String(value || '')}
          onChange={handleSelectChange}
          onBlur={onBlur}
          label={required ? `${label} *` : label}
          required={required}
          inputProps={{ readOnly }}
          sx={{
            borderRadius: designTokens.borderRadius.sm,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.border.light,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.border.medium,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.primary[500],
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.error.main,
            },
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  // Multi-select
  if (type === 'multiselect') {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        size={size}
        sx={sx}
        className={className}
      >
        <InputLabel>{required ? `${label} *` : label}</InputLabel>
        <Select
          name={name}
          multiple
          value={selectedValues}
          onChange={handleMultiSelectChange}
          onBlur={onBlur}
          label={required ? `${label} *` : label}
          required={required}
          inputProps={{ readOnly }}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => {
                const option = options.find(opt => opt.value === value);
                return (
                  <Chip
                    key={value}
                    label={option?.label || value}
                    size="small"
                    sx={{
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSize.xs,
                    }}
                  />
                );
              })}
            </Box>
          )}
          sx={{
            borderRadius: designTokens.borderRadius.sm,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.border.light,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.border.medium,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.primary[500],
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.error.main,
            },
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  // Checkbox
  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={Boolean(value)}
            onChange={handleCheckboxChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            sx={{
              color: designTokens.colors.primary[500],
              '&.Mui-checked': {
                color: designTokens.colors.primary[500],
              },
            }}
          />
        }
        label={label}
        sx={{
          ...sx,
          '& .MuiFormControlLabel-label': {
            fontSize: designTokens.typography.fontSize.md,
            color: theme.palette.text.primary,
          },
        }}
        className={className}
      />
    );
  }

  // Switch
  if (type === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={Boolean(value)}
            onChange={handleSwitchChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: designTokens.colors.primary[500],
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: designTokens.colors.primary[500],
              },
            }}
          />
        }
        label={label}
        sx={{
          ...sx,
          '& .MuiFormControlLabel-label': {
            fontSize: designTokens.typography.fontSize.md,
            color: theme.palette.text.primary,
          },
        }}
        className={className}
      />
    );
  }

  // Radio group
  if (type === 'radio') {
    return (
      <FormControl
        component="fieldset"
        error={error}
        disabled={disabled}
        sx={sx}
        className={className}
      >
        <FormLabel
          component="legend"
          sx={{ color: theme.palette.text.primary }}
        >
          {label}
        </FormLabel>
        <RadioGroup
          name={name}
          value={value || ''}
          onChange={handleRadioChange}
          onBlur={onBlur}
          row
        >
          {options.map(option => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  disabled={option.disabled}
                  sx={{
                    color: designTokens.colors.primary[500],
                    '&.Mui-checked': {
                      color: designTokens.colors.primary[500],
                    },
                  }}
                />
              }
              label={option.label}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: designTokens.typography.fontSize.md,
                },
              }}
            />
          ))}
        </RadioGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  // File input
  if (type === 'file') {
    return (
      <TextField
        {...commonTextFieldProps}
        type="file"
        InputProps={{
          ...InputProps,
          inputProps: {
            ...inputProps,
            accept: inputProps.accept || '*/*',
          },
        }}
      />
    );
  }

  // Default to text field
  return <TextField {...commonTextFieldProps} type="text" />;
};

export default FormField;
