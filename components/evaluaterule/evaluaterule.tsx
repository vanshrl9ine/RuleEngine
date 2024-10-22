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

// Define the form schema with Zod for attribute inputs and AST
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

  // State to hold evaluation result
  const [result, setResult] = useState<string | null>(null);

  // Handle form submission to evaluate rules
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { age, department, salary, experience, ast } = values;

    // Prepare user attributes object
    const userAttributes = {
      age: age ?? null, // Use null if age is undefined
      department: department || null,
      salary: salary ?? null, // Use null if salary is undefined
      experience: experience ?? null, // Use null if experience is undefined
    };

    console.log("User Attributes:", userAttributes);

    // Evaluate the rule against the provided AST
    try {
      const parsedAst = JSON.parse(ast); // Parse AST JSON
      const isEligible = evaluateRuleFunction(parsedAst, userAttributes);
      setResult(`User is eligible: ${isEligible}`);
    } catch (error) {
      setResult('Error parsing AST. Please ensure it is valid JSON.');
    }
  }

  // Function to evaluate the rule against user attributes (implement your logic)
  const evaluateRuleFunction = (ast: any, userAttributes: any): boolean => {
    // Your evaluation logic here (similar to the one you've implemented earlier)
    return true; // Placeholder return value
  };

  return (
    <div className="h-screen flex items-center justify-center">
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

              {/* AST Input */}
              <FormField
                control={form.control}
                name="ast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AST (JSON)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='{"type": "operator", "value": "AND", ...}' 
                        value={field.value} // Keep the value as string
                        onChange={field.onChange}
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

          {/* Display Evaluation Result */}
          {result && (
            <div className="mt-4 p-4 bg-gray-200 rounded-md">
              <h3 className="text-lg font-semibold">Result:</h3>
              <p>{result}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EvaluateRuleForm;
