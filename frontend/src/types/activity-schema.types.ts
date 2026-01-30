/**
 * Types of parameters supported in activity schemas
 * (Mirrors backend types)
 */
export type ParameterType = 'string' | 'number' | 'boolean' | 'enum' | 'object';

/**
 * Base parameter definition
 */
interface BaseParameter {
  name: string;
  label: string;
  type: ParameterType;
  required?: boolean;
  helpText?: string;
  default?: any;
}

/**
 * String parameter
 */
export interface StringParameter extends BaseParameter {
  type: 'string';
  placeholder?: string;
  multiline?: boolean;
}

/**
 * Number parameter
 */
export interface NumberParameter extends BaseParameter {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Boolean parameter
 */
export interface BooleanParameter extends BaseParameter {
  type: 'boolean';
}

/**
 * Enum parameter (dropdown)
 */
export interface EnumParameter extends BaseParameter {
  type: 'enum';
  options: string[] | { value: string; label: string }[];
}

/**
 * Object parameter (JSON)
 */
export interface ObjectParameter extends BaseParameter {
  type: 'object';
}

/**
 * Union of all parameter types
 */
export type Parameter = 
  | StringParameter 
  | NumberParameter 
  | BooleanParameter 
  | EnumParameter 
  | ObjectParameter;

/**
 * Complete schema for an activity
 */
export interface ActivitySchema {
  name: string;
  label: string;
  description?: string;
  category?: string;
  parameters: Parameter[];
}
