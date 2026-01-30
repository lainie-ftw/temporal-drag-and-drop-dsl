import React from 'react';
import type { Parameter, StringParameter, NumberParameter, BooleanParameter, EnumParameter, ObjectParameter } from '../types/activity-schema.types';

interface DynamicFormFieldProps {
  parameter: Parameter;
  value: any;
  onChange: (value: any) => void;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({ parameter, value, onChange }) => {
  switch (parameter.type) {
    case 'string':
      return <StringField parameter={parameter} value={value} onChange={onChange} />;
    case 'number':
      return <NumberField parameter={parameter} value={value} onChange={onChange} />;
    case 'boolean':
      return <BooleanField parameter={parameter} value={value} onChange={onChange} />;
    case 'enum':
      return <EnumField parameter={parameter} value={value} onChange={onChange} />;
    case 'object':
      return <ObjectField parameter={parameter} value={value} onChange={onChange} />;
    default:
      return null;
  }
};

interface FieldProps<T extends Parameter> {
  parameter: T;
  value: any;
  onChange: (value: any) => void;
}

const StringField: React.FC<FieldProps<StringParameter>> = ({ parameter, value, onChange }) => {
  const currentValue = value !== undefined && value !== null ? String(value) : (parameter.default || '');

  if (parameter.multiline) {
    return (
      <textarea
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={parameter.placeholder}
        required={parameter.required}
        style={{
          width: '100%',
          padding: 'var(--space-3)',
          border: '1px solid var(--secondary-300)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-mono)',
          minHeight: '80px',
          resize: 'vertical',
          lineHeight: 1.5,
          transition: 'all var(--transition-fast)',
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={parameter.placeholder}
      required={parameter.required}
      style={{
        width: '100%',
        padding: 'var(--space-2) var(--space-3)',
        border: '1px solid var(--secondary-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        transition: 'all var(--transition-fast)',
      }}
    />
  );
};

const NumberField: React.FC<FieldProps<NumberParameter>> = ({ parameter, value, onChange }) => {
  const currentValue = value !== undefined && value !== null ? Number(value) : (parameter.default || '');

  return (
    <input
      type="number"
      value={currentValue}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      min={parameter.min}
      max={parameter.max}
      step={parameter.step}
      required={parameter.required}
      style={{
        width: '100%',
        padding: 'var(--space-2) var(--space-3)',
        border: '1px solid var(--secondary-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        transition: 'all var(--transition-fast)',
      }}
    />
  );
};

const BooleanField: React.FC<FieldProps<BooleanParameter>> = ({ parameter, value, onChange }) => {
  const currentValue = value !== undefined && value !== null ? Boolean(value) : (parameter.default || false);

  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: 'pointer',
      padding: 'var(--space-3)',
      background: 'var(--secondary-50)',
      border: '1px solid var(--secondary-200)',
      borderRadius: 'var(--radius-md)',
      transition: 'all var(--transition-fast)',
    }}>
      <input
        type="checkbox"
        checked={currentValue}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '18px',
          height: '18px',
          cursor: 'pointer',
        }}
      />
      <span style={{
        fontSize: '0.875rem',
        color: 'var(--secondary-700)',
      }}>
        {currentValue ? 'Enabled' : 'Disabled'}
      </span>
    </label>
  );
};

const EnumField: React.FC<FieldProps<EnumParameter>> = ({ parameter, value, onChange }) => {
  const currentValue = value !== undefined && value !== null ? String(value) : (parameter.default || '');

  const options = Array.isArray(parameter.options) 
    ? parameter.options.map(opt => 
        typeof opt === 'string' ? { value: opt, label: opt } : opt
      )
    : [];

  return (
    <select
      value={currentValue}
      onChange={(e) => onChange(e.target.value)}
      required={parameter.required}
      style={{
        width: '100%',
        padding: 'var(--space-2) var(--space-3)',
        border: '1px solid var(--secondary-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        background: 'white',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      <option value="">Select an option...</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const ObjectField: React.FC<FieldProps<ObjectParameter>> = ({ parameter, value, onChange }) => {
  const currentValue = value !== undefined && value !== null 
    ? (typeof value === 'string' ? value : JSON.stringify(value, null, 2))
    : (parameter.default ? JSON.stringify(parameter.default, null, 2) : '{}');

  return (
    <textarea
      value={currentValue}
      onChange={(e) => {
        try {
          const parsed = JSON.parse(e.target.value);
          onChange(parsed);
        } catch (err) {
          // Keep the text value while user is typing
          onChange(e.target.value);
        }
      }}
      placeholder='{"key": "value"}'
      required={parameter.required}
      style={{
        width: '100%',
        padding: 'var(--space-3)',
        border: '1px solid var(--secondary-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-mono)',
        minHeight: '100px',
        resize: 'vertical',
        lineHeight: 1.5,
        background: 'var(--secondary-50)',
        transition: 'all var(--transition-fast)',
      }}
    />
  );
};
