
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormField {
  name: string;
  type: "text" | "number" | "boolean" | "select";
  label?: string;
  description?: string;
  required?: boolean;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  };
  ui?: {
    widget?: "input" | "textarea" | "slider" | "switch" | "select";
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  };
}

interface FormGeneratorProps {
  schema: FormField[];
  onChange: (data: any) => void;
  data?: any;
}

const FormGenerator = ({ schema, onChange, data = {} }: FormGeneratorProps) => {
  // Build Zod schema dynamically
  const buildZodSchema = (fields: FormField[]) => {
    const schemaObject: Record<string, any> = {};
    
    fields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case "text":
          fieldSchema = z.string();
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
          }
          break;
        case "number":
          fieldSchema = z.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max);
          }
          break;
        case "boolean":
          fieldSchema = z.boolean();
          break;
        case "select":
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaObject[field.name] = fieldSchema;
    });
    
    return z.object(schemaObject);
  };

  const zodSchema = buildZodSchema(schema);
  
  // Build default values
  const defaultValues = schema.reduce((acc, field) => {
    acc[field.name] = data[field.name] || field.default || (field.type === "boolean" ? false : field.type === "number" ? 0 : "");
    return acc;
  }, {} as Record<string, any>);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onChange"
  });

  const watchedValues = form.watch();

  useEffect(() => {
    onChange(watchedValues);
  }, [watchedValues, onChange]);

  // Reset form when data prop changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      form.reset({ ...defaultValues, ...data });
    }
  }, [data]);

  const renderField = (field: FormField) => {
    const widget = field.ui?.widget || (field.type === "text" ? "input" : field.type === "number" ? "input" : "input");
    
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {(() => {
                switch (widget) {
                  case "textarea":
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.ui?.placeholder}
                        rows={field.ui?.rows || 4}
                      />
                    );
                  
                  case "slider":
                    return (
                      <div className="space-y-3">
                        <Slider
                          value={[formField.value || field.default || 0]}
                          onValueChange={(value) => formField.onChange(value[0])}
                          min={field.validation?.min || 0}
                          max={field.validation?.max || 100}
                          step={field.validation?.step || 1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{field.validation?.min || 0}</span>
                          <span className="font-medium">
                            Current: {formField.value || field.default || 0}
                          </span>
                          <span>{field.validation?.max || 100}</span>
                        </div>
                      </div>
                    );
                  
                  case "switch":
                    return (
                      <Switch
                        checked={formField.value || false}
                        onCheckedChange={formField.onChange}
                      />
                    );
                  
                  case "select":
                    return (
                      <Select
                        value={formField.value}
                        onValueChange={formField.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.ui?.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.ui?.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  
                  default:
                    return (
                      <Input
                        {...formField}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.ui?.placeholder}
                        value={formField.value || ""}
                        onChange={(e) => {
                          const value = field.type === "number" 
                            ? parseFloat(e.target.value) || 0
                            : e.target.value;
                          formField.onChange(value);
                        }}
                      />
                    );
                }
              })()}
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {schema.map(renderField)}
      </form>
    </Form>
  );
};

export default FormGenerator;
