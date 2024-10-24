"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to evaluate the rule against user attributes
const evaluateRuleFunction = (ast: any, userAttributes: any): boolean => {
  switch (ast.type) {
    case "operator":
      return evaluateOperator(ast, userAttributes);
    case "condition":
      return evaluateCondition(ast, userAttributes);
    default:
      throw new Error(`Unknown AST type: ${ast.type}`);
  }
};

// Function to evaluate operators (AND, OR)
const evaluateOperator = (ast: any, userAttributes: any): boolean => {
  const { value, left, right } = ast;

  if (value === "AND") {
    return evaluateRuleFunction(left, userAttributes) && evaluateRuleFunction(right, userAttributes);
  } else if (value === "OR") {
    return evaluateRuleFunction(left, userAttributes) || evaluateRuleFunction(right, userAttributes);
  } else {
    throw new Error(`Unknown operator: ${value}`);
  }
};

// Function to evaluate individual conditions
const evaluateCondition = (condition: any, userAttributes: any): boolean => {
  const { field, operator, value } = condition;
  const userValue = userAttributes[field];

  switch (operator) {
    case ">":
      return userValue > value;
    case "<":
      return userValue < value;
    case ">=":
      return userValue >= value;
    case "<=":
      return userValue <= value;
    case "=":
      return userValue === value;
    case "!=":
      return userValue !== value;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
};

const formSchema = z.object({
  age: z.number().nullable().optional(), // Nullable number for age
  department: z.string().nullable().optional(), // Nullable string for department
  salary: z.number().nullable().optional(), // Nullable number for salary
  experience: z.number().nullable().optional(), // Nullable number for experience
  ast: z.string().min(1, { message: "AST is required" }), // AST input
});

const EvaluateRuleForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: null,
      department: null,
      salary: null,
      experience: null,
      ast: "",
    },
  });

  // Handle form submission to evaluate rules
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { age, department, salary, experience, ast } = values;

    // Prepare user attributes object
    const userAttributes = {
      age: age ?? null,
      department: department || null,
      salary: salary ?? null,
      experience: experience ?? null,
    };

    console.log("User Attributes:", userAttributes);

    // Evaluate the rule against the provided AST
    try {
      const parsedAst = JSON.parse(ast); // Parse AST JSON
      const isEligible = evaluateRuleFunction(parsedAst, userAttributes);
      toast.success(`User is eligible: ${isEligible}`); // Show toast message
    } catch (error) {
      toast.error("Error parsing AST. Please ensure it is valid JSON."); // Show error toast
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <ToastContainer /> {/* Toast container for displaying messages */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Evaluate Rule</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>Evaluate Rule</SheetTitle>
          </SheetHeader>

          {/* Form for Attribute Input and AST */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Age Input */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter age"
                        value={field.value ?? ""} // Use empty string if value is null
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} // Handle change
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department Input */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter department"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Input */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter salary"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Input */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter experience"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AST Input (Using Textarea) */}
              <FormField
                control={form.control}
                name="ast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AST (JSON)</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder='{"type": "operator", "value": "AND", ...}' 
                        value={field.value} // Keep the value as string
                        onChange={field.onChange}
                        className="resize-none border rounded-md p-2 w-full h-40 overflow-y-auto" // Style for textarea
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit">Evaluate</Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EvaluateRuleForm;
