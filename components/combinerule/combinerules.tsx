"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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

// Define the form schema with Zod for combining rules (array of rule strings)
const formSchema = z.object({
  rules: z.array(z.string().min(1, { message: "Rule is required" })), // Array of rule strings
});

// Define the type for the form data based on the schema
type FormData = z.infer<typeof formSchema>;

const CombineRuleForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rules: [""], // Initialize with one empty rule
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules", // Name of the field array
  });

  // State to hold generated rule and AST response
  const [ast, setAst] = useState<object | null>(null); // To store AST from API response

  // Handle form submission to create rule
  async function onSubmit(values: FormData) {
    console.log("Generated Rules:", values.rules);

    // Ensure rules are correctly formatted
    const cleanedRules = values.rules.map(rule => rule.trim().replace(/^"(.*)"$/, '$1'));

    try {
        // Log the request payload for debugging
        const payload = { rules: cleanedRules };
        console.log("Payload to send:", JSON.stringify(payload));

        const response = await fetch("/api/combine_rules", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Send the cleaned rules array
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error generating AST:", errorData.error);
            return; // Early return if response is not OK
        }

        const data = await response.json();
        setAst(data); // Update state with AST response
        console.log("AST Response:", data);
    } catch (error) {
        console.error("Error generating AST:", error);
    }
}



  return (
    <div className="h-screen flex items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Combine Rules</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>Combine Rules</SheetTitle>
          </SheetHeader>

          {/* Form for Rule Combination */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`rules.${index}`} // Dynamic field name for each rule
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule String {index + 1}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter rule string" {...field} />
                      </FormControl>
                      <FormMessage />
                      <Button type="button" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" onClick={() => append("")}>
                Add Rule
              </Button>

              {/* Submit Button */}
              <Button type="submit">Combine Rules</Button>
            </form>
          </Form>

          {/* Display AST Response */}
          {ast && (
            <div className="mt-4 p-4 bg-gray-200 rounded-md">
              <h3 className="text-lg font-semibold">Generated AST:</h3>
              <pre>{JSON.stringify(ast, null, 2)}</pre>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CombineRuleForm;
